import incTicketsUsuario from "../utils/ticketEnTiempo.js";
import { incTickets } from "../repository/puts.js";
export default async function incrementarContadorTickets(req, res, next) {
  const session = req.mongoSession;
  try {
    if (req.vistoBueno) {
      return next();
    }
    const result = incTicketsUsuario(
      req.Fecha_hora_resolucion,
      req.Fecha_limite_resolucion_SLA
    );
    const resultIncTicketsUsuario = await incTickets(req.userId, result, session);

    if (!resultIncTicketsUsuario) {
      await session.abortTransaction();
      session.endSession();
      return res.status(500).json({
        desc: "Ocurrió un error al actualizar el contador de tickets del usuario.",
      });
    }
    return next();
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    return res.status(500).json({
      desc: "Error interno en el servidor. Ocurrió un error al actualizar el contador de tickets del usuario.",
    });
  }
}
