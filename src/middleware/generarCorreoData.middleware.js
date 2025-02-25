import { TICKETS } from "../models/index.js";
export const generarCorreoData = async (req, res, next) => {
  try {
    const populateResult = await TICKETS.populate(req.ticket, [
      { path: "Asignado_a", select: "Nombre Correo _id" },
      { path: "Reasignado_a", select: "Correo _id" },
      {
        path: "Cliente",
        select: "Nombre Correo Telefono Extension Ubicacion _id",
      },
    ]);
    console.log("populateResult", populateResult);

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
      descripcionTicketRegresado: populateResult.Descripcion_respuesta_cliente ?? "",
      correoResol: populateResult.Reasignado_a?.Correo ?? "",
      Asignado_a: populateResult.Asignado_a?.Nombre ?? "",
    };
    console.log("correodata", correoData);
    req.ticketId = populateResult.Id;
    req.correoData = correoData;

    return next();
  } catch (error) {
    console.log("Error al generar correo data", error);
  }
};
