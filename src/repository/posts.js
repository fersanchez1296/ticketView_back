import { TICKETS, ESTADOS, USUARIO } from "../models/index.js";
export const postCrearTicket = async (nuevoTicket, userId, nombre, rol) => {
  try {
    const newTicket = await new TICKETS({
      ...nuevoTicket,
      Historia_ticket: [
        {
          Nombre: userId,
          Mensaje: `El ticket ha sido creado por ${nombre} (${rol}).`,
          Fecha: new Date(),
        },
      ],
    });
    const savedTicket = await newTicket.save();
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
