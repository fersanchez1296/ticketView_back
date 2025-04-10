import { TICKETS } from "../models/index.js";
import mongoose from "mongoose";
import * as Gets from "../repository/gets.js";
const ObjectId = mongoose.Types.ObjectId;
export const dashboard = async (req, res) => {
  const { userId, areas } = req.session.user;
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
          { Reasignado_a: userId },
          { Estado: "67200415ab8f070f7ce35389" },
        ],
      }).countDocuments(),
      TICKETS.find({
        $and: [
          {
            Asignado_a: userId,
          },
          { Reasignado_a: { $ne: userId } },
          { Estado: "67200415ab8f070f7ce3538c" },
        ],
      }).countDocuments(),
      TICKETS.find({
        $and: [
          { Resuelto_por: userId },
          { Estado: "67200415ab8f070f7ce35388" },
        ],
      }).countDocuments(),
      TICKETS.find({
        $and: [
          { Reasignado_a: userId },
          { Estado: "67200415ab8f070f7ce3538b" },
        ],
      }).countDocuments(),
      TICKETS.find({
        $and: [{ Asignado_a: userId }, { Estado: "67200415ab8f070f7ce3538a" }],
      }).countDocuments(),
      TICKETS.find({
        $and: [
          { Estado: "672bc1010467f98349b61017" },
          { Area: { $in: areas } },
        ],
      }).countDocuments(),
      TICKETS.find({
        $and: [
          { Resuelto_por: userId },
          { Estado: "67200415ab8f070f7ce3538d" },
        ],
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

export const general = async (req, res, next) => {
  try {
    const { termino } = req.query;
    console.log(termino);
    const orConditions = [
      { Descripcion: { $regex: termino, $options: "i" } },
      { Id: req.id },
      { NumeroRec_Oficio: { $regex: termino, $options: "i" } },
      { Numero_Oficio: { $regex: termino, $options: "i" } },
    ];
    if (req.cliente && req.cliente.length > 0) {
      const Cliente = [];
      req.cliente.forEach((element) => {
        Cliente.push(...element.ids);
      });
      orConditions.push({ Cliente: Cliente });
    }
    if (req.usuario && req.usuario.length > 0) {
      req.usuario.forEach((element) => {
        const field = element.field;
        const value = element.ids;
        const objectIds = value.map((id) => new mongoose.Types.ObjectId(id));
        orConditions.push({ [field]: { $in: objectIds } });
      });
    }
    if (req.area && req.area.length > 0) {
      req.area.forEach((element) => {
        const field = element.field;
        const value = element.ids;
        const objectIds = value.map((id) => new mongoose.Types.ObjectId(id));
        orConditions.push({ [field]: { $in: objectIds } });
      });
    }
    if (req.subcategoria && req.subcategoria.length > 0) {
      req.subcategoria.forEach((element) => {
        const field = element.field;
        const value = element.ids;
        const objectIds = value.map((id) => new mongoose.Types.ObjectId(id));
        orConditions.push({ [field]: { $in: objectIds } });
      });
    }
    console.log(orConditions);
    const result = await Gets.getTicketsGeneral(orConditions);
    if (!result || result.length === 0) {
      return res.status(404).json({
        desc: "No se encontraron tickets con este termino de busqueda.",
      });
    }
    req.tickets = result;
    return next();
  } catch (error) {
    return res.status(500).json({
      desc: "Error al buscar tickets. Error interno en el servidor.",
    });
  }
};

export const oficio = async (req, res, next) => {
  try {
    const { termino } = req.query;
    const result = await Gets.getTicketsPorOficio(termino);
    if (!result) {
      return res.status(404).json({
        desc: "No se encontraron tickets con este termino de busqueda.",
      });
    }
    req.tickets = result;
    return next();
  } catch (error) {
    return res.status(500).json({
      desc: "Error al buscar tickets por oficio. Error interno en el servidor.",
    });
  }
};

export const nccliente = async (req, res, next) => {
  if (req.cliente.length === 0) {
    return res.status(404).json({
      desc: "No se encontro un cliente con este termino de busqueda",
    });
  }
  try {
    const Cliente = [];
    req.cliente.forEach((element) => {
      Cliente.push(...element.ids);
    });
    const result = await Gets.getTicketsPorCliente(Cliente);
    if (!result) {
      return res.status(404).json({
        desc: "No se encontraron tickets con este termino de busqueda.",
      });
    }
    req.tickets = result;
    return next();
  } catch (error) {
    return res.status(500).json({
      desc: "No se puedo encotrar un cliente con estos terminos. Error interno en el servidor.",
    });
  }
};

export const ncresolutor = async (req, res, next) => {
  if (req.usuario.length === 0) {
    return res.status(404).json({
      desc: "No se encontro un resolutor con este termino de busqueda",
    });
  }
  try {
    const orConditions = [];
    req.usuario.forEach((element) => {
      const field = element.field;
      const value = element.ids;
      const objectIds = value.map((id) => new mongoose.Types.ObjectId(id));
      orConditions.push({ [field]: { $in: objectIds } });
    });
    const result = await Gets.getTicketsPorUsuario(orConditions);
    if (!result) {
      return res.status(404).json({
        desc: "No se encontraron tickets con este termino de busqueda.",
      });
    }
    req.tickets = result;
    return next();
  } catch (error) {
    return res.status(500).json({
      desc: "No se puedo encotrar un resolutor con estos terminos. Error interno en el servidor.",
    });
  }
};
