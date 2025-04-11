import { USUARIO } from "../models/index.js";

export const buscarResolutor = async (req, res, next) => {
  try {
    req.usuario = [];
    const { termino } = req.query;
    const result = await USUARIO.find({
      $or: [
        { Nombre: { $regex: termino, $options: "i" } },
        { Correo: { $regex: termino, $options: "i" } },
      ],
    });
    if (result.length) {
      req.usuario.push(
        {
          field: "Asignado_a",
          ids: result.map((c) => c._id),
        },
        {
          field: "Reasignado_a",
          ids: result.map((c) => c._id),
        },
        {
          field: "Resuelto_por",
          ids: result.map((c) => c._id),
        },
        {
          field: "Creado_por",
          ids: result.map((c) => c._id),
        }
      );
      return next();
    }
    req.usuario = result;
    return next();
  } catch (error) {
    res.status(500).json({
      desc: "Ocurrio un error al buscar el resolutor. Error interno en el servidor",
    });
  }
};
