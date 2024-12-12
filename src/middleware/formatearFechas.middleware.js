import { format } from "date-fns";
import { es } from "date-fns/locale";

export const formatearCampos = (req, res) => {
    // if (!date || !(date instanceof Date)) {
    //     return "Fecha no válida";
    //   }
  const DATA = req.ticketsPopulated.map((ticket) => {
    return {
      ...ticket,
      Fecha_hora_creacion: format(ticket.Fecha_hora_creacion, "d 'de' MMMM 'de' yyyy, h:mm a", { locale: es }),
    //   Fecha_limite_resolucion_SLA: formateDate(
    //     ticket.Fecha_limite_resolucion_SLA
    //   ),
    //   Fecha_hora_ultima_modificacion: formateDate(
    //     ticket.Fecha_hora_ultima_modificacion
    //   ),
    //   Fecha_hora_cierre: formateDate(ticket.Fecha_hora_cierre),
    //   Fecha_limite_respuesta_SLA: formateDate(
    //     ticket.Fecha_limite_respuesta_SLA
    //   ),
    //   Historia_ticket: ticket.Historia_ticket
    //     ? ticket.Historia_ticket.map((historia) => ({
    //         Nombre: historia.Nombre,
    //         Mensaje: historia.Mensaje,
    //         Fecha: formateDate(historia.Fecha),
    //       }))
    //     : [],
    };
  });
  return res.send(DATA);
};


