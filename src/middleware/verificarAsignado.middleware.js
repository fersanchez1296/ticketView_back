import USUARIO from "../models/usuario.model.js";

export const verificarAsignado = async (req, res, next) => {
  const session = req.mongoSession;
  try {
    if (req.ticketState.hasResolutor) {
      req.ticketState.standby = false;
      req.ticketState.Reasignado_a = [req.ticketState.Asignado_a];
      return next();
    }
    const usarioMesa = await USUARIO.findOne({
      _id: req.ticketState.Asignado_a,
      $expr: { $eq: ["$Nombre", "Mesa de Servicio"] },
    }).lean();
    const result = !!usarioMesa;
    if (result) {
      req.ticketState.standby = true;
      return next();
    }
    return next();
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    return res
      .status(500)
      .json({
        desc: "Error al validar el usuario. Error interno en el servidor.",
      });
  }
};
