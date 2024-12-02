import { TICKETS } from "../models/index.js";
import mongoose from "mongoose";
const ObjectId = mongoose.Types.ObjectId;
export const dashboard = async (req, res) => {
  const { Id, Area } = req.session.user;
  try {
    const [
      abiertos,
      reabiertos,
      cerrados,
      pendientes,
      nuevos,
      revision,
      resueltos,
      totalAbiertos,
      totalReabiertos,
      totalCerrados,
      totalPendientes,
      totalNuevos,
      totalRevision,
      totalResueltos,
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
            $or: [
              { Asignado_a: Id },
              { Reasignado_a: Id },
              { Resuelto_por: Id },
              { Cerrado_por: Id },
              { Creado_por: Id },
            ],
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
          { Estado: "672bc1010467f98349b61017" },
          { Area_reasignado_a: { $in: Area } },
        ],
      }).countDocuments(),
      TICKETS.find({
        $and: [{ Resuelto_por: Id }, { Estado: "67200415ab8f070f7ce3538d" }],
      }).countDocuments(),
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
    ]);

    // const months = [
    //   "Jan",
    //   "Feb",
    //   "Mar",
    //   "Apr",
    //   "May",
    //   "Jun",
    //   "Jul",
    //   "Aug",
    //   "Sep",
    //   "Oct",
    //   "Nov",
    //   "Dec",
    // ];

    // const estadosFiltrar = [
    //   new ObjectId("67200415ab8f070f7ce35389"),
    //   new ObjectId("67200415ab8f070f7ce35388"),
    //   new ObjectId("67200415ab8f070f7ce3538b"),
    // ];

    // const results = await TICKETS.aggregate([
    //   {
    //     $match: {
    //       Estado: { $in: estadosFiltrar }, // Filtra por los estados
    //     },
    //   },
    //   {
    //     $project: {
    //       month: { $month: "$Fecha_hora_creacion" },
    //       estado: "$Estado",
    //     },
    //   },
    //   {
    //     $group: {
    //       _id: { month: "$month", estado: "$estado" },
    //       count: { $sum: 1 },
    //     },
    //   },
    //   {
    //     $sort: { "_id.month": 1 },
    //   },
    // ]);

    // const data = {};
    // results.forEach(({ _id, count }) => {
    //   const { month, estado } = _id;
    //   const monthIndex = month - 1;

    //   if (!data[estado]) {
    //     data[estado] = Array(12).fill(0);
    //   }
    //   data[estado][monthIndex] = count;
    // });

    // const sales = {
    //   labels: months,
    //   datasets: Object.keys(data).map((estado) => ({
    //     label: estado,
    //     data: data[estado],
    //   })),
    // };
    res.json({
      abiertos,
      reabiertos,
      cerrados,
      pendientes,
      nuevos,
      revision,
      resueltos,
      totalAbiertos,
      totalReabiertos,
      totalCerrados,
      totalPendientes,
      totalNuevos,
      totalRevision,
      totalResueltos,
      //sales,
    });
  } catch (error) {}
};
