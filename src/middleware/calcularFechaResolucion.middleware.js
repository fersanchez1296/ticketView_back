import {
  addHours,
  setHours,
  setMinutes,
  addDays,
  getDay,
} from "date-fns";
import { obtenerFechaActual } from "../utils/fechas.js";
const HORARIO_INICIO = 8; // 8 AM
const HORARIO_FIN = 16; // 4 PM (sin minutos extras)
const HORAS_LABORALES = HORARIO_FIN - HORARIO_INICIO;

/**
 * Verifica si una fecha cae en sábado (6) o domingo (0).
 * @param {Date} fecha
 * @returns {boolean}
 */
function esFinDeSemana(fecha) {
  const dia = getDay(fecha);
  return dia === 0 || dia === 6; // 0 = Domingo, 6 = Sábado
}

/**
 * Ajusta la fecha al siguiente lunes si cae en fin de semana.
 * @param {Date} fecha
 * @returns {Date}
 */
function ajustarAProximoLunes(fecha) {
  while (esFinDeSemana(fecha)) {
    fecha = addDays(fecha, 1);
  }
  return fecha;
}

/**
 * Calcula la fecha límite de un ticket considerando solo el horario laboral (8 AM - 4 PM).
 * Se omiten horas fuera del horario laboral y días no laborables (fines de semana).
 *
 * @param {Date} fechaRegistro Fecha y hora en la que se registra el ticket.
 * @param {number} tiempoResolucionHoras Número de horas que se necesitan para resolver el ticket.
 * @param {string} zonaHoraria Ejemplo: 'America/Mexico_City'
 * @returns {Date} Fecha y hora límite en la zona horaria especificada.
 */
export function calcularFechaResolucion(req, res, next) {
  try {
    let fechaActual = obtenerFechaActual();
    const tiempoResolucionHoras = req.ticketState.tiempo;
    // Ajustar si el ticket fue registrado fuera del horario laboral
    const horaActual = fechaActual.getHours();
    if (horaActual < HORARIO_INICIO) {
      fechaActual = setHours(fechaActual, HORARIO_INICIO);
      fechaActual = setMinutes(fechaActual, 0);
    } else if (horaActual >= HORARIO_FIN) {
      fechaActual = addDays(fechaActual, 1);
      fechaActual = setHours(fechaActual, HORARIO_INICIO);
      fechaActual = setMinutes(fechaActual, 0);
    }

    // Ajustar si la fecha actual cae en fin de semana
    fechaActual = ajustarAProximoLunes(fechaActual);

    // Bucle para agregar horas respetando solo el horario laboral
    let horasRestantes = tiempoResolucionHoras;

    while (horasRestantes > 0) {
      let horasDisponiblesHoy = HORARIO_FIN - fechaActual.getHours();

      if (horasRestantes <= horasDisponiblesHoy) {
        // Si las horas caben en el horario de hoy, sumarlas y salir
        fechaActual = addHours(fechaActual, horasRestantes);
        horasRestantes = 0;
      } else {
        // Sumar solo las horas disponibles hoy y pasar al siguiente día hábil
        fechaActual = addHours(fechaActual, horasDisponiblesHoy);
        horasRestantes -= horasDisponiblesHoy;

        // Mover al siguiente día hábil a las 8 AM
        fechaActual = addDays(fechaActual, 1);
        fechaActual = setHours(fechaActual, HORARIO_INICIO);
        fechaActual = setMinutes(fechaActual, 0);

        // Ajustar si el nuevo día cae en fin de semana
        fechaActual = ajustarAProximoLunes(fechaActual);
      }
    }
    req.Fecha_limite_resolucion_SLA = fechaActual;
    return next();
  } catch (error) {
    return res
      .status(500)
      .json({
        desc: "Ocurrio un error al calcular la fecha de resolución. Error interno en el servidor.",
      });
  }
}
