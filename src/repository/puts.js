import { TICKETS } from "../models/index.js";
import { toZonedTime } from "date-fns-tz";
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
        Estado,
        Resuelto_por: userId,
        ...ticketData,
      },
      $push: {
        Historia_ticket: {
          Nombre: userId,
          Mensaje:
            rol === "Usuario"
              ? `El ticket ha sido enviado a revisión por ${nombre}(${rol}). En espera de respuesta del moderador.\nDescripcion resolucion:\n${ticketData.Respuesta_cierre_reasignado}`
              : `El ticket ha sido resuelto por ${nombre}(${rol}).\nDescripcion resolucion:\n${ticketData.Respuesta_cierre_reasignado}`,
          Fecha: toZonedTime(new Date(), "America/Mexico_City"),
        },
      },
    },
    { session, returnDocument: "after" }
  );
  return RES;
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
      {
        $set: {
          Estado,
          ...ticketData,
        },
        $push: {
          Historia_ticket: {
            Nombre: userId,
            Mensaje: `El ticket ha sido asignado a un moderador por ${nombre}-${rol}.`,
            Fecha: toZonedTime(new Date(), "America/Mexico_City"),
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
        Area_reasignado_a: Area,
        Reasignado_a: idUsuarioReasignado,
      },
      $push: {
        Historia_ticket: {
          Nombre: Id,
          Mensaje: `El ticket ha sido reasignado a ${nombreReasignado} por ${NombreReasignador}(${rol})`,
          Fecha: toZonedTime(new Date(), "America/Mexico_City"),
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
        Estado,
        Cerrado_por: userId,
        Fecha_hora_cierre: toZonedTime(new Date(), "America/Mexico_City"),
      },
      $push: {
        Historia_ticket: {
          Nombre: userId,
          Mensaje: `El ticket fue cerrado por ${nombre}(${rol}).\nDescripción:\n${ticketData.Descripcion_cierre}`,
          Fecha: toZonedTime(new Date(), "America/Mexico_City"),
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
    const result = TICKETS.findOneAndUpdate(
      { _id },
      {
        $set: {
          Estado,
          ...ticketData,
        },
        $push: {
          Historia_ticket: {
            Nombre: userId,
            Mensaje: `El ticket fue reabierto por ${nombre}-${rol}.`,
            Fecha: toZonedTime(new Date(), "America/Mexico_City"),
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
        $set: { Estado },
        $push: {
          Historia_ticket: {
            Nombre: userId,
            Mensaje: `${nombre}(${rol}) ha aceptado la solucion de ${Nombre}(Resolutor). El estado del ticket es cambiado a "Resuelto" y se encuentra en espera de Cierre.`,
            Fecha: toZonedTime(new Date(), "America/Mexico_City"),
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

export const putEditarTicket = async (ticketEditado, userId, nombre, rol) => {
  try {
    const respuesta = await TICKETS.findOneAndUpdate(
      { _id: ticketEditado._id },
      {
        $set: {
          ...ticketEditado,
          Fecha_hora_ultima_modificacion: toZonedTime(
            new Date(),
            "America/Mexico_City"
          ),
        },
        $push: {
          Historia_ticket: {
            Nombre: userId,
            Mensaje: `El ticket ha sido editado por ${nombre} (${rol}).`,
            Fecha: toZonedTime(new Date(), "America/Mexico_City"),
          },
        },
      },
      { new: true } // Retorna el documento actualizado
    );
    console.log(respuesta);
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
        $push: {
          Historia_ticket: {
            Nombre: userId,
            Mensaje: nota,
            Fecha: toZonedTime(new Date(), "America/Mexico_City"),
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
