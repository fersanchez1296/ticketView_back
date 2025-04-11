import { CATEGORIZACION } from "../models/index.js";

export const buscarSubcategoria = async (req, res, next) => {
  try {
    req.subcategoria = [];
    const { termino } = req.query;
    const result = await CATEGORIZACION.find({
        Subcategoria: { $regex: termino, $options: "i" },
    });
    if (result.length) {
      req.subcategoria.push({
        field: "Subcategoria",
        ids: result.map((c) => c._id),
      });
      return next();
    }
    req.subcategoria = result;
    return next();
  } catch (error) {
    return res.status(500).json({
      desc: "Ocurrio un error al buscar la subcategoria. Error interno en el servidor",
    });
  }
};
