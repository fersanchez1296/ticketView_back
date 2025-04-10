import { AREA } from "../models/index.js";

export const buscarArea = async (req, res, next) => {
  try {
    req.area = [];
    const { termino } = req.query;
    const result = await AREA.find({
        Area: { $regex: termino, $options: "i" },
    });
    if (result.length) {
      req.area.push({
        field: "AreaTicket",
        ids: result.map((c) => c._id),
      });
      return next();
    }
    req.area = result;
    return next();
  } catch (error) {
    return res.status(500).json({
      desc: "Ocurrio un error al buscar el Area. Error interno en el servidor",
    });
  }
};
