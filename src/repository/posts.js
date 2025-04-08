import { TICKETS, ESTADOS, USUARIO } from "../models/index.js";
import { obtenerFechaActual } from "../utils/fechas.js";
export const postCrearTicket = async (
  nuevoTicket,
  userId,
  nombre,
  rol,
  session
) => {
  try {
    console.log("Guardando Ticket...");
    const Historia_ticket = [
      {
        Nombre: userId,
        Titulo: "Ticket Creado",
        Mensaje: `El ticket ha sido creado por ${nombre} (${rol}).`,
        Fecha: obtenerFechaActual(),
      },
    ];
    if (!nuevoTicket.standby) {
      Historia_ticket.push({
        Nombre: userId,
        Titulo: "Ticket Asignado",
        Mensaje: `El ticket ha sido asignado al usuario ${nuevoTicket.NAsignado} por ${nombre} (${rol}).`,
        Fecha: obtenerFechaActual(),
      });
    }
    const newTicket = new TICKETS({
      ...nuevoTicket,
      Asignado_a: [nuevoTicket.Asignado_a],
      Fecha_hora_ultima_modificacion: obtenerFechaActual(),
      Historia_ticket,
    });
    const savedTicket = await newTicket.save({ session });
    if (!savedTicket) {
      return false;
    }
    return savedTicket;
  } catch (error) {
    return false;
  }
};

export const postRegistrarUsuario = async (body, pasword) => {
  const RES = new USUARIO({
    ...body,
    password: hashedPassword,
  });
  RES.save();
  return RES;
};
