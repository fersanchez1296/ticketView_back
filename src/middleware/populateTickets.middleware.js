import { TICKETS } from "../models/index.js";

export const populateTickets = async (req, res) => {
  try {
    const POPULATE = await TICKETS.populate(req.ticketsFormateados, [
      { path: "Tipo_incidencia", select: "Tipo_de_incidencia _id" },
      { path: "Area_asignado", select: "Area _id" },
      { path: "Categoria", select: "Categoria _id" },
      { path: "Servicio", select: "Servicio _id" },
      { path: "Subcategoria", select: "Subcategoria _id" },
      { path: "Prioridad"},
      { path: "Estado" },
      { path: "Asignado_a", select: "Nombre Area _id" },
      { path: "Reasignado_a", select: "Nombre Area _id" },
      { path: "Resuelto_por", select: "Nombre Area _id" },
      { path: "Creado_por", select: "Nombre Area _id" },
      { path: "Area_reasignado_a", select: "Area _id" },
      { path: "Cerrado_por", select: "Nombre Area _id" },
      {
        path: "Resuelto_por",
        select: "Nombre Correo _id",
        populate: [
          { path: "Area", select: "Area _id" },
        ],
      },
      {
        path: "Cliente",
        select: "Nombre Correo Telefono Ubicacion _id",
        populate: [
          { path: "Dependencia", select: "Dependencia _id" },
          { path: "Direccion_General", select: "Direccion_General _id" },
          { path: "direccion_area", select: "direccion_area _id" },
        ],
      },
      {
        path: "Historia_ticket",
        populate: { path: "Nombre", select: "Nombre -_id" },
      },
    ]);
    if (!POPULATE) {
      console.log("error en populate");
      return res.status(500).json({ desc: "Error al procesar los tickets." });
    }
    return res.status(200).json(POPULATE);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ desc: "Error al formatear los tickets." });
  }
};
