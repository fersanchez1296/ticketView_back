import { TICKETS } from "../models/index.js";

export const populateCorreos = async (req, res, next) => {
  try {
    console.log("tickets en populate", req.tickets);
    const POPULATE = await TICKETS.populate(req.tickets, [
      { path: "Asignado_a", select: "Nombre Correo Coordinacion Area _id" },
      {
        path: "Cliente",
        select: "Nombre Correo Telefono Ubicacion _id",
        populate: [
          { path: "Dependencia", select: "Dependencia _id" },
          { path: "Direccion_General", select: "Direccion_General _id" },
          { path: "direccion_area", select: "direccion_area _id" },
        ],
      },
    ]);
    if (!POPULATE) {
      console.log("error en populate");
      return res.status(500).json({ desc: "Error al procesar los tickets." });
    }
    console.log("POPULATE", POPULATE);
    req.tickets = POPULATE;
    next();
  } catch (error) {
    console.log(error);
    return res.status(500).json({ desc: "Error al formatear los tickets." });
  }
};