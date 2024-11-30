import { TICKETS } from "../models/index.js";

export const dashboard = async (req, res) => {
<<<<<<< HEAD
  const { Id } = req.session.user;
=======
  const { Id, Area } = req.session.user;
>>>>>>> 2ef7b9d0d5a3cc03374c6dd73f6470f7602ba3a1
  try {
    const [
      abiertos,
      reabiertos,
      cerrados,
      pendientes,
      nuevos,
      revision,
      resueltos,
<<<<<<< HEAD
=======
      totalAbiertos,
      totalReabiertos,
      totalCerrados,
      totalPendientes,
      totalNuevos,
      totalRevision,
      totalResueltos,
>>>>>>> 2ef7b9d0d5a3cc03374c6dd73f6470f7602ba3a1
    ] = await Promise.all([
      TICKETS.find({
        $and: [
          {
            $or: [{ Asignado_a: Id }, { Reasignado_a: Id }],
          },
          { Estado: "67200415ab8f070f7ce35389" },
        ],
      }).countDocuments(),
      TICKETS.find({
        $and: [
          {
            $or: [{ Asignado_a: Id }, { Reasignado_a: Id }],
          },
          { Estado: "67200415ab8f070f7ce3538c" },
        ],
      }).countDocuments(),
      TICKETS.find({
        $and: [
          {
<<<<<<< HEAD
            $or: [{ Asignado_a: Id }, { Reasignado_a: Id }],
=======
            $or: [
              { Asignado_a: Id },
              { Reasignado_a: Id },
              { Resuelto_por: Id },
              { Cerrado_por: Id },
              { Creado_por: Id },
            ],
>>>>>>> 2ef7b9d0d5a3cc03374c6dd73f6470f7602ba3a1
          },
          { Estado: "67200415ab8f070f7ce35388" },
        ],
      }).countDocuments(),
      TICKETS.find({
        $and: [
          {
            $or: [{ Asignado_a: Id }, { Reasignado_a: Id }],
          },
          { Estado: "67200415ab8f070f7ce3538b" },
        ],
      }).countDocuments(),
      TICKETS.find({
        $and: [
          {
            $or: [{ Asignado_a: Id }, { Reasignado_a: Id }],
          },
          { Estado: "67200415ab8f070f7ce3538a" },
        ],
      }).countDocuments(),
      TICKETS.find({
        $and: [
<<<<<<< HEAD
          {
            $or: [{ Asignado_a: Id }, { Reasignado_a: Id }],
          },
          { Estado: "672bc1010467f98349b61017" },
=======
          { Estado: "672bc1010467f98349b61017" },
          { Area_reasignado_a: { $in: Area } },
>>>>>>> 2ef7b9d0d5a3cc03374c6dd73f6470f7602ba3a1
        ],
      }).countDocuments(),
      TICKETS.find({
        $and: [{ Resuelto_por: Id }, { Estado: "67200415ab8f070f7ce3538d" }],
      }).countDocuments(),
<<<<<<< HEAD
=======
      //tickets totales
      TICKETS.find({
        Estado: "67200415ab8f070f7ce35389",
      }).countDocuments(),
      TICKETS.find({
        Estado: "67200415ab8f070f7ce3538c",
      }).countDocuments(),
      TICKETS.find({
        Estado: "67200415ab8f070f7ce35388",
      }).countDocuments(),
      TICKETS.find({
        Estado: "67200415ab8f070f7ce3538b",
      }).countDocuments(),
      TICKETS.find({
        Estado: "67200415ab8f070f7ce3538a",
      }).countDocuments(),
      TICKETS.find({
        Estado: "672bc1010467f98349b61017",
      }).countDocuments(),
      TICKETS.find({
        Estado: "67200415ab8f070f7ce3538d",
      }).countDocuments(),
      //tickets por coordinacion
>>>>>>> 2ef7b9d0d5a3cc03374c6dd73f6470f7602ba3a1
    ]);
    res.json({
      abiertos,
      reabiertos,
      cerrados,
      pendientes,
      nuevos,
      revision,
      resueltos,
<<<<<<< HEAD
=======
      totalAbiertos,
      totalReabiertos,
      totalCerrados,
      totalPendientes,
      totalNuevos,
      totalRevision,
      totalResueltos,
>>>>>>> 2ef7b9d0d5a3cc03374c6dd73f6470f7602ba3a1
    });
  } catch (error) {}
};
