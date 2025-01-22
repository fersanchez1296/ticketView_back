import { TICKETS } from "../models/index.js";

export const populateTickets = async (req, res, next) => {
  try {
    const POPULATE = await TICKETS.populate(req.ticketsFormateados, [
      { path: "Tipo_incidencia", select: "Tipo_de_incidencia _id" },
      { path: "Area_asignado", select: "Area _id" },
      { path: "Categoria", select: "Categoria _id" },
      { path: "Servicio", select: "Servicio _id" },
      { path: "Subcategoria", select: "Subcategoria _id" },
      { path: "Direccion_general", select: "Direccion_General _id" },
      { path: "Direccion_area", select: "direccion_area _id" },
      { path: "Prioridad", select: "Prioridad Descripcion _id" },
      { path: "Estado" },
      { path: "Asignado_a", select: "Nombre Coordinacion Area _id" },
      { path: "Reasignado_a", select: "Nombre Coordinacion Area _id" },
      { path: "Resuelto_por", select: "Nombre Coordinacion Area _id" },
      { path: "Creado_por", select: "Nombre Area _id" },
      { path: "Area_reasignado_a", select: "Area _id" },
      { path: "Cerrado_por", select: "Nombre Coordinacion Area _id" },
      { path: "Asignado_final_a", select: "Nombre Coordinacion" },
      {
        path: "Historia_ticket",
        populate: { path: "Nombre", select: "Nombre -_id" },
      },
    ]);
    if (!POPULATE) {
      return res.status(500).json({ desc: "Error al procesar los tickets." });
    }
    return res.status(200).json(POPULATE);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ desc: "Error al formatear los tickets." });
  }
};
