import { Router } from "express";
import {
  getTickets,
  getTicketsAbiertos,
  resolverTicket,
  ticketsCerrados,
  ticketsResueltos,
  ticketsEnCurso,
  ticketsReabiertos,
  ticketsPendientes,
  ticketsRevision,
  ticketsNuevos,
  areasReasignacion,
  reasignarTicket,
  getInfoSelects,
  cerrarTicket,
  reabrirTicket,
  aceptarResolucion,
  rechazarResolucion,
  obtenerAreas,
  obtenerTicketsPorArea,
  crearTicket,
  createTicket,
  obtenerAreasModerador,
  buscarTicket,
} from "../controllers/ticket.controller.js";
import { verifyToken } from "../middleware/verifyToken.middleware.js";
import { verifyRole } from "../middleware/verifyRole.middleware.js";
import { validateData } from "../middleware/validateData.middleware.js";
import { populateTickets } from "../middleware/populateTickets.middleware.js";
import { formatearCamposFecha } from "../middleware/formatearFechas.middleware.js";
const router = Router();

router.get("/tickets", verifyToken, getTicketsAbiertos);
router.get(
  "/tickets/nuevos",
  verifyToken,
  ticketsNuevos,
  formatearCamposFecha,
  populateTickets
);
router.get(
  "/tickets/en%20curso",
  verifyToken,
  ticketsEnCurso,
  formatearCamposFecha,
  populateTickets
);
router.get(
  "/tickets/reabiertos",
  verifyToken,
  ticketsReabiertos,
  formatearCamposFecha,
  populateTickets
);
router.get(
  "/tickets/pendientes",
  verifyToken,
  ticketsPendientes,
  formatearCamposFecha,
  populateTickets
);
router.get(
  "/tickets/cerrados",
  verifyToken,
  ticketsCerrados,
  formatearCamposFecha,
  populateTickets
);
router.get(
  "/tickets/resueltos",
  verifyToken,
  ticketsResueltos,
  formatearCamposFecha,
  populateTickets
);
router.get(
  "/tickets/revision",
  verifyToken,
  ticketsRevision,
  formatearCamposFecha,
  populateTickets
);
router.put(
  "/reasignar",
  verifyToken,
  verifyRole(["Root", "Administrador", "Moderador"]),
  validateData("Reasignar"),
  reasignarTicket
);
router.get("/tickets/reasignar/areas", verifyToken, areasReasignacion);
router.put(
  "/resolver",
  verifyToken,
  validateData("resolverTicket"),
  resolverTicket
);
router.get(
  "/tickets/crear/getInfoSelects",
  verifyToken,
  verifyRole(["Root", "Administrador"]),
  getInfoSelects
);
router.put(
  "/cerrar",
  verifyToken,
  verifyRole(["Root", "Administrador"]),
  validateData("Cerrar"),
  cerrarTicket
);
router.put(
  "/reabrir",
  verifyToken,
  verifyRole(["Root", "Administrador"]),
  validateData("Reabrir"),
  reabrirTicket
);
router.put(
  "/resolver/aceptar",
  verifyToken,
  verifyRole(["Moderador"]),
  validateData("aceptarResolucion"),
  aceptarResolucion
);
router.put(
  "/resolver/rechazar",
  verifyToken,
  verifyRole(["Moderador"]),
  validateData("rechazarResolucion"),
  rechazarResolucion
);

router.get("/tickets/historico", verifyToken, verifyRole(["Root"]), obtenerAreas);
router.get(
  "/tickets/historico/area",
  verifyToken,
  verifyRole(["Root", "Moderador"]),
  obtenerTicketsPorArea,
  formatearCamposFecha,
  populateTickets
);
router.get(
  "/tickets/coordinacion",
  verifyToken,
  verifyRole(["Moderador"]),
  obtenerAreasModerador
);

router.post(
  "/tickets/:id",
  // verifyToken,
  buscarTicket,
  formatearCamposFecha,
  populateTickets
);

 router.post("/ticket_crear",
  verifyToken,verifyRole(["Root"]),
  createTicket)

export default router;
