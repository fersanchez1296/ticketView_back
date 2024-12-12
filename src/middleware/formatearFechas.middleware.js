import { format } from "date-fns";
import { es } from "date-fns/locale";

export const formatearCamposFecha = (req, res, next) => {
  const DATA = req.tickets.map((ticket) => {
    return {
      ...ticket,
      Fecha_hora_creacion: format(
        ticket.Fecha_hora_creacion,
        "d 'de' MMMM 'de' yyyy, h:mm a",
        { locale: es }
      ),
      Fecha_limite_resolucion_SLA: format(
        ticket.Fecha_limite_resolucion_SLA,
        "d 'de' MMMM 'de' yyyy, h:mm a",
        { locale: es }
      ),
      Fecha_hora_ultima_modificacion: format(
        ticket.Fecha_hora_ultima_modificacion,
        "d 'de' MMMM 'de' yyyy, h:mm a",
        { locale: es }
      ),
      Fecha_hora_cierre: format(
        ticket.Fecha_hora_cierre,
        "d 'de' MMMM 'de' yyyy, h:mm a",
        { locale: es }
      ),
      Fecha_limite_respuesta_SLA: format(
        ticket.Fecha_limite_respuesta_SLA,
        "d 'de' MMMM 'de' yyyy, h:mm a",
        { locale: es }
      ),
      Historia_ticket: ticket.Historia_ticket
        ? ticket.Historia_ticket.map((historia) => ({
            Nombre: historia.Nombre,
            Mensaje: historia.Mensaje,
            Fecha: format(historia.Fecha, "d 'de' MMMM 'de' yyyy, h:mm a", {
              locale: es,
            }),
          }))
        : [],
    };
  });
  req.ticketsFormateados = DATA;
  next();
};
