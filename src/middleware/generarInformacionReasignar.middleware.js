import * as Gets from "../repository/gets.js";
export const generarInformacionReasignar = async (req, res, next) => {
  const session = req.mongoSession;
  try {
    req.ticketData = JSON.parse(req.body.ticketData);
    const rolUsuario = await Gets.getRolUsuario(req.ticketData.Asignado_a);
    if (!rolUsuario) {
      session.endSession();
      return res.status(404).json({
        desc: "No se encontro el rol del usuario",
      });
    }
    const areaUsuario = await Gets.getAreaUsuario(req.ticketData.Asignado_a);
    console.log(areaUsuario);
    if (!areaUsuario) {
      session.endSession();
      return res.status(404).json({
        desc: "No se encontro el area del usuario",
      });
    }
    req.rolUsuario = rolUsuario;
    req.areaUsuario = areaUsuario;
    return next();
  } catch (error) {
    console.log(error);
    await session.abortTransaction();
    session.endSession();
    return res.status(500).json({
      desc: "Error al obtener el estado del ticket. Error interno en el servidor.",
    });
  }
};
