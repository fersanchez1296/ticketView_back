import { TICKETS } from "../models/index.js";
export const generarCorreoData = async (req, res, next) => {
  try {
    const populateResult = await TICKETS.populate(req.ticket, [
      { path: "Asignado_a", select: "Nombre Correo _id" },
      { path: "Reasignado_a", select: "Nombre Correo _id" },
      {
        path: "Cliente",
        select: "Nombre Correo Telefono Ubicacion _id Extension",
        populate: [{ path: "direccion_area", select: "direccion_area _id" }],
      },
    ]);
    console.log(populateResult.Descripcion_cierre);
    if (!req.contactoCliente) {
      const correoUsuario = populateResult.Reasignado_a?.length
        ? populateResult.Reasignado_a[0]?.Correo
        : populateResult.Asignado_a[0]?.Correo;

      req.correoData = {
        idTicket: populateResult.Id,
        descripcionTicket: populateResult.Descripcion,
        correoUsuario: correoUsuario, // Aquí ya se puede usar porque está en el mismo bloque
        nombreCliente: populateResult.Cliente.Nombre,
        correoCliente: populateResult.Cliente.Correo,
        telefonoCliente: populateResult.Cliente.Telefono,
        extensionCliente: populateResult.Cliente.Extension,
        ubicacion: populateResult.Cliente.Ubicacion,
        standby: populateResult.standby,
        descripcionTicketRegresado:
          populateResult.Descripcion_respuesta_cliente ?? "",
        Asignado_a: populateResult.Asignado_a[0]?.Nombre ?? "",
        Descripcion_cierre: populateResult.Descripcion_cierre ?? "",
        area: populateResult.Cliente.direccion_area.direccion_area ?? "",
      };
    } else {
      req.correoData = {
        idTicket: populateResult.Id,
        //correoUsuario: populateResult.Asignado_a ? populateResult.Asignado_a[0].Correo : "",
        correoCliente: populateResult.Cliente.Correo,
        correoResol: populateResult.Reasignado_a[0]?.Correo ?? "",
        extensionCliente: populateResult.Cliente.Extension,
        cuerpo: req.cuerpo,
        archivos: req.files ?? [],
      };
    }
    console.log("correoData1", req.correoData);
    req.ticketId = populateResult.Id;
    return next();
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ desc: "Error al generar la informacion para correo." });
  }
};
