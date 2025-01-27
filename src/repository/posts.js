import { TICKETS, ESTADOS, USUARIO } from "../models/index.js";
export const postCrearTicket = async (
  nuevoTicket,
  userId,
  nombre,
  rol,
  sessionDB
) => {
  try {
    console.log("Guardando Ticket...", nuevoTicket);
    const newTicket = await new TICKETS({
      ...nuevoTicket,
      Historia_ticket: [
        {
          Nombre: userId,
          Mensaje: `El ticket ha sido creado por ${nombre} (${rol}).`,
          Fecha: new Date(),
        },
      ],
      ...(nuevoTicket.Files ? { Files: [nuevoTicket.Files] } : { Files: [] }),
    });
    const savedTicket = await newTicket.save({ sessionDB });
    if (!savedTicket) {
      console.log("Ocurrio un error al guardar el ticket en el respositorio.");
      return false;
    }
    console.log("El ticket se guardado de manera correcta");
    const formatedTickets = await TICKETS.populate(savedTicket, [
      { path: "Dependencia_cliente", select: "Dependencia _id" },
      { path: "Direccion_general", select: "Direccion_General _id" },
      { path: "Direccion_area", select: "direccion_area _id" },
    ]);
    return formatedTickets;
  } catch (error) {
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
