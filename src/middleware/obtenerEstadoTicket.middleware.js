import * as Gets from "../repository/gets.js";
export const obtenerEstadoTicket = async (req, res, next) => {
  const session = req.mongoSession;
  try {
    if (req.ticketState.hasResolutor) {
      req.ticketState.Estado = await Gets.getEstadoTicket("ABIERTOS");
    } else if (req.ticketState.standby) {
      req.ticketState.Estado = await Gets.getEstadoTicket("STANDBY");
    } else {
      req.ticketState.Estado = await Gets.getEstadoTicket("NUEVOS");
    }
    return next();
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    return res
      .status(500)
      .json({
        desc: "Error al obtener el estado del ticket. Error interno en el servidor.",
      });
  }
};
