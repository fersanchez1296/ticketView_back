import { isAfter } from "date-fns";
export default function incTicketsUsuario(fecha_resolucion, fecha_limite) {
  const resuelto = isAfter(fecha_resolucion,fecha_limite);
  return resuelto ? "fuera_tiempo" : "a_tiempo";
}
