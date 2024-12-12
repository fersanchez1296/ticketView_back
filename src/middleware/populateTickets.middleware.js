import { TICKETS } from "../models/index.js";

export const populateTickets = async (req, res, next) => {
  try {
    const POPULATE = await TICKETS.populate(req.ticketsEnCurso, [
      { path: "Tipo_incidencia", select: "Tipo_de_incidencia -_id" },
      { path: "Area_asignado", select: "Area _id" },
      { path: "Categoria", select: "Categoria -_id" },
      { path: "Servicio", select: "Servicio -_id" },
      { path: "Subcategoria", select: "Subcategoria -_id" },
      { path: "Secretaria", select: "Secretaria -_id" },
      { path: "Direccion_general", select: "Direccion_General -_id" },
      { path: "Direccion_area", select: "direccion_area -_id" },
      { path: "Prioridad", select: "Prioridad Descripcion -_id" },
      { path: "Estado" },
      { path: "Asignado_a", select: "Nombre Coordinacion" },
      { path: "Reasignado_a", select: "Nombre Coordinacion" },
      { path: "Resuelto_por", select: "Nombre Coordinacion" },
      { path: "Creado_por", select: "Nombre -_id" },
      { path: "Area_reasignado_a", select: "Area -_id" },
      { path: "Cerrado_por", select: "Nombre Coordinacion -_id" },
      { path: "Asignado_final_a", select: "Nombre Coordinacion" },
      {
        path: "Historia_ticket",
        populate: { path: "Nombre", select: "Nombre -_id" },
      },
    ]);
    req.ticketsPopulated = POPULATE;
    next();
  } catch (error) {
    console.log(error);
    return res.status(500).json({ desc: "Error al formatear los tickets" });
  }
};
