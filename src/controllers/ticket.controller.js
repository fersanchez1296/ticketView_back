import {
  TICKETS,
  ESTADOS,
  USUARIO,
  ROLES,
  PRIORIDADES,
  AREA,
} from "../models/index.js";
import mongoose from "mongoose";
import * as Gets from "../repository/gets.js";
import { postCrearTicket } from "../repository/posts.js";
import {
  putCerrarTicket,
  putNota,
  putReabrirTicket,
  putResolverTicket,
  putAceptarResolucion,
  putRechazarResolucion,
  putAsignarTicket,
  putTicketPendiente,
  contactarCliente,
  putEditarTicket,
  putTicketAbierto,
  putRetornarTicket,
  putPendingReason,
  putRetornarTicketaModerador,
} from "../repository/puts.js";
import { addHours } from "date-fns";
import exceljs from "exceljs";
import path from "path";
import fs from "fs";
import { __dirname, __filename } from "../config/config.js";
import { obtenerFechaActual, fechaDefecto } from "../utils/fechas.js";
const ObjectId = mongoose.Types.ObjectId;

export const getTickets = async (req, res, next) => {
  try {
    let result = [];
    const paramEstado = req.params.estado;
    const { rol, userId, areas } = req.session.user;
    const Estado = await Gets.getEstadoTicket(paramEstado);
    if (rol === "Usuario") {
      result = await Gets.getTicketsUsuario(userId, Estado);
    } else if (rol === "Moderador") {
      if (paramEstado === "NUEVOS") {
        result = await Gets.getTicketsNuevosModerador(userId, Estado);
      } else if (paramEstado === "REVISION") {
        result = await Gets.getTicketsRevision(areas, Estado);
      } else if (paramEstado === "REABIERTOS") {
        result = await Gets.getTicketsReabiertosModerador(userId, Estado);
      } else {
        result = await Gets.getTicketsModerador(userId, Estado);
      }
    } else {
      result = await Gets.getTicketsAdmin(Estado);
    }
    req.tickets = result;
    return result
      ? next()
      : res
        .status(500)
        .json({ desc: "Ocurrió un error al obtener los tickets." });
  } catch (error) {
    return res
      .status(500)
      .json({ desc: "Ocurrió un Error al obtener los tickets." });
  }
};

export const createTicket = async (req, res, next) => {
  const session = req.mongoSession;
  try {
    let ticketState = req.ticketState;
    if (!ticketState.Cliente) {
      await session.abortTransaction();
      session.endSession();
      return res
        .status(500)
        .json({ desc: "No se puedo guardar un ticket sin un cliente." });
    }
    const { userId, nombre, rol } = req.session.user;
    let Asignado = ticketState.Asignado_a;
    const AreaTicket = await Gets.getNombreAreaUsuario(Asignado);
    console.log("AreaTicket", AreaTicket);
    if (!AreaTicket) {
      console.log("Transaccion abortada.");
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ desc: "No se encontró el área del moderador." });
    }
    ticketState = {
      ...ticketState,
      Cliente: req.cliente ? req.cliente : ticketState.Cliente,
      Fecha_hora_creacion: obtenerFechaActual(),
      Fecha_limite_resolucion_SLA: req.Fecha_limite_resolucion_SLA,
      Fecha_limite_respuesta_SLA: addHours(
        obtenerFechaActual(),
        ticketState.tiempo
      ),
      Fecha_hora_ultima_modificacion: obtenerFechaActual(),
      Fecha_hora_cierre: fechaDefecto,
      Fecha_hora_resolucion: fechaDefecto,
      Fecha_hora_reabierto: fechaDefecto,
      Creado_por: userId,
      standby: ticketState.standby,
      PendingReason: ticketState.PendingReason,
      AreaTicket,
    };
    const RES = await postCrearTicket(
      ticketState,
      userId,
      nombre,
      rol,
      session
    );
    if (!RES) {
      console.log("Error al guardar ticket");
      console.log("Transaccion abortada");
      await session.abortTransaction();
      session.endSession();
      return res.status(500).json({ desc: "Error al guardar el ticket." });
    }
    req.ticketIdDb = RES._id;
    req.ticket = RES;
    req.channel = "channel_crearTicket";
    console.log("ticket guardado");
    return next();
  } catch (error) {
    console.error(error);
    if (session) {
      console.log("Transaccion abortada");
      await session.abortTransaction();
      session.endSession();
    }
    return res.status(500).json({ error: "Error al guardar el ticket" });
  }
};

export const asignarTicket = async (req, res, next) => {
  const session = req.mongoSession;
  try {
    const ticketId = req.params.id;
    const { userId, nombre, rol } = req.session.user;
    let ticketData = JSON.parse(req.body.ticketData);
    console.log("ticketData", ticketData)
    let Estado = "";
    let Moderador = "";
    let Asignado = ticketData.Asignado_a;
    if (ticketData.tiempo) {
      const tiempo = ticketData.tiempo;
      ticketData = {
        ...ticketData,
        Fecha_limite_resolucion_SLA: addHours(obtenerFechaActual(), tiempo),
        Fecha_limite_respuesta_SLA: addHours(obtenerFechaActual(), tiempo),
        Fecha_hora_cierre: fechaDefecto,
      };
      delete ticketData.tiempo;
    }
    const Area = await Gets.getAreaUsuario(Asignado);
    if (!Area) {
      console.log("Transaccion abortada.");
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ desc: "No se encontró el área del moderador." });
    }
    const AreaTicket = await Gets.getNombreAreaUsuario(Asignado);
    console.log("AreaTicket", AreaTicket);
    if (!AreaTicket) {
      console.log("Transaccion abortada.");
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ desc: "No se encontró el área del moderador." });
    }
    const rolUsuario = await Gets.getRolUsuario(Asignado);
    if (rolUsuario !== "Usuario") {
      Estado = await Gets.getEstadoTicket("NUEVOS");
    } else {
      Estado = await Gets.getEstadoTicket("ABIERTOS");
      const RolModerador = await Gets.getRolModerador("Moderador");
      Moderador = await Gets.getModeradorPorAreayRol(Area, RolModerador);
    }
    if (!Estado) {
      console.log("Transaccion abortada.");
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ desc: "No se encontró el estado Nuevo." });
    }
    const result = await putAsignarTicket(
      ticketId,
      Estado,
      ticketData,
      userId,
      nombre,
      rol,
      session,
      rolUsuario === "Usuario" ? Moderador : null,
      Asignado,
      AreaTicket
    );
    if (!result) {
      console.log("Transaccion abortada.");
      await session.abortTransaction();
      session.endSession();
      return res
        .status(400)
        .json({ desc: "Ocurrio un error al asignar el ticket." });
    }

    req.ticket = result;
    req.ticketIdDb = result._id;
    req.channel = "channel_asignarTicket";
    return next();
  } catch (error) {
    console.log("Transaccion abortada.");
    await session.abortTransaction();
    session.endSession();
    return res.status(500).json({
      desc: "Ocurrió un error al asignar el ticket. Error interno en el servidor.",
    });
  }
};

//TODO revisar
//agregar un middleware para buscar al usuario en el microservicio de usuarios
export const reasignarTicket = async (req, res, next) => {
  const sessionDB = await mongoose.startSession();
  sessionDB.startTransaction();
  const ticketId = req.params.id;
  console.log("ticketId", ticketId);
  const { userId, nombre, rol, correo } = req.session.user;
  function deleteCamposTiempo(body) {
    const {
      Prioridad,
      Fecha_limite_respuesta_SLA,
      Fecha_limite_resolucion_SLA,
      ...rest
    } = body;
    return rest;
  }
  function tiempoResolucion(body) {
    return {
      ...body,
      Fecha_limite_respuesta_SLA: addHours(
        obtenerFechaActual(),
        body.Fecha_limite_respuesta_SLA
      ),
      Fecha_limite_resolucion_SLA: addHours(
        obtenerFechaActual(),
        body.Fecha_limite_resolucion_SLA
      ),
    };
  }
  const reasignado = !req.body.Prioridad
    ? deleteCamposTiempo(req.body)
    : tiempoResolucion(req.body);
  try {
    let Reasignado = req.body.Reasignado_a;
    const AreaTicket = await Gets.getNombreAreaUsuario(Reasignado);
    if (!AreaTicket) {
      console.log("Transacción abortada");
      await sessionDB.abortTransaction();
      sessionDB.endSession();
      return res
        .status(500)
        .json({ desc: "Ocurrio un error al modificar el estado del ticket." });
    }
    const Estado = await ESTADOS.findOne({ Estado: "ABIERTOS" });
    if (!Estado) {
      await sessionDB.abortTransaction();
      sessionDB.endSession();
    }
    const result = await TICKETS.findOneAndUpdate(
      { _id: ticketId },
      {
        $set: {
          ...reasignado,
          Reasignado_a: [reasignado.Reasignado_a],
          Fecha_hora_ultima_modificacion: obtenerFechaActual(),
          Estado,
          vistoBueno: reasignado.vistoBueno,
          AreaTicket,
        },
        $push: {
          Historia_ticket: {
            Nombre: userId,
            Titulo: "Ticket Reasignado",
            Mensaje: `El ticket ha sido reasignado a ${reasignado.Nombre} por ${nombre} - ${rol}`,
            Fecha: obtenerFechaActual(),
          },
        },
      },
      { returnDocument: "after", new: true, sessionDB }
    );
    if (result) {
      const formatedTickets = await TICKETS.populate(result, [
        {
          path: "Cliente",
          select: "Nombre Correo Telefono Ubicacion _id Extension",
          populate: [
            { path: "Dependencia", select: "Dependencia _id" },
            { path: "Direccion_General", select: "Direccion_General _id" },
            { path: "direccion_area", select: "direccion_area _id" },
          ],
        },
      ]);
      if (!formatedTickets) {
        await sessionDB.abortTransaction();
        sessionDB.endSession();
      }
      const correoData = {
        correo,
        correoResol: reasignado.Correo,
        idTicket: formatedTickets.Id,
        descripcionTicket: formatedTickets.Descripcion,
        correoCliente: formatedTickets.Cliente.Correo,
        nombreCliente: formatedTickets.Cliente.Nombre,
        telefonoCliente: formatedTickets.Cliente.Telefono,
        extensionCliente: formatedTickets.Cliente.Extension,
        ubicacion: formatedTickets.Cliente.Ubicacion,
        area: formatedTickets.Cliente.direccion_area.direccion_area ?? "",
      };
      req.channel = "channel_reasignarTicket";
      req.correoData = correoData;
      await sessionDB.commitTransaction();
      sessionDB.endSession();
      next();
    } else {
      await sessionDB.abortTransaction();
      sessionDB.endSession();
      return res
        .status(500)
        .json({ desc: "Ocurrio un error al reasignar el ticket." });
    }
  } catch (error) {
    await sessionDB.abortTransaction();
    sessionDB.endSession();
    return res.status(500).json({
      desc: "Ocurrio un error al reasignar el ticket. Error interno en el servidor.",
    });
  }
};

export const resolverTicket = async (req, res, next) => {
  const session = req.mongoSession;
  try {
    const { userId, nombre, rol } = req.session.user;
    const ticketData = JSON.parse(req.body.ticketData);
    const ticketId = ticketData._id;
    let Estado = "";
    if (rol === "Usuario" && ticketData.vistoBueno === true) {
      Estado = await Gets.getEstadoTicket("REVISION");
    } else {
      Estado = await Gets.getEstadoTicket("RESUELTOS");
      ticketData.Reasignado_a = userId;
    }
    if (!Estado) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ desc: "No se encontró el estado." });
    }

    const result = await putResolverTicket(
      userId,
      Estado,
      nombre,
      rol,
      ticketId,
      ticketData,
      session
    );
    if (!result) {
      await session.abortTransaction();
      session.endSession();
      return res
        .status(500)
        .json({ desc: "Ocurrió un error al resolver el ticket." });
    }
    req.vistoBueno = ticketData.vistoBueno;
    req.userId = userId;
    req.Fecha_hora_resolucion = result.Fecha_hora_resolucion;
    req.Fecha_limite_resolucion_SLA = result.Fecha_limite_resolucion_SLA;
    req.ticketIdDb = result._id;
    return next();
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    return res.status(500).json({
      desc: "Ocurrio un error al resolver el ticket. Error interno en el servidor.",
    });
  }
};

export const aceptarResolucion = async (req, res, next) => {
  const session = req.mongoSession;
  try {
    const ticketId = req.params.id;
    const { Nombre } = req.body; //nombre del resolutor
    const { userId, nombre, rol } = req.session.user;
    const Estado = await ESTADOS.findOne({ Estado: "RESUELTOS" });
    if (!Estado) {
      return res.status(404).json({ desc: "No se encontró el estado." });
    }
    const result = await putAceptarResolucion(
      ticketId,
      Estado,
      Nombre,
      userId,
      nombre,
      rol,
      session
    );
    if (!result) {
      await session.abortTransaction();
      session.endSession();
    }
    req.vistoBueno = result.vistoBueno;
    req.userId = result.Resuelto_por._id;
    req.Fecha_hora_resolucion = result.Fecha_hora_resolucion;
    req.Fecha_limite_resolucion_SLA = result.Fecha_limite_resolucion_SLA;
    return next();
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    return res.status(500).json({ desc: "Error interno en el servidor." });
  }
};

export const rechazarResolucion = async (req, res, next) => {
  const session = req.mongoSession;
  try {
    const ticketId = req.params.id;
    const ticketData = JSON.parse(req.body.ticketData);
    const { Nombre, feedback } = ticketData; //nombre del resolutor
    const { userId, nombre, rol } = req.session.user;
    const Estado = await ESTADOS.findOne({ Estado: "ABIERTOS" });
    if (!Estado) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ desc: "No se encontró el estado." });
    }
    const result = await putRechazarResolucion(
      ticketId,
      Estado,
      Nombre, //nombre del resolutor
      feedback,
      userId,
      nombre,
      rol,
      session
    );
    if (!result) {
      await session.abortTransaction();
      session.endSession();
      return res
        .status(500)
        .json({ desc: "Ocurrió un error al actualizar el ticket." });
    }
    req.ticket = result;
    req.ticketIdDb = result._id;
    return next();
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    return res.status(500).json({ desc: "Error interno en el servidor." });
  }
};

export const cerrarTicket = async (req, res, next) => {
  const session = req.mongoSession;
  try {
    const { userId, nombre, rol } = req.session.user;
    const ticketData = JSON.parse(req.body.ticketData);
    const ticketId = req.params.id;
    const Estado = await Gets.getEstadoTicket("CERRADOS");
    if (!Estado) {
      await session.abortTransaction();
      session.endSession();
      return res
        .status(404)
        .json({ desc: "No se encontró el estado del ticket." });
    }
    const result = await putCerrarTicket(
      ticketId,
      Estado,
      userId,
      nombre,
      rol,
      ticketData,
      session
    );
    if (!result) {
      await session.abortTransaction();
      session.endSession();
      return res
        .status(500)
        .json({ desc: "Ocurrió un error al modificar el ticket." });
    }
    //req.ticketIdDb = result._id;
    req.cuerpo = result.Descripcion_cierre;
    req.ticketId = result.Id;
    req.endpoint = "cerrarTicket";
    return next();
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    return res.status(500).json({
      desc: "Ocurrio un error al cerrar el ticket. Error interno en el servidor.",
    });
  }
};

export const reabrirTicket = async (req, res, next) => {
  const session = req.mongoSession;
  try {
    const ticketId = req.params.id;
    let ticketData = req.ticketData;
    ticketData.Area = req.areaUsuario;
    const { userId, nombre, rol } = req.session.user;
    const Estado = await Gets.getEstadoTicket("REABIERTOS");
    if (!Estado) {
      console.log("Transaccion abortada.");
      await session.abortTransaction();
      session.endSession();
      return res
        .status(404)
        .json({ desc: "No se encontró el estado reabierto." });
    }
    if (req.rolUsuario === "Usuario") {
      ticketData.Asignado_a = [ticketData.Asignado_a];
      ticketData.Reasignado_a = [ticketData.Asignado_a];
    } else {
      ticketData.Asignado_a = [ticketData.Asignado_a];
    }
    const result = await putReabrirTicket(
      ticketId,
      Estado,
      ticketData,
      userId,
      nombre,
      rol,
      session
    );
    if (!result) {
      console.log("Transaccion abortada.");
      await session.abortTransaction();
      session.endSession();
      return res
        .status(400)
        .json({ desc: "Ocurrio un error al reabrir el ticket." });
    }
    req.ticket = result;
    req.ticketIdDb = result._id;
    req.channel = "channel_reabrirTicket";
    return next();
  } catch (error) {
    console.log(error);
    console.log("Transaccion abortada.");
    await session.abortTransaction();
    session.endSession();
    return res.status(500).json({
      desc: "Ocurrió un error al reabrir el ticket. Error interno en el servidor.",
    });
  }
};

//TODO falta de agregar al repositorio (puts)
export const editTicket = async (req, res, next) => {
  const session = req.mongoSession;
  try {
    const ticketData = JSON.parse(req.body.ticketData);
    const ticketId = req.params.id;
    const { userId, nombre, rol } = req.session.user;
    const result = await putEditarTicket(
      ticketId,
      ticketData,
      session,
      userId,
      nombre,
      rol
    );
    if (!result) {
      await session.abortTransaction();
      session.endSession();
      return res.status(500).json({ desc: "Error al editar el ticket" });
    }
    req.ticket = result;
    req.ticketIdDb = result._id;
    return next();
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    return res.status(500).json({ desc: "Error interno en el servidor" });
  }
};

export const crearNota = async (req, res, next) => {
  const session = req.mongoSession;
  try {
    const { userId, rol } = req.session.user;
    const ticketData = JSON.parse(req.body.ticketData);
    const Nota = ticketData.Nota;
    const ticketId = req.params.id;

    const result = await putNota(userId, ticketId, Nota, session);
    if (!result) {
      await session.abortTransaction();
      session.endSession();
      return res
        .status(500)
        .json({ desc: "Ocurrio un error al guardar la nota en el ticket." });
    }
    req.channel = "channel_notas";
    req.ticketIdDb = result._id;
    req.ticket = result;
    req.Nota = Nota;
    return next();
  } catch (error) {
    console.log("Transacción abortada");
    await session.abortTransaction();
    session.endSession();
    return res.status(500).json({
      desc: "Ocurrió un error al agrear la nota. Error interno en el servidor.",
    });
  }
};

export const ponerPendingReason = async (req, res, next) => {
  const session = req.mongoSession;
  try {
    const { userId } = req.session.user;
    const { PendingReason } = req.body;
    const _id = req.params.id;
    const result = await putPendingReason(userId, _id, PendingReason, session);
    if (!result) {
      await session.abortTransaction();
      session.endSession();
      return res
        .status(500)
        .json({ desc: "Ocurrio un error al guardar la nota en el ticket." });
    }
    req.ticketIdDb = result._id;
    return next();
  } catch (error) {
    console.log("Transacción abortada");
    await session.abortTransaction();
    session.endSession();
    return res.status(500).json({
      desc: "Ocurrió un error al agrear la nota. Error interno en el servidor.",
    });
  }
};

export const retornarTicket = async (req, res, next) => {
  const session = req.mongoSession;
  try {
    const { userId } = req.session.user;
    const ticketData = JSON.parse(req.body.ticketData);
    const descripcion_retorno = ticketData.descripcion_retorno;
    const ticketId = req.params.id;
    const Estado = await Gets.getEstadoTicket("STANDBY");
    if (!Estado) {
      console.log("Transacción abortada");
      await session.abortTransaction();
      session.endSession();
      return res
        .status(500)
        .json({ desc: "Ocurrio un error al modificar el estado del ticket." });
    }
    let Nombre = "Mesa de Servicio";
    const AreaTicket = await Gets.getAreaPorNombre(Nombre);
    if (!AreaTicket) {
      console.log("Transacción abortada");
      await session.abortTransaction();
      session.endSession();
      return res
        .status(500)
        .json({ desc: "Ocurrio un error al modificar el estado del ticket." });
    }
    const result = await putRetornarTicket(
      userId,
      ticketId,
      descripcion_retorno,
      Estado,
      session,
      AreaTicket
    );
    if (!result) {
      await session.abortTransaction();
      session.endSession();
      return res.status(500).json({
        desc: "Ocurrio un error al retornar el ticket a mesa de servicio.",
      });
    }
    req.ticketIdDb = result._id;
    return next();
  } catch (error) {
    console.log("Transacción abortada");
    await session.abortTransaction();
    session.endSession();
    return res.status(500).json({
      desc: "Ocurrió un error al retornar el ticket a mesa de servicio. Error interno en el servidor.",
    });
  }
};

export const retornarTicketaModerador = async (req, res, next) => {
  const session = req.mongoSession;
  try {
    const { userId } = req.session.user;
    const ticketData = JSON.parse(req.body.ticketData);
    const descripcion_retorno = ticketData.descripcion_retorno;
    const ticketId = req.params.id;
    const ticket = await Gets.getTicketpor_id(ticketId);
    let Asignado = ticket.Asignado_a;
    const AreaTicket = await Gets.getNombreAreaUsuario(Asignado);
    if (!AreaTicket) {
      console.log("Transacción abortada");
      await session.abortTransaction();
      session.endSession();
      return res
        .status(500)
        .json({ desc: "Ocurrio un error al modificar el estado del ticket." });
    }
    const Estado = await Gets.getEstadoTicket("NUEVOS");
    if (!Estado) {
      console.log("Transacción abortada");
      await session.abortTransaction();
      session.endSession();
      return res
        .status(500)
        .json({ desc: "Ocurrio un error al modificar el estado del ticket." });
    }
    const result = await putRetornarTicketaModerador(
      userId,
      ticketId,
      descripcion_retorno,
      Estado,
      session,
      AreaTicket
    );
    if (!result) {
      await session.abortTransaction();
      session.endSession();
      return res.status(500).json({
        desc: "Ocurrio un error al retornar el ticket a mesa de servicio.",
      });
    }
    req.ticketIdDb = result._id;
    return next();
  } catch (error) {
    console.log("Transacción abortada");
    await session.abortTransaction();
    session.endSession();
    return res.status(500).json({
      desc: "Ocurrió un error al retornar el ticket a mesa de servicio. Error interno en el servidor.",
    });
  }
};

export const areasAsignacion = async (req, res) => {
  try {
    const moderador = await ROLES.findOne({ Rol: "Moderador" });
    const administrador = await ROLES.findOne({ Rol: "Administrador" });
    const AREAS = await Gets.getAreasParaAsignacion();
    const prioridades = await Gets.getPrioridades();
    if (!AREAS) {
      return res.status(404).json({ desc: "No se encontraron áreas" });
    }
    const AREASRESOLUTORES = await Promise.all(
      AREAS.map(async (area) => {
        const RESOLUTOR = await Gets.getResolutoresParaAsignacionPorArea(
          area._id,
          moderador,
          administrador
        );
        return {
          area: { area: area.Area, _id: area._id },
          resolutores: RESOLUTOR,
        };
      })
    );
    if (!AREASRESOLUTORES) {
      return res.status(404).json({ desc: "No se encontraron resolutores" });
    }
    res.status(200).json({ AREASRESOLUTORES, prioridades });
  } catch (error) {
    console.error("Error al obtener áreas y resolutores:", error);
    res.status(500).json({ message: "Error al obtener áreas y resolutores" });
  }
};

export const areasReasignacion = async (req, res) => {
  const { areas } = req.session.user;
  try {
    const moderador = await ROLES.findOne({ Rol: "Moderador" });
    const administrador = await ROLES.findOne({ Rol: "Administrador" });
    const AREAS = await Gets.getAreasParaReasignacion(areas);
    const prioridades = await Gets.getPrioridades();
    if (!AREAS) {
      return res.status(404).json({ desc: "No se encontraron áreas" });
    }
    const AREASRESOLUTORES = await Promise.all(
      AREAS.map(async (area) => {
        const RESOLUTOR = await Gets.getResolutoresParaReasignacionPorArea(
          area._id
        );
        return {
          area: { area: area.Area, _id: area._id },
          resolutores: RESOLUTOR,
        };
      })
    );
    if (!AREASRESOLUTORES) {
      return res.status(404).json({ desc: "No se encontraron resolutores" });
    }
    res.status(200).json({ AREASRESOLUTORES, prioridades });
  } catch (error) {
    console.error("Error al obtener áreas y resolutores:", error);
    res.status(500).json({ message: "Error al obtener áreas y resolutores" });
  }
};

export const getInfoSelects = async (req, res) => {
  try {
    const roles = await ROLES.find({ Rol: { $ne: "Auditor" } });
    const rolesMap = roles.reduce((acc, role) => {
      acc[role.Rol] = role._id;
      return acc;
    }, {});
    const moderador = rolesMap["Moderador"];
    const root = rolesMap["Root"];
    const administrador = rolesMap["Administrador"];
    const usuario = rolesMap["Usuario"];
    const RES = await Gets.getInfoSelectsCrearTicket(
      moderador,
      root,
      administrador,
      usuario
    );
    if (!RES) {
      return res.status(404).json({ desc: "No se encontró información" });
    }
    return res.status(200).json(RES);
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).json({ error: "Error fetching data" });
  }
};

export const obtenerAreas = async (req, res) => {
  try {
    const AREAS = await Gets.getAreas();
    if (!AREAS) {
      return res.status(400).json({ desc: "No se encontraron areas" });
    }
    return res.status(200).json({ areas: AREAS, tickets: [] });
  } catch (error) {
    return res.status(500).json({ desc: "Error interno en el servidor" });
  }
};

export const obtenerTicketsPorArea = async (req, res, next) => {
  const area = req.query.area;
  try {
    const TICKETS = await Gets.getTicketsPorArea(area);
    if (!TICKETS) {
      return res.status(400).json({ desc: "No se encontraron areas." });
    }
    req.tickets = TICKETS;
    return next();
  } catch (error) {
    console.error("Error al obtener los tickets:", error);
    res.status(500).json({ message: "Error al obtener los datos" });
  }
};
//TODO este debe estar en usuarios
export const obtenerAreasModerador = async (req, res, next) => {
  const { Area } = req.session.user;
  try {
    const AREAS = await Gets.getAreasModerador(Area);
    if (!AREAS) {
      return res.send(404).json({ desc: "No se encontrarón areas." });
    }
    return res.status(200).json({ areas: AREAS });
  } catch (error) {
    return res.status(500).json({ desc: "Error interno en el servidor" });
  }
};

export const buscarTicket = async (req, res, next) => {
  const { id } = req.params;

  try {
    const RES = await Gets.getTicketPorID(id);
    if (!RES) {
      return res.status(404).json({
        desc: "No se encontro el numero de ticket en la base de datos",
      });
    }
    req.tickets = RES;
    return next();
  } catch (error) {
    return res.status(500).json({ desc: "Error interno en el servidor" });
  }
};

export const reabrirFields = async (req, res) => {
  try {
    //const rolId = await ROLES.findOne({ Rol: "Moderador" });
    const [prioridades, areas] = await Promise.all([
      PRIORIDADES.find(),
      AREA.find(),
    ]);

    const moderadores = await Promise.all(
      areas.map(async (area) => {
        const resolutor = await USUARIO.find({
          Area: new ObjectId(area._id),
          isActive: true,
          Nombre: { $ne: "Mesa de Servicio" },
          // Rol: new ObjectId(rolId),
        }).select("Nombre");
        return {
          area: { area: area.Area, _id: area._id },
          resolutores: resolutor,
        };
      })
    );

    if (!prioridades && !moderadores) {
      return res
        .status(404)
        .json({ desc: "No se encontrarón prioridades o moderadores" });
    }

    return res.status(200).json({ prioridades, moderadores });
  } catch (error) {
    return res.status(500).json({
      desc: "Ocurrio un error al obtener los campos para la ventana de reasignar. Error interno en el servidor.",
    });
  }
};

export const exportTicketsToExcel = async (req, res) => {
  try {
    const allTickets = await TICKETS.find();
    // 1️⃣ Obtener todos los tickets con populate
    const tickets = await TICKETS.populate(allTickets, [
      {
        path: "Subcategoria",
        populate: [{ path: "Equipo", select: "Area _id" }],
      },
      { path: "Estado" },
      {
        path: "Asignado_a",
        select: "Nombre Correo _id",
        populate: [{ path: "Area", select: "Area _id" }],
      },
      {
        path: "Reasignado_a",
        select: "Nombre Correo _id",
        populate: [{ path: "Area", select: "Area _id" }],
      },
      {
        path: "Resuelto_por",
        select: "Nombre Correo _id",
        populate: [{ path: "Area", select: "Area _id" }],
      },
      {
        path: "Creado_por",
        select: "Nombre Correo _id",
        populate: [{ path: "Area", select: "Area _id" }],
      },
      { path: "Area_reasignado_a", select: "Area _id" },
      { path: "Cerrado_por", select: "Nombre Area _id" },
      {
        path: "Resuelto_por",
        select: "Nombre Correo _id",
        populate: [{ path: "Area", select: "Area _id" }],
      },
      {
        path: "Cliente",
        select: "Nombre Correo Telefono Ubicacion _id",
        populate: [
          { path: "Dependencia", select: "Dependencia _id" },
          { path: "Direccion_General", select: "Direccion_General _id" },
          { path: "direccion_area", select: "direccion_area _id" },
        ],
      },
    ]);

    if (!tickets.length) {
      return res.status(404).json({ message: "No hay tickets disponibles." });
    }

    // 2️⃣ Crear un nuevo libro de Excel
    const workbook = new exceljs.Workbook();
    const worksheet = workbook.addWorksheet("Tickets");

    // 3️⃣ Definir las columnas del archivo Excel
    worksheet.columns = [
      { header: "ID", key: "Id", width: 25 },
      { header: "Fecha Creacion", key: "Fecha_creacion", width: 25 },
      { header: "Fecha Cierre", key: "Fecha_hora_cierre", width: 25 },
      { header: "Oficio recepcion", key: "NumeroRec_Oficio", width: 25 },
      { header: "Oficio cierre", key: "Numero_Oficio", width: 25 },
      { header: "Estado", key: "Estado", width: 25 },
      { header: "Area", key: "Area", width: 25 },
      { header: "Tipo incidencia", key: "Tipo_incidencia", width: 25 },
      { header: "Servicio", key: "Servicio", width: 25 },
      { header: "Categoría", key: "Categoria", width: 25 },
      { header: "Subcategoría", key: "Subcategoria", width: 25 },
      { header: "Descripcion", key: "Descripcion", width: 25 },
      { header: "Prioridad", key: "Prioridad", width: 25 },
      { header: "Fecha limite de resolucion", key: "Fecha_lim_res", width: 25 },
      { header: "Creado por", key: "Creado_por", width: 25 },
      { header: "Area creado por", key: "Area_creado_por", width: 25 },
      { header: "Asignado a", key: "Asignado_a", width: 25 },
      { header: "Area asignado", key: "Area_asignado", width: 25 },
      { header: "Reasignado a", key: "Reasignado_a", width: 25 },
      { header: "Area reasignado", key: "Area_reasignado_a", width: 25 },
      {
        header: "Respuesta cierre reasignado",
        key: "Respuesta_cierre_reasignado",
        width: 25,
      },
      { header: "Resuelto_por", key: "Resuelto_por", width: 25 },
      { header: "Area resuelto por", key: "Area_resuelto_por", width: 25 },
      { header: "Cliente", key: "Cliente", width: 25 },
      { header: "Correo cliente", key: "Correo_cliente", width: 25 },
      { header: "Telefono cliente", key: "Telefono_cliente", width: 25 },
      { header: "Extension cliente", key: "Extension_cliente", width: 25 },
      { header: "Ubicacion cliente", key: "Ubicacion_cliente", width: 25 },
      { header: "Dependencia cliente", key: "Dependencia_cliente", width: 25 },
      {
        header: "Direccion general cliente",
        key: "DireccionG_cliente",
        width: 25,
      },
      {
        header: "Direccion de area cliente",
        key: "DireccionA_cliente",
        width: 25,
      },
    ];

    // 4️⃣ Agregar los datos de los tickets
    tickets.forEach((ticket) => {
      worksheet.addRow({
        Id: ticket.Id || "",
        Fecha_creacion: ticket.Fecha_hora_creacion || "",
        Fecha_hora_cierre: ticket.Fecha_hora_cierre || "",
        NumeroRec_Oficio: ticket.NumeroRec_Oficio || "",
        Numero_Oficio: ticket.Numero_Oficio || "",
        Estado: ticket.Estado?.Estado || "",
        Area: ticket.Subcategoria?.Equipo.Area || "",
        Tipo_incidencia: ticket.Subcategoria?.Tipo || "",
        Servicio: ticket.Subcategoria?.Servicio || "",
        Categoria: ticket.Subcategoria?.["Categoría"] || "",
        Subcategoria: ticket.Subcategoria?.Subcategoria || "",
        Descripcion: ticket.Descripcion || "",
        Prioridad:ticket.Subcategoria?.Descripcion_prioridad || "",
        Fecha_lim_res: ticket.Fecha_limite_resolucion_SLA || "",
        Creado_por: ticket.Creado_por?.Nombre || "",
        Area_creado_por: Array.isArray(ticket.Creado_por?.Area)
          ? ticket.Creado_por.Area[0]?.Area
          : "",
        Asignado_a: ticket.Asignado_a?.Nombre || "",
        Area_asignado: Array.isArray(ticket.Asignado_a?.Area)
          ? ticket.Asignado_a?.Area[0]?.Area
          : "",
        Reasignado_a: ticket.Reasignado_a?.Nombre || "",
        Area_reasignado_a: Array.isArray(ticket.Reasignado_a?.Area)
          ? ticket.Reasignado_a?.Area[0]?.Area
          : "",
        Respuesta_cierre_reasignado: ticket.Respuesta_cierre_reasignado || "",
        Resuelto_por: ticket.Resuelto_por?.Nombre || "",
        Area_resuelto_por: Array.isArray(ticket.Resuelto_por?.Area)
          ? ticket.Resuelto_por?.Area[0]?.Area
          : "",
        Cliente: ticket.Cliente?.Nombre || "",
        Correo_cliente: ticket.Cliente?.Nombre || "",
        Telefono_cliente: ticket.Cliente?.Telefono || "",
        Extension_cliente: ticket.Cliente?.Extension || "",
        Ubicacion_cliente: ticket.Cliente?.Ubicacion || "",
        Dependencia_cliente: ticket.Cliente?.Dependencia?.Dependencia || "",
        DireccionG_cliente:
          ticket.Cliente?.Direccion_General?.Direccion_General || "",
        DireccionA_cliente:
          ticket.Cliente?.direccion_area?.direccion_area || "",
      });
    });
    const uploadPath = path.join(__dirname, "src", "temp");
    // 5️⃣ Guardar el archivo temporalmente en el servidor
    const filePath = `${uploadPath}_${Date.now()}.xlsx`;
    await workbook.xlsx.writeFile(filePath);

    // 6️⃣ Enviar el archivo como respuesta para su descarga
    res.download(filePath, "tickets.xlsx", (err) => {
      if (err) {
        console.error("Error al descargar el archivo:", err);
        res.status(500).json({ message: "Error al generar el archivo Excel" });
      }

      // Borrar el archivo después de la descarga
      fs.unlinkSync(filePath);
    });
  } catch (error) {
    console.error("Error al generar el Excel:", error);
    return res.status(500).json({ message: "Error interno del servidor" });
  }
};

export const pendienteTicket = async (req, res, next) => {
  const session = req.mongoSession;
  try {
    console.log(req.body);
    const { cuerpo } = JSON.parse(req.body.ticketData);
    const ticketId = req.params.id;
    const { userId, nombre, rol } = req.session.user;
    const Estado = await Gets.getEstadoTicket("PENDIENTES");
    const result = await putTicketPendiente(
      ticketId,
      Estado,
      cuerpo,
      userId,
      nombre,
      rol,
      session
    );
    if (!result) {
      await session.abortTransaction();
      session.endSession();
      return res
        .status(500)
        .json({ message: "Error al cambiar el estado del ticket." });
    }
    req.cuerpo = cuerpo;
    req.ticketId = result.Id;
    req.endpoint = "contactoCliente";
    return next();
  } catch (error) {
    console.log(error);
    await session.abortTransaction();
    session.endSession();
    return res.status(500).json({ desc: "Error interno del servidor" });
  }
};

//Controlador para traer los clientes por dependencia
export const dependenciasClientes = async (req, res) => {
  try {
    const DEPENDENCIAS = await Gets.getDependencias();
    if (!DEPENDENCIAS) {
      return res.status(404).json({ desc: "No se encontraron dependencias" });
    }
    const DEPENDENCIASCLIENTES = await Promise.all(
      DEPENDENCIAS.map(async (Dependencia) => {
        const CLIENTES = await Gets.getClientesPorDependencia(Dependencia._id);
        return {
          Dependencia: {
            Dependencia: Dependencia.Dependencia,
            _id: Dependencia._id,
          },
          clientes: CLIENTES,
        };
      })
    );
    return res.status(200).json(DEPENDENCIASCLIENTES);
  } catch (error) {
    return res.status(500).json({ message: "Error interno del servidor" });
  }
};

export const encontartTicket = async (req, res, next) => {
  const { id } = req.params;

  try {
    const RES = await Gets.getTicketpor_id(id);
    if (!RES) {
      return res.status(404).json({
        desc: "No se encontro el numero de ticket en la base de datos",
      });
    }
    req.tickets = RES;
    return next();
  } catch (error) {
    console.log(error);
    return res.status(500).json({ desc: "Error interno en el servidor" });
  }
};

export const populateCorreos = async (req, res, next) => {
  try {
    const POPULATE = await TICKETS.populate(req.tickets, [
      { path: "Asignado_a", select: "Nombre Correo Coordinacion Area _id" },
      {
        path: "Cliente",
        select: "Nombre Correo Telefono Ubicacion _id",
        populate: [
          { path: "Dependencia", select: "Dependencia _id" },
          { path: "Direccion_General", select: "Direccion_General _id" },
          { path: "direccion_area", select: "direccion_area _id" },
        ],
      },
    ]);
    if (!POPULATE) {
      console.log("error en populate");
      return res.status(500).json({ desc: "Error al procesar los tickets." });
    }
    req.tickets = POPULATE;
    return next();
  } catch (error) {
    return res.status(500).json({ desc: "Error al formatear los tickets." });
  }
};

export const regresarcorreos = async (req, res) => {
  const Datos = req.tickets;
  try {
    if (!Datos) {
      return res.status(404).json({
        desc: "No se encontro el numero de ticket en la base de datos",
      });
    }
    const CORREOS = {
      correoCliente: Datos.Cliente.Correo,
      //correoModerador: Datos.Asignado_a[0].Correo,
      correoMesa: process.env.SMTP_USERNAME,
    };
    return res.status(200).json(CORREOS);
  } catch (error) {
    return res.status(500).json({ desc: "Error interno en el servidor" });
  }
};

export const regresarTicket = async (req, res, next) => {
  const session = req.mongoSession;
  try {
    const ticketId = req.params.id;
    const { userId, nombre, rol } = req.session.user;
    const ticketData = JSON.parse(req.body.ticketData);
    const { Descripcion_respuesta_cliente } = ticketData;
    const Estado = await Gets.getEstadoTicket("ABIERTOS");
    if (!Estado) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ desc: "No se encontro el estado" });
    }
    const result = await putTicketAbierto(
      ticketId,
      Estado,
      Descripcion_respuesta_cliente,
      userId,
      nombre,
      rol,
      session
    );
    if (!result) {
      await session.abortTransaction();
      session.endSession();
      return res.status(500).json({ desc: "No se actualizo el ticket." });
    }
    req.ticket = result;
    req.ticketIdDb = result._id;
    req.channel = "channel_regresarTicket";
    return next();
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    return res.status(500).json({ desc: "Error interno en el servidor" });
  }
};

export const obtenerTicketsResolutor = async (req, res, next) => {
  try {
    const userId = req.params.id;
    const result = await Gets.ticketsResolutor(userId);
    if (!result) {
      console.log("error");
      return res
        .status(400)
        .json({ desc: "Error al obtener los ticket del resolutor." });
    }
    req.tickets = result;
    return next();
  } catch (error) {
    return res.status(500).json({
      desc: "Error al obtener los tickets del resolutor. Error interno en el servidor.",
    });
  }
};

export const contactoCliente = async (req, res, next) => {
  const session = req.mongoSession;
  try {
    const { cuerpo } = JSON.parse(req.body.ticketData);
    const ticketId = req.params.id;
    const { userId, nombre, rol } = req.session.user;
    const result = await contactarCliente(
      ticketId,
      cuerpo,
      userId,
      nombre,
      rol,
      session
    );
    if (!result) {
      await session.abortTransaction();
      session.endSession();
      return res
        .status(500)
        .json({ message: "Error al contactar al cliente." });
    }
    req.cuerpo = cuerpo;
    req.ticketId = result.Id;
    req.endpoint = "contactoCliente";
    return next();
  } catch (error) {
    console.log(error);
    await session.abortTransaction();
    session.endSession();
    return res.status(500).json({ message: "Error interno del servidor" });
  }
};
