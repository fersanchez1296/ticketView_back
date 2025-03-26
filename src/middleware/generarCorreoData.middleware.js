import { TICKETS } from "../models/index.js";
export const generarCorreoData = async (req, res, next) => {
  try {
    const populateResult = await TICKETS.populate(req.ticket, [
      { path: "Asignado_a", select: "Nombre Correo _id" },
      { path: "Reasignado_a", select: "Nombre Correo _id" },
      {
        path: "Cliente",
        select: "Nombre Correo Telefono Extension Ubicacion _id",
      },
    ]);
    console.log(populateResult.Descripcion_cierre);
    if (!req.contactoCliente) {
      req.correoData = {
        idTicket: populateResult.Id,
        descripcionTicket: populateResult.Descripcion,
        correoUsuario: populateResult.Asignado_a[0].Correo,
        nombreCliente: populateResult.Cliente.Nombre,
        correoCliente: populateResult.Cliente.Correo,
        telefonoCliente: populateResult.Cliente.Telefono,
        extensionCliente: populateResult.Cliente.Extension,
        ubicacion: populateResult.Cliente.Ubicacion,
        standby: populateResult.standby,
        descripcionTicketRegresado:
          populateResult.Descripcion_respuesta_cliente ?? "",
        correoResol: populateResult.Reasignado_a[0]?.Correo ?? "",
        Asignado_a: populateResult.Asignado_a[0]?.Nombre ?? "",
        Descripcion_cierre: populateResult.Descripcion_cierre ?? "",
      };
    } else {
      req.correoData = {
        idTicket: populateResult.Id,
        correoUsuario: populateResult.Asignado_a[0].Correo ?? "",
        correoCliente: populateResult.Cliente.Correo,
        correoResol: populateResult.Reasignado_a[0]?.Correo ?? "",
        cuerpo: req.cuerpo,
      };
    }
    req.ticketId = populateResult.Id;
    return next();
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ desc: "Error al generar la informacion para correo." });
  }
};
