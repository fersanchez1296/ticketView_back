import { TICKETS } from "../models/index.js";

export const dashboard = async (req, res) => {
  const { Id } = req.session.user;
  try {
    const [
      abiertos,
      reabiertos,
      cerrados,
      pendientes,
      nuevos,
      revision,
      resueltos,
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
            $or: [{ Asignado_a: Id }, { Reasignado_a: Id }],
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
          {
            $or: [{ Asignado_a: Id }, { Reasignado_a: Id }],
          },
          { Estado: "672bc1010467f98349b61017" },
        ],
      }).countDocuments(),
      TICKETS.find({
        $and: [{ Resuelto_por: Id }, { Estado: "67200415ab8f070f7ce3538d" }],
      }).countDocuments(),
    ]);
    res.json({
      abiertos,
      reabiertos,
      cerrados,
      pendientes,
      nuevos,
      revision,
      resueltos,
    });
  } catch (error) {}
};
