import { TICKETS } from "../models/index.js";

export const putResolverTicket = async (
  _id,
  estado,
  idResolutor,
  descripcionResolucion,
  nombre,
  rol
) => {
  const RES = await TICKETS.findOneAndUpdate(
    { _id },
    {
      $set: {
        Estado: estado,
        Resuelto_por: idResolutor,
        Respuesta_cierre_reasignado: descripcionResolucion,
      },
      $push: {
        Historia_ticket: {
          Nombre: idResolutor,
          Mensaje:
            rol === "Usuario"
              ? `El ticket ha sido enviado a revisión por ${nombre}(${rol}). En espera de respuesta del moderador.\nDescripcion resolucion:\n${descripcionResolucion}`
              : `El ticket ha sido resuelto por ${nombre}(${rol}).`,
          Fecha: new Date(),
        },
      },
    }
  );
  return RES;
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
          Fecha: new Date(),
        },
      },
    },
    { returnDocument: "after", new: true }
  );
  return RES;
};

export const putCerrarTicket = async (
  _id,
  estado,
  idCerradoPor,
  descripcionCierre,
  causaCierre,
  id,
  nombreCerrador,
  rol
) => {
  const RES = await TICKETS.findOneAndUpdate(
    { _id },
    {
      $set: {
        Estado: estado,
        Cerrado_por: idCerradoPor,
        Descripcion_cierre: descripcionCierre,
        Causa: causaCierre,
        Fecha_hora_cierre: new Date(),
      },
      $push: {
        Historia_ticket: {
          Nombre: id,
          Mensaje: `El ticket fue cerrado por ${nombreCerrador}(${rol})`,
          Fecha: new Date(),
        },
      },
    }
  );
  return RES;
};

export const putReabrirTicket = async () => {};

export const putAceptarResolucion = async (_id, estado, id, nombre, rol) => {
  const RES = await TICKETS.findOneAndUpdate(
    { _id },
    {
      $set: { Estado: estado },
      $push: {
        Historia_ticket: {
          Nombre: id,
          Mensaje: `${nombre}(${rol}) ha aceptado la solucion del Resolutor. El estado del ticket es cambiado a "Resuelto" y se encuentra en espera de Cierre.`,
          Fecha: new Date(),
        },
      },
    }
  );

  return RES;
};

export const putRechazarResolucion = async (
  _id,
  estado,
  id,
  nombre,
  rol,
  motivoRechazo
) => {
  const RES = await TICKETS.findOneAndUpdate(
    { _id },
    {
      $set: {
        Estado: estado,
      },
      $unset: {
        Resuelto_por: "",
        Respuesta_cierre_reasignado: "",
      },
      $push: {
        Historia_ticket: {
          Nombre: id,
          Mensaje: `${nombre}(${rol}) ha rechazado la solucion del Resolutor. El estado del ticket es cambiado a "Abierto". \nMotivo:\n${motivoRechazo}`,
          Fecha: new Date(),
        },
      },
    }
  );

  return RES;
};

export const putEditarTicket = async (ticketEditado, userId, nombre, rol) => {
  try {
    const respuesta = await TICKETS.findOneAndUpdate(
      { _id: ticketEditado._id },
      {
        $set: {
          ...ticketEditado,
          Fecha_hora_ultima_modificacion: new Date(),
        },
        $push: {
          Historia_ticket: {
            Nombre: userId,
            Mensaje: `El ticket ha sido editado por ${nombre} (${rol}).`,
            Fecha: new Date(),
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
