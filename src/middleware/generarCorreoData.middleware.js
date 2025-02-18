import { TICKETS } from "../models/index.js";
export const generarCorreoData = async (req, res, next) => {
  try {
    const populateResult = await TICKETS.populate(req.result, [
      { path: "Asignado_a", select: "Correo _id" },
      { path: "Cliente", select: "Nombre _id" },
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
      standby: populateResult.standby,
    };

    req.standby = populateResult.standby;
    req.ticketId = populateResult.Id;
    req.ticketIdDb = populateResult._id;
    req.correoData = correoData;
    req.channel = "channel_crearTicket";

    return next();
  } catch (error) {}
};
