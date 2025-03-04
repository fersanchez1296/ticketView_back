import { TICKETS, ESTADOS, USUARIO } from "../models/index.js";
import { toZonedTime } from "date-fns-tz";
export const postCrearTicket = async (
  nuevoTicket,
  userId,
  nombre,
  rol,
  session
) => {
  try {
    console.log("Guardando Ticket...");
    const newTicket = new TICKETS({
      ...nuevoTicket,
      Asignado_a: [nuevoTicket.Asignado_a],
      Historia_ticket: [
        {
          Nombre: userId,
          Mensaje: `El ticket ha sido creado por ${nombre} (${rol}).`,
          Fecha: toZonedTime(new Date(), "America/Mexico_City"),
        },
      ],
    });
    const savedTicket = await newTicket.save({ session });
    if (!savedTicket) {
      return false;
    }
    return savedTicket;
  } catch (error) {
    console.log(
      "Estado de la sesión al caer al catch del repositorio:",
      session.inTransaction()
    );
    console.log(
      "Ocurrio un error al guardar el ticket en el respositorio. Transaccion abortada."
    );
    console.log(error);
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
