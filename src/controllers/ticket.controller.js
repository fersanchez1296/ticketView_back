import {
  TICKETS,
  ESTADOS,
  USUARIO,
  ROLES,
  CLIENTES,
  PRIORIDADES,
  AREA,
} from "../models/index.js";
import mongoose from "mongoose";
import * as Gets from "../repository/gets.js";
import { postCrearTicket } from "../repository/posts.js";
import {
  putEditarTicket,
  putNota,
  putReabrirTicket,
} from "../repository/puts.js";
import { addHours } from "date-fns";
import { toZonedTime } from "date-fns-tz";
const ObjectId = mongoose.Types.ObjectId;
// export const getTickets = async (req, res) => {
//   const page = parseInt(req.query.page) || 1;
//   const limit = parseInt(req.query.limit) || 10;
//   const skip = (page - 1) * limit;
//   try {
//     const results = await TICKETS.find().skip(skip).limit(limit);
//     const total = await TICKETS.countDocuments();
//     res.status(200).json({
//       data: results,
//       totalPages: Math.ceil(total / limit),
//       currentPage: page,
//     });
//   } catch (error) {
//     res.status(500).json({ message: "Error al obtener los datos" });
//   }
// };

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

export const resolverTicket = async (req, res) => {
  const sessionDB = await mongoose.startSession();
  sessionDB.startTransaction();
  const ticketId = req.params.id;
  const ticketData = req.ticketData;
  const { userId, rol, nombre, areas } = req.session.user;
  let estado;
  try {
    if (rol === "Usuario" && ticketData.vistoBueno) {
      [estado] = await ESTADOS.find({ Estado: "REVISION" });
    } else {
      [estado] = await ESTADOS.find({ Estado: "RESUELTOS" });
    }
    if (!estado) {
      return res
        .status(404)
        .json({ desc: "No se encontro el estado del ticket" });
    }

    const update = {
      $set: {
        Estado: estado._id,
        Resuelto_por: userId,
        Respuesta_cierre_reasignado: ticketData.Respuesta_cierre_reasignado,
      },
      $push: {
        Historia_ticket: {
          Nombre: userId,
          Mensaje:
            rol === "Usuario" && ticketData.vistoBueno
              ? `El ticket ha sido enviado a revisión por ${nombre}(${rol}). En espera de respuesta del moderador.\nDescripcion resolucion:\n${ticketData.Respuesta_cierre_reasignado}`
              : `El ticket ha sido resuelto por ${nombre}(${rol}).`,
          Fecha: toZonedTime(new Date(), "America/Mexico_City"),
        },
      },
    };

    if (req.dataArchivo) {
      update.$push.Files = {
        ...req.dataArchivo,
      };
    }

    if (rol != "Usuario") {
      update.$set = {
        ...update.$set,
        Reasignado_a: userId,
        Area_reasignado_a: ticketData.Area_reasignado_a,
      };
    }
    const result = await TICKETS.findOneAndUpdate({ _id: ticketId }, update, {
      returnDocument: "after",
      new: true,
      session: sessionDB,
    });
    await sessionDB.commitTransaction();
    sessionDB.endSession();
    if (result) {
      return res.status(200).json({
        desc: "El estado del ticket ha sido modificado exitosamente.",
      });
    } else {
      await sessionDB.abortTransaction();
      sessionDB.endSession();
      return res
        .status(500)
        .json({ desc: "Error al acutualizar el estado del ticket." });
    }
  } catch (error) {
    console.log(error);
    await sessionDB.abortTransaction();
    sessionDB.endSession();
    res.status(500).json({
      desc: "Ocurrio un error al resolver el ticket. Error interno en el servidor",
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

export const cerrarTicket = async (req, res, next) => {
  const sessionDB = await mongoose.startSession();
  sessionDB.startTransaction();
  const ticketId = req.params.id;
  const { Descripcion_cierre, Numero_Oficio, Causa } = req.ticketData;
  const { userId, nombre, rol, correo } = req.session.user;
  const fechaActual = toZonedTime(new Date(), "America/Mexico_City");
  try {
    const estado = await ESTADOS.findOneAndUpdate({ Estado: "CERRADOS" });
    const update = {
      $set: {
        Descripcion_cierre,
        Numero_Oficio,
        Causa,
        Estado: estado._id,
        Cerrado_por: userId,
        Fecha_hora_cierre: fechaActual,
      },
      $push: {
        Historia_ticket: {
          Nombre: userId,
          Mensaje: `El ticket fue cerrado por ${nombre}(${rol})`,
          Fecha: fechaActual,
        },
      },
    };

    if (req.dataArchivo) {
      update.$push.Files = {
        ...req.dataArchivo,
      };
    }
    const result = await TICKETS.findOneAndUpdate({ _id: ticketId }, update, {
      returnDocument: "after",
      new: true,
      sessionDB,
    });
    if (!result) {
      await sessionDB.abortTransaction();
      sessionDB.endSession();
      return res.status(500).json({ desc: "Error al cerrar el ticket." });
    }
    await sessionDB.commitTransaction();
    sessionDB.endSession();
    const populateResult = await TICKETS.populate(result, [
      {
        path: "Cliente",
        select: "Correo _id",
      },
    ]);
    const correoData = {
      idTicket: populateResult.Id,
      descripcionTicket: populateResult.Descripcion_cierre,
      correoCliente: populateResult.Cliente.Correo,
    };
    req.channel = "channel_cerrarTicket";
    req.correoData = correoData;
    next();
  } catch (error) {
    await sessionDB.abortTransaction();
    sessionDB.endSession();
    return res.status(500).json({
      desc: "Ocurrió un error al cerrar el ticket. Error interno en el servidor.",
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

export const aceptarResolucion = async (req, res) => {
  const sessionDB = await mongoose.startSession();
  sessionDB.startTransaction();
  const ticketId = req.params.id;
  const { Nombre } = req.body;
  const { userId, nombre, rol } = req.session.user;
  try {
    const estado = await ESTADOS.findOne({ Estado: "RESUELTOS" });
    if (!estado) {
      return res.status(404).json({ desc: "No se encontró el estado." });
    }
    const result = await TICKETS.updateOne(
      { _id: ticketId },
      {
        $set: { Estado: estado._id },
        $push: {
          Historia_ticket: {
            Nombre: userId,
            Mensaje: `${nombre}(${rol}) ha aceptado la solución ${Nombre}(Resolutor). El estado del ticket a cambiado a "Resuelto" y se encuentra en espera de Cierre.`,
            Fecha: toZonedTime(new Date(), "America/Mexico_City"),
          },
        },
      }
    );
    await sessionDB.commitTransaction();
    sessionDB.endSession();
    if (result) {
      return res
        .status(200)
        .json({ desc: "El estado del ticket fue cambiado a Resuelto." });
    } else {
      await sessionDB.abortTransaction();
      sessionDB.endSession();
      return res
        .status(500)
        .json({ desc: "Ocurrió un error al procesar la solicitud." });
    }
  } catch (error) {
    console.log(error);
    await sessionDB.commitTransaction();
    sessionDB.endSession();
    return res.status(500).json({ desc: "Error interno en el servidor." });
  }
};

export const rechazarResolucion = async (req, res) => {
  const ticketId = req.params.id;
  const { Nombre, feedback } = req.body;
  const { userId, nombre, rol } = req.session.user;
  try {
    const estado = await ESTADOS.findOne({ Estado: "ABIERTOS" });
    if (!estado) {
      return res.status(404).json({ desc: "No se encontró el estado." });
    }
    const result = await TICKETS.updateOne(
      { _id: ticketId },
      {
        $set: {
          Estado: estado._id,
        },
        $unset: {
          Resuelto_por: "",
          Respuesta_cierre_reasignado: "",
        },
        $push: {
          Historia_ticket: {
            Nombre: userId,
            Mensaje: `${nombre}(${rol}) ha rechazado la solucion de ${Nombre}(Resolutor). El estado del ticket es cambiado a "Abierto". \nMotivo:\n${feedback}`,
            Fecha: toZonedTime(new Date(), "America/Mexico_City"),
          },
        },
      }
    );
    if (result) {
      return res.status(200).json({
        desc: `Se cambio el estado del ticket a "Abierto" y fue enviado al Resolutor ${Nombre}.`,
      });
    } else {
      return res
        .status(500)
        .json({ desc: "Error al cambiar el estado del ticket." });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({ desc: "Error interno en el servidor." });
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

//TODO falta de agregar al repositorio (puts)
export const editTicket = async (req, res) => {
  const { userId, nombre, rol } = req.session.user; // Datos del usuario que edita
  const { ticketState } = req.body; // Datos actualizados del ticket
  if (!ticketState || !ticketState._id) {
    return res.status(400).json({
      error: "No se proporcionó el ID del ticket o el estado del ticket",
    });
  }
  const fechaActual = toZonedTime(new Date(), "America/Mexico_City");
  const ticketEditado = {
    _id: ticketState._id,
    Id: ticketState.Id,
    Prioridad: ticketState.Prioridad,
    Estado: ticketState.Estado,
    Tipo_de_incidencia: ticketState.Tipo_de_incidencia,
    NumeroRec_Oficio: ticketState.NumeroRec_Oficio,
    Numero_Oficio: ticketState.Numero_Oficio,
    PendingReason: ticketState.PendingReason,
    Servicio: ticketState.Servicio,
    Categoria: ticketState.Categoria,
    Subcategoria: ticketState.Subcategoria,
    Descripcion: ticketState.Descripcion,
    Direccion_general: ticketState.Direccion_general,
    Direccion_area: ticketState.Direccion_area,
    Nombre_cliente: ticketState.Nombre_cliente,
    Telefono_cliente: ticketState.Telefono_cliente,
    Correo_cliente: ticketState.Correo_cliente,
  };
  try {
    // Buscar y actualizar el ticket
    const updatedTicket = await putEditarTicket(
      ticketEditado,
      userId,
      nombre,
      rol
    );

    if (!updatedTicket) {
      return res.status(404).json({ error: "Error al editar el ticket" });
    }

    res.status(200).json({
      desc: "Ticket actualizado correctamente",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al actualizar el ticket" });
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
      Asignado_a: ticketState.standby ? Asignado_a._id : ticketState.Asignado_a,
      Area_asignado: ticketState.standby
        ? Asignado_a.Area[0]
        : ticketState.Area_asignado,
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
  const asignado = !req.body.Prioridad
    ? deleteCamposTiempo(req.body)
    : tiempoResolucion(req.body);
  try {
    delete asignado.Files; //TODO acomodar esto
    const Estado = await Gets.getEstadoTicket("NUEVOS");
    const result = await TICKETS.findOneAndUpdate(
      { _id: ticketId },
      {
        $set: {
          ...asignado,
          Estado,
        },
        $push: {
          Historia_ticket: {
            Nombre: userId,
            Mensaje: `El ticket ha sido asignado a ${asignado.Nombre} por ${nombre}(${rol})`,
            Fecha: toZonedTime(new Date(), "America/Mexico_City"),
          },
        },
      },
      { returnDocument: "after", new: true, sessionDB }
    );
    if (result) {
      const populateResult = await TICKETS.populate(result, [
        { path: "Asignado_a", select: "Correo _id" },
        {
          path: "Cliente",
          select: "Nombre Correo Telefono Extension Ubicacion _id",
        },
      ]);
      const correoData = {
        idTicket: populateResult.Id,
        descripcionTicket: populateResult.Descripcion,
        correoUsuario: populateResult.Asignado_a.Correo,
        nombreCliente: populateResult.Cliente.Nombre,
        correoCliente: populateResult.Cliente.Correo,
        telefonoCliente: populateResult.Cliente.Telefono,
        extensionCliente: populateResult.Cliente.Extension,
        ubicacion: populateResult.Cliente.Ubicacion,
        standby: req.body.standby,
      };
      req.channel = "channel_crearTicket";
      req.correoData = correoData;
      await sessionDB.commitTransaction();
      sessionDB.endSession();
      next();
    } else {
      await sessionDB.abortTransaction();
      sessionDB.endSession();
      return res
        .status(500)
        .json({ desc: "Ocurrio un error al asignar el ticket." });
    }
  } catch (error) {
    await sessionDB.abortTransaction();
    sessionDB.endSession();
    console.log(error);
    return res.status(500).json({
      desc: "Ocurrio un error al asignar el ticket. Error interno en el servidor.",
    });
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

export const crearNota = async (req, res, next) => {
  const session = req.mongoSession;
  try {
    const { userId } = req.session.user;
    const nota = req.body.Nota;
    const _id = req.params.id;

    const result = await putNota(userId, _id, nota, session);
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
