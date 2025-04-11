import { format } from "date-fns";
import { es } from "date-fns/locale";
import { obtenerFechaActual } from "../utils/fechas.js";

export const formatearCamposFecha = (req, res, next) => {
  const tickets = req.ticketsFormateados;
   try {
    const DATA = req.ticketsFormateados.map((ticket) => {
      const formatFecha = (fecha) => {
        if (!fecha || new Date(fecha).getFullYear() === 1900) {
          return "";
        }
        return format(fecha, "d 'de' MMMM 'de' yyyy, h:mm a", { locale: es });
      };

      const vencido =
        ticket.Fecha_limite_respuesta_SLA &&
        new Date(ticket.Fecha_limite_respuesta_SLA).getTime() < obtenerFechaActual();

      return {
        ...ticket,
        Fecha_hora_creacion: formatFecha(ticket.Fecha_hora_creacion),
        Fecha_hora_resolucion: formatFecha(ticket.Fecha_hora_resolucion),
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
        vencido,
        Historia_ticket: ticket.Historia_ticket
          ? ticket.Historia_ticket.map((historia) => ({
              Nombre: historia.Nombre,
              Titulo: historia.Titulo,
              Mensaje: historia.Mensaje,
              Fecha: formatFecha(historia.Fecha),
            }))
          : [],
        Reabierto: ticket.Reabierto
          ? ticket.Reabierto.map((r) => ({
              Descripcion: r.Descripcion,
              Fecha: formatFecha(r.Fecha),
            }))
          : [],
      };
    });
    return res.status(200).json(DATA);
  } catch (error) {
    return res.send("Error al formatear los campos");
  }
};
