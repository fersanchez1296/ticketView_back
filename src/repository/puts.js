import { TICKETS, USUARIO } from "../models/index.js";
import { fechaActual, fechaDefecto } from "../utils/fechas.js";
export const putResolverTicket = async (
  userId,
  Estado,
  nombre,
  rol,
  ticketId,
  ticketData,
  session
) => {
  const RES = await TICKETS.findOneAndUpdate(
    { _id: ticketId },
    {
      $set: {
        Fecha_hora_resolucion: fechaActual,
        Fecha_hora_ultima_modificacion: fechaActual,
        Estado,
        Resuelto_por: userId,
        ...ticketData,
      },
      $push: {
        Historia_ticket: {
          Nombre: userId,
          Titulo: ticketData.vistoBueno
            ? "Ticket enviado a revisión"
            : "Ticket resuelto",
          Mensaje:
            ticketData.vistoBueno === true
              ? `El ticket ha sido enviado a revisión por ${nombre}(${rol}). En espera de respuesta del moderador.\nDescripcion resolucion:\n<${ticketData.Respuesta_cierre_reasignado}>`
              : `El ticket ha sido resuelto por ${nombre}(${rol}).\nDescripcion resolucion:\n<${ticketData.Respuesta_cierre_reasignado}>`,
          Fecha: fechaActual,
        },
      },
    },
    { session, returnDocument: "after" }
  );
  return RES;
};

export const incTickets = async (userId, actualizarContador, session) => {
  try {
    const result = await USUARIO.findOneAndUpdate(
      { _id: userId },
      { $inc: { [`Tickets_resueltos.${actualizarContador}`]: 1 } },
      { session }
    );
    if (!result) {
      return false;
    }
    return true;
  } catch (error) {
    return false;
  }
};

export const putAsignarTicket = async (
  ticketId,
  Estado,
  ticketData,
  userId,
  nombre,
  rol,
  session
) => {
  try {
    const result = TICKETS.findOneAndUpdate(
      { _id: ticketId },
      // { $unset: { Asignado_a: [] } },
      {
        $set: {
          ...ticketData,
          Fecha_hora_ultima_modificacion: fechaActual,
          Estado,
          standby: false,
          Asignado_a: [ticketData.Asignado_a],
        },
        $push: {
          Historia_ticket: {
            Nombre: userId,
            Titulo: "Ticket Asignado",
            Mensaje: `El ticket ha sido asignado a un moderador por ${nombre}-${rol}.`,
            Fecha: fechaActual,
          },
        },
      },
      { session, returnDocument: "after" }
    );
    if (!result) {
      return false;
    }
    return result;
  } catch (error) {
    return false;
  }
};

export const putReasignarTicket = async (
  _id,
  Area,
  idUsuarioReasignado,
  Id,
  nombreReasignado,
  NombreReasignador,
  rol
) => {
  const RES = await TICKETS.findOneAndUpdate(
    { _id },
    {
      $set: {
        Fecha_hora_ultima_modificacion: fechaActual,
        Area_reasignado_a: Area,
        Reasignado_a: idUsuarioReasignado,
      },
      $push: {
        Historia_ticket: {
          Nombre: Id,
          Titulo: "Ticket Reasignado",
          Mensaje: `El ticket ha sido reasignado a ${nombreReasignado} por ${NombreReasignador}(${rol})`,
          Fecha: fechaActual,
        },
      },
    },
    { returnDocument: "after", new: true }
  );
  return RES;
};

export const putCerrarTicket = async (
  ticketId,
  Estado,
  userId,
  nombre,
  rol,
  ticketData
) => {
  const RES = await TICKETS.findOneAndUpdate(
    { _id: ticketId },
    {
      $set: {
        ...ticketData,
        Fecha_hora_ultima_modificacion: fechaActual,
        Estado,
        Cerrado_por: userId,
        Fecha_hora_cierre: fechaActual,
      },
      $push: {
        Historia_ticket: {
          Nombre: userId,
          Titulo: "Ticket Cerrado",
          Mensaje: `El ticket fue cerrado por ${nombre}(${rol}).\nDescripción:\n${ticketData.Descripcion_cierre}`,
          Fecha: fechaActual,
        },
      },
    }
  );
  return RES;
};

export const putReabrirTicket = async (
  _id,
  Estado,
  ticketData,
  userId,
  nombre,
  rol,
  session
) => {
  try {
    const result = await TICKETS.findOneAndUpdate(
      { _id },
      {
        $set: {
          ...ticketData,
          Fecha_hora_ultima_modificacion: fechaActual,
          Fecha_hora_cierre: fechaDefecto,
          Fecha_hora_resolucion: fechaDefecto,
          Estado,
        },
        $unset: {
          Reasignado_a: "",
          Respuesta_cierre_reasignado: "",
          Resuelto_por: "",
          Cerrado_por: "",
          Descripcion_cierre: "",
        },
        $push: {
          Historia_ticket: {
            Nombre: userId,
            Titulo: "Ticket Reabierto",
            Mensaje: `El ticket fue reabierto por ${nombre}-${rol}.`,
            Fecha: fechaActual,
          },
          Reabierto: {
            Descripcion: ticketData.descripcionReabierto,
            Fecha: fechaActual,
          },
        },
      },
      { session, returnDocument: "after" }
    );
    if (!result) {
      return false;
    }
    return result;
  } catch (error) {
    console.log(error);
    return false;
  }
};

export const putAceptarResolucion = async (
  ticketId,
  Estado,
  Nombre,
  userId,
  nombre,
  rol,
  session
) => {
  try {
    const result = await TICKETS.findOneAndUpdate(
      { _id: ticketId },
      {
        $set: {
          Estado,
          Fecha_hora_ultima_modificacion: fechaActual,
          vistoBueno: false,
        },
        $push: {
          Historia_ticket: {
            Nombre: userId,
            Titulo: "Ticket revisado y aceptado",
            Mensaje: `${nombre}(${rol}) ha aceptado la solucion de ${Nombre}(Resolutor). El estado del ticket es cambiado a "Resuelto" y se encuentra en espera de Cierre.`,
            Fecha: fechaActual,
          },
        },
      },
      { session, returnDocument: "after" }
    );
    if (!result) {
      return false;
    }
    return result;
  } catch (error) {
    return false;
  }
};

export const putRechazarResolucion = async (
  ticketId,
  Estado,
  Nombre,
  feedback,
  userId,
  nombre,
  rol,
  session
) => {
  try {
    const result = await TICKETS.findOneAndUpdate(
      { _id: ticketId },
      {
        $set: {
          Estado,
          Fecha_hora_ultima_modificacion: fechaActual,
        },
        $unset: {
          Resuelto_por: "",
          Respuesta_cierre_reasignado: "",
          Fecha_hora_resolucion: "",
        },
        $push: {
          Historia_ticket: {
            Nombre: userId,
            Titulo: "Ticket revisado y rechazado",
            Mensaje: `${nombre}(${rol}) ha rechazado la solucion de ${Nombre}(Resolutor). El estado del ticket es cambiado a "Abierto". \nMotivo:\n${feedback}`,
            Fecha: fechaActual,
          },
        },
      },
      { session, returnDocument: "after" }
    );
    if (!result) {
      return false;
    }
    return result;
  } catch (error) {
    return false;
  }
};

export const putEditarTicket = async (
  ticketId,
  ticketData,
  session,
  userId,
  nombre,
  rol
) => {
  try {
    const respuesta = await TICKETS.findOneAndUpdate(
      { _id: ticketId },
      {
        $set: {
          ...ticketData,
          Fecha_hora_ultima_modificacion: fechaActual,
        },
        $push: {
          Historia_ticket: {
            Nombre: userId,
            Titulo: "Ticket editado",
            Mensaje: `El ticket ha sido editado por ${nombre} (${rol}).`,
            Fecha: fechaActual,
          },
        },
      },
      { session, returnDocument: "after" }
    );
    if (!respuesta) {
      return false;
    }
    return respuesta;
  } catch (error) {
    return false;
  }
};

export const putNota = async (userId, ticketId, nota, session) => {
  try {
    const result = await TICKETS.findOneAndUpdate(
      { _id: ticketId },
      {
        $set: { Fecha_hora_ultima_modificacion: fechaActual },
        $push: {
          Historia_ticket: {
            Nombre: userId,
            Titulo: "Nota agregada",
            Mensaje: `Nota:\n${nota}`,
            Fecha: fechaActual,
          },
        },
      },
      { session, returnDocument: "after" }
    );
    if (!result) {
      return false;
    }
    return result;
  } catch (error) {
    return false;
  }
};

export const putTicketPendiente = async (
  ticketId,
  Estado,
  cuerpo,
  userId,
  nombre,
  rol,
  session
) => {
  try {
    const respuesta = await TICKETS.findOneAndUpdate(
      { _id: ticketId },
      {
        $set: {
          Estado,
          Fecha_hora_ultima_modificacion: fechaActual,
        },
        $push: {
          Historia_ticket: {
            Nombre: userId,
            Titulo: "Ticket pendiente",
            Mensaje: `Ticket marcado como pendiente. ${nombre}-${rol} se ha puesto en contacto mediante correo electrónico con el cliente. Cuerpo del correo: <${cuerpo}>."`,
            Fecha: fechaActual,
          },
        },
      },
      { session, returnDocument: "after" }
    );
    if (!respuesta) {
      return false;
    }
    return respuesta;
  } catch (error) {
    return false;
  }
};

export const putTicketAbierto = async (
  ticketId,
  Estado,
  Descripcion_respuesta_cliente,
  userId,
  nombre,
  rol,
  session
) => {
  try {
    const respuesta = await TICKETS.findOneAndUpdate(
      { _id: ticketId },
      {
        $set: {
          Estado,
          Fecha_hora_ultima_modificacion: fechaActual,
        },
        $push: {
          Historia_ticket: {
            Nombre: userId,
            Titulo: "Ticket devuelto",
            Mensaje: `El ticket ha sido devuelto al resolutor por: ${nombre} (${rol}). Con la respuesta del cliente <${Descripcion_respuesta_cliente}>`,
            Fecha: fechaActual,
          },
        },
      },
      { session, returnDocument: "after" }
    );
    if (!respuesta) {
      return false;
    }
    return respuesta;
  } catch (error) {
    return false;
  }
};

export const contactarCliente = async (
  ticketId,
  cuerpo,
  userId,
  nombre,
  rol,
  session
) => {
  try {
    const respuesta = await TICKETS.findOneAndUpdate(
      { _id: ticketId },
      {
        $set: { Fecha_hora_ultima_modificacion: fechaActual },
        $push: {
          Historia_ticket: {
            Nombre: userId,
            Titulo: "Contacto con el cliente",
            Mensaje: `${nombre}-${rol} se ha puesto en contacto mediante correo electrónico con el cliente. Cuerpo del correo: <${cuerpo}>."`,
            Fecha: fechaActual,
          },
        },
      },
      { session, returnDocument: "after" }
    );
    if (!respuesta) {
      return false;
    }
    return respuesta;
  } catch (error) {
    return false;
  }
};
