import { TICKETS } from "../models/index.js";

export const populateTickets = async (req, res, next) => {
  try {
    const POPULATE = await TICKETS.populate(req.tickets, [
      { path: "Tipo_incidencia", select: "Tipo_de_incidencia _id" },
      { path: "Categoria", select: "Categoria _id" },
      { path: "Servicio", select: "Servicio _id" },
      { path: "Subcategoria" },
      { path: "Prioridad" },
      { path: "Estado" },
      { path: "Medio" },
      {
        path: "Area",
        populate: [{ path: "Area", select: "Area _id" }],
      },
      {
        path: "Asignado_a",
        select: "Nombre Correo _id",
        populate: [{ path: "Area", select: "Area _id" }],
      },
      {
        path: "Reasignado_a",
        select: "Nombre Correo _id",
        populate: [{ path: "Area", select: "Area _id" }],
      },
      {
        path: "Resuelto_por",
        select: "Nombre Correo _id",
        populate: [{ path: "Area", select: "Area _id" }],
      },
      {
        path: "Creado_por",
        select: "Nombre Correo _id",
        populate: [{ path: "Area", select: "Area _id" }],
      },
      { path: "Cerrado_por", select: "Nombre Area _id" },
      {
        path: "Resuelto_por",
        select: "Nombre Correo _id",
        populate: [{ path: "Area", select: "Area _id" }],
      },
      {
        path: "Cliente",
        select: "Nombre Correo Telefono Ubicacion Extension _id",
        populate: [
          { path: "Dependencia", select: "Dependencia _id" },
          { path: "Direccion_General", select: "Direccion_General _id" },
          { path: "direccion_area", select: "direccion_area _id" },
        ],
      },
      {
        path: "Historia_ticket",
        select: "Titulo Mensaje Fecha",
        options: { sort: { Fecha: -1 } },
        populate: {
          path: "Nombre",
          select: "Nombre -_id",
        },
      },
    ]);
    if (!POPULATE) {
      console.log("error en populate");
      return res.status(500).json({ desc: "Error al procesar los tickets." });
    }

    const ordenarHistoria = POPULATE.map((ticket) => ({
      ...ticket,
      Historia_ticket: ticket.Historia_ticket
        ? ticket.Historia_ticket.sort(
            (a, b) => new Date(b.Fecha) - new Date(a.Fecha)
          )
        : [],
    }));
    req.ticketsFormateados = ordenarHistoria;
    return next();
  } catch (error) {
    console.log(error);
    return res.status(500).json({ desc: "Error al formatear los tickets." });
  }
};
