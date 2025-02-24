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
  putEditarTicket,
  putTicketAbierto,
} from "../repository/puts.js";
import { addHours } from "date-fns";
import { toZonedTime } from "date-fns-tz";
import exceljs from "exceljs";
import path from "path";
import fs from "fs";
import { __dirname, __filename } from "../config/config.js";
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
  if (!session) {
    return res
      .status(500)
      .json({ error: "No hay sesión activa para la transacción." });
  }

  try {
    let ticketState = req.ticketState;
    const fechaActual = toZonedTime(new Date(), "America/Mexico_City");
    const { userId, nombre, rol, correo } = req.session.user;
    let Asignado_a = {};
    let Estado = {};
    if (ticketState.standby) {
      Estado = await Gets.getEstadoTicket("STANDBY");
      Asignado_a = await USUARIO.findOne({ Username: "standby" }).lean();
    } else {
      Asignado_a = ticketState.Asignado_a;
      Estado = await Gets.getEstadoTicket("NUEVOS");
    }

    ticketState = {
      ...ticketState,
      Cliente: req.cliente ? req.cliente : ticketState.Cliente,
      Estado,
      Fecha_hora_creacion: fechaActual,
      Fecha_limite_resolucion_SLA: addHours(fechaActual, ticketState.tiempo),
      Fecha_limite_respuesta_SLA: addHours(fechaActual, ticketState.tiempo),
      Fecha_hora_ultima_modificacion: new Date("1900-01-01T18:51:03.980+00:00"),
      Fecha_hora_cierre: new Date("1900-01-01T18:51:03.980+00:00"),
      Creado_por: userId,
      standby: ticketState.standby,
      Asignado_a: ticketState.standby ? Asignado_a._id : ticketState.Asignado_a,
      Area_asignado: ticketState.standby
        ? Asignado_a.Area[0]
        : ticketState.Area_asignado,
    };
    console.log("ticketstate", ticketState);
    const RES = await postCrearTicket(
      ticketState,
      userId,
      nombre,
      rol,
      session
    );
    console.log("ticketstate", RES);
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
    const fechaActual = toZonedTime(new Date(), "America/Mexico_City");
    const ticketId = req.params.id;
    const { userId, nombre, rol } = req.session.user;
    const ticketData = JSON.parse(req.body.ticketData);
    if (ticketData.tiempo) {
      const tiempo = ticketData.tiempo;
      ticketData = {
        ...ticketData,
        Fecha_limite_resolucion_SLA: addHours(fechaActual, tiempo),
        Fecha_limite_respuesta_SLA: addHours(fechaActual, tiempo),
        Fecha_hora_cierre: new Date("1900-01-01T18:51:03.980+00:00"),
      };
      delete ticketData.tiempo;
    }
    const Estado = await Gets.getEstadoTicket("NUEVOS");
    if (!Estado) {
      console.log("Transaccion abortada.");
      await session.abortTransaction();
      session.endSession();
      return res
        .status(404)
        .json({ desc: "No se encontró el estado reabierto." });
    }
    const result = await putAsignarTicket(
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
        .json({ desc: "Ocurrio un error al asignar el ticket." });
    }
    req.ticket = result;
    req.ticketIdDb = result._id;
    req.channel = "channel_crearTicket";
    return next();
  } catch (error) {
    console.log(error);
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
  const fechaActual = toZonedTime(new Date(), "America/Mexico_City");
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
        fechaActual,
        body.Fecha_limite_respuesta_SLA
      ),
      Fecha_limite_resolucion_SLA: addHours(
        fechaActual,
        body.Fecha_limite_resolucion_SLA
      ),
    };
  }
  const reasignado = !req.body.Prioridad
    ? deleteCamposTiempo(req.body)
    : tiempoResolucion(req.body);
  try {
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
          Estado,
          vistoBueno: reasignado.vistoBueno,
        },
        $push: {
          Historia_ticket: {
            Nombre: userId,
            Mensaje: `El ticket ha sido reasignado a ${reasignado.Nombre} por ${nombre} - ${rol}`,
            Fecha: toZonedTime(new Date(), "America/Mexico_City"),
          },
        },
      },
      { returnDocument: "after", new: true, sessionDB }
    );
    if (result) {
      const formatedTickets = await TICKETS.populate(result, [
        {
          path: "Cliente",
          select: "Nombre Correo Telefono Ubicacion Extension _id",
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
    console.log(error);
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
    console.log(error);
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
      ticketData
    );
    if (!result) {
      await session.abortTransaction();
      session.endSession();
      return res
        .status(500)
        .json({ desc: "Ocurrió un error al modificar el ticket." });
    }
    req.ticket = result;
    req.ticketIdDb = result._id;
    req.channel = "channel_cerrarTicket";
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
    const fechaActual = toZonedTime(new Date(), "America/Mexico_City");
    const ticketId = req.params.id;
    const { userId, nombre, rol } = req.session.user;
    const ticketData = JSON.parse(req.body.ticketData);
    if (ticketData.tiempo) {
      const tiempo = ticketData.tiempo;
      ticketData = {
        ...ticketData,
        Fecha_limite_resolucion_SLA: addHours(fechaActual, tiempo),
        Fecha_limite_respuesta_SLA: addHours(fechaActual, tiempo),
        Fecha_hora_cierre: new Date("1900-01-01T18:51:03.980+00:00"),
      };
      delete ticketData.tiempo;
    }
    const Estado = await Gets.getEstadoTicket("REABIERTOS");
    if (!Estado) {
      console.log("Transaccion abortada.");
      await session.abortTransaction();
      session.endSession();
      return res
        .status(404)
        .json({ desc: "No se encontró el estado reabierto." });
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
    const { userId } = req.session.user;
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
    req.ticketIdDb = result._id;
    return next();
  } catch (error) {
    console.log(error);
    console.log("Transacción abortada");
    await session.abortTransaction();
    session.endSession();
    return res.status(500).json({
      desc: "Ocurrió un error al agrear la nota. Error interno en el servidor.",
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
    const moderador = await ROLES.findOne({ Rol: "Moderador" });
    const root = await ROLES.findOne({ Rol: "Root" });
    const administrador = await ROLES.findOne({ Rol: "Administrador" });
    const RES = await Gets.getInfoSelectsCrearTicket(
      moderador._id,
      root._id,
      administrador._id
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
    console.log(error);
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
    next();
  } catch (error) {
    console.error("Error al obtener los tickets:", error);
    res.status(500).json({ message: "Error al obtener los datos" });
  }
};

export const obtenerAreasModerador = async (req, res, next) => {
  const { Id, Area } = req.session.user;
  try {
    const AREAS = await Gets.getAreasModerador(Area);
    if (!AREAS) {
      return res.send(404).json({ desc: "No se encontrarón areas." });
    }
    return res.status(200).json({ areas: AREAS });
  } catch (error) {
    console.log(error);
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
    next();
  } catch (error) {
    console.log(error);
    return res.status(500).json({ desc: "Error interno en el servidor" });
  }
};

export const ticketsPorResolutor = async (req, res, next) => {
  try {
    const userId = req.params.userId;
    const result = await Gets.getTicketsPorUsuario(userId);
    if (!result) {
      return res
        .status(404)
        .json({ desc: "No se encontraron tickets para este usuario" });
    }
    req.tickets = result;
    return next();
  } catch (error) {
    console.log("error", error);
    return res.status(500).json({
      desc: "Ocurrio un error al obtener los ticket del usuario. Error interno en el servidor.",
    });
  }
};

export const reabrirFields = async (req, res) => {
  try {
    const rolId = await ROLES.findOne({ Rol: "Moderador" });
    const [prioridades, areas] = await Promise.all([
      PRIORIDADES.find(),
      AREA.find(),
    ]);

    const moderadores = await Promise.all(
      areas.map(async (area) => {
        const resolutor = await USUARIO.find({
          Area: new ObjectId(area._id),
          isActive: true,
          Rol: new ObjectId(rolId),
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
    console.log(error);
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
      { path: "Tipo_incidencia", select: "Tipo_de_incidencia _id" },
      { path: "Area_asignado", select: "Area _id" },
      { path: "Categoria", select: "Categoria _id" },
      { path: "Servicio", select: "Servicio _id" },
      { path: "Subcategoria", select: "Subcategoria _id" },
      { path: "Prioridad" },
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
        Tipo_incidencia: ticket.Tipo_incidencia?.Tipo_de_incidencia || "",
        Servicio: ticket.Servicio?.Servicio || "",
        Categoria: ticket.Categoria?.Categoria || "",
        Subcategoria: ticket.Subcategoria?.Subcategoria || "",
        Descripcion: ticket.Descripcion || "",
        Prioridad: ticket.Prioridad?.Descripcion || "",
        Fecha_lim_res: ticket.Fecha_limite_resolucion_SLA || "",
        Creado_por: ticket.Creado_por?.Nombre || "",
        Area_creado_por: ticket.Creado_por?.Area[0]?.Area || "",
        Asignado_a: ticket.Asignado_a?.Nombre || "",
        Area_asignado: ticket.Asignado_a?.Area[0]?.Area || "",
        Reasignado_a: ticket.Reasignado_a?.Nombre || "",
        Area_reasignado_a: ticket.Reasignado_a?.Area[0]?.Area || "",
        Respuesta_cierre_reasignado: ticket.Respuesta_cierre_reasignado || "",
        Resuelto_por: ticket.Resuelto_por?.Nombre || "",
        Area_resuelto_por: ticket.Resuelto_por?.Area[0]?.Area || "",
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
    const { DescripcionPendiente } = req.body;
    const ticketId = req.params.id;
    const { userId, nombre, rol } = req.session.user;
    const Estado = await Gets.getEstadoTicket("PENDIENTES");
    const result = await putTicketPendiente(
      ticketId,
      Estado,
      DescripcionPendiente,
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
        .json({ message: "Error al cambiar el estadio del ticket." });
    }
    return next();
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    return res.status(500).json({ message: "Error interno del servidor" });
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
    console.log("DEPENDENCIAS DE LOS CLIENTES", DEPENDENCIASCLIENTES);
    res.status(200).json(DEPENDENCIASCLIENTES);
  } catch (error) {
    console.error(
      "Error al obtener clientes agrupados por dependencia:",
      error
    );
    res.status(500).json({ message: "Error interno del servidor" });
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
    console.log("Ticket que se va poner como pendiente", RES);
    req.tickets = RES;
    next();
  } catch (error) {
    console.log(error);
    return res.status(500).json({ desc: "Error interno en el servidor" });
  }
};

export const populateCorreos = async (req, res, next) => {
  try {
    console.log("tickets en populate", req.tickets);
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
    console.log("POPULATE", POPULATE);
    req.tickets = POPULATE;
    next();
  } catch (error) {
    console.log(error);
    return res.status(500).json({ desc: "Error al formatear los tickets." });
  }
};

export const regresarcorreos = async (req, res) => {
  const Datos = req.tickets;
  console.log("DATOS", Datos);
  try {
    if (!Datos) {
      return res.status(404).json({
        desc: "No se encontro el numero de ticket en la base de datos",
      });
    }
    const CORREOS = {
      correoCliente: Datos.Cliente.Correo,
      correoModerador: Datos.Asignado_a.Correo,
      correoMesa: process.env.SMTP_USERNAME,
    };
    console.log("CORREOS", CORREOS);
    return res.status(200).json(CORREOS);
  } catch (error) {
    console.log(error);
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
