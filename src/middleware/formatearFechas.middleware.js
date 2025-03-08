import { format } from "date-fns";
import { es } from "date-fns/locale";

export const formatearCamposFecha = (req, res, next) => {
  try {
    const DATA = req.tickets.map((ticket) => {
      const formatFecha = (fecha) => {
        if (!fecha || new Date(fecha).getFullYear() === 1900) {
          return "";
        }
        return format(fecha, "d 'de' MMMM 'de' yyyy, h:mm a", { locale: es });
      };

      return {
        ...ticket,
        Fecha_hora_creacion: formatFecha(ticket.Fecha_hora_creacion),
        Fecha_hora_resolucion: formatFecha(ticket.Fecha_hora_resolucion),
        Fecha_hora_reabierto: formatFecha(ticket.Fecha_hora_reabierto),
        Fecha_limite_resolucion_SLA: formatFecha(
          ticket.Fecha_limite_resolucion_SLA
        ),
        Fecha_hora_ultima_modificacion: formatFecha(
          ticket.Fecha_hora_ultima_modificacion
        ),
        Fecha_hora_cierre: formatFecha(ticket.Fecha_hora_cierre),
        Fecha_limite_respuesta_SLA: formatFecha(
          ticket.Fecha_limite_respuesta_SLA
        ),
        Historia_ticket: ticket.Historia_ticket
          ? ticket.Historia_ticket.map((historia) => ({
              Nombre: historia.Nombre,
              Mensaje: historia.Mensaje,
              Fecha: formatFecha(historia.Fecha),
            }))
          : [],
      };
    });
    req.ticketsFormateados = DATA;
    return next();
  } catch (error) {
    return res.send("Error al formatear los campos");
  }
};
