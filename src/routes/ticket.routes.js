import { Router } from "express";
import {
  getTickets,
  getTicketsAbiertos,
  resolverTicket,
  getTicketsCerrados,
  getTicketsResueltos,
  getTicketsEnCurso,
  getTicketsReabiertos,
  getTicketsPendientes,
  getTicketsRevision,
  getTicketsNuevos,
  areasReasignacion,
  reasignarTicket,
  getInfoSelects,
  cerrarTicket,
  reabrirTicket,
  aceptarResolucion,
  rechazarResolucion,
  historico,
  historicoAreas,
  coordinacion,
} from "../controllers/ticket.controller.js";
import { verifyToken } from "../middleware/verifyToken.middleware.js";
import { verifyRole } from "../middleware/verifyRole.middleware.js";
import { validateData } from "../middleware/validateData.middleware.js";
import { correo_reasignarTicket } from "../controllers/envio_correos.js";
const router = Router();

router.get("/tickets", verifyToken, getTicketsAbiertos);
router.get("/tickets/nuevos", verifyToken, getTicketsNuevos);
router.get("/tickets/en%20curso", verifyToken, getTicketsEnCurso);
router.get("/tickets/reabiertos", verifyToken, getTicketsReabiertos);
router.get("/tickets/pendientes", verifyToken, getTicketsPendientes);
router.get("/tickets/cerrados", verifyToken, getTicketsCerrados);
router.get("/tickets/resueltos", verifyToken, getTicketsResueltos);
router.get("/tickets/revision", verifyToken, getTicketsRevision);
router.put(
  "/reasignar",
  verifyToken,
  verifyRole(["Root", "Administrador", "Moderador"]),
  validateData("Reasignar"),
  reasignarTicket,correo_reasignarTicket,
);
router.get("/reasignar/areas", verifyToken, areasReasignacion);
router.put("/resolver", verifyToken, validateData("Resolver"), resolverTicket);
router.get(
  "/crear/getInfoSelects",
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
  "/resolucion/aceptar",
  verifyToken,
  verifyRole(["Moderador"]),
  validateData("Aceptar"),
  aceptarResolucion
);
router.put(
  "/resolucion/rechazar",
  verifyToken,
  verifyRole(["Moderador"]),
  validateData("Rechazar"),
  rechazarResolucion
);
router.get("/historico", verifyToken, verifyRole(["Root"]), historico);
router.get(
  "/historico/area",
  verifyToken,
  verifyRole(["Root", "Moderador"]),
  historicoAreas
);
router.get(
  "/coordinacion",
  verifyToken,
  verifyRole(["Moderador"]),
  coordinacion
);

export default router;
