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
  createTicket,
  obtenerAreasModerador,
  buscarTicket,
  editTicket,
  ticketsStandby,
  asignarTicket,
} from "../controllers/ticket.controller.js";
import { verifyToken } from "../middleware/verifyToken.middleware.js";
import { verifyRole } from "../middleware/verifyRole.middleware.js";
import { validateData } from "../middleware/validateData.middleware.js";
import { populateTickets } from "../middleware/populateTickets.middleware.js";
import { formatearCamposFecha } from "../middleware/formatearFechas.middleware.js";
import { uploadMiddleware } from "../middleware/upload.middleware.js";
import { guardarCliente } from "../middleware/guardarCliente.middleware.js";
import multer from "multer";
import guardarArchivo from "../middleware/guardarArchivo.middleware.js";
import enviarCorreo from "../middleware/enviarCorreo.middleware.js";
const router = Router();
router.get("/tickets", verifyToken, getTicketsAbiertos);
router.get(
  "/tickets/nuevos",
  verifyToken,
  ticketsNuevos,
  formatearCamposFecha,
  populateTickets
);
//pendiente de usar
// router.get(
//   "/tickets/estado/:estado",
//   verifyToken,
//   ticketsStandby,
//   formatearCamposFecha,
//   populateTickets
// );
router.get(
  "/tickets/standby",
  verifyToken,
  ticketsStandby,
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
  "/tickets/reasignar/:id",
  verifyToken,
  verifyRole(["Root", "Administrador", "Moderador"]),
  validateData("reasignar"),
  reasignarTicket,
  enviarCorreo
);
router.put(
  "/tickets/asignar/:id",
  verifyToken,
  verifyRole(["Root", "Administrador"]),
  asignarTicket,
  enviarCorreo
);
router.get("/tickets/reasignar/areas", verifyToken, areasReasignacion);
router.get(
  "/tickets/crear/getInfoSelects",
  verifyToken,
  verifyRole(["Root", "Administrador"]),
  getInfoSelects
);
router.put(
  "/tickets/cerrar/:id",
  uploadMiddleware,
  verifyToken,
  verifyRole(["Root", "Administrador"]),
  validateData("cerrar"),
  guardarArchivo,
  cerrarTicket,
  enviarCorreo
);
router.put(
  "/tickets/reabrir",
  verifyToken,
  verifyRole(["Root", "Administrador"]),
  validateData("reabrir"),
  reabrirTicket
);
router.put(
  "/tickets/resolver/:id",
  uploadMiddleware,
  verifyToken,
  verifyRole(["Root", "Administrador", "Moderador", "Usuario"]),
  validateData("resolver"),
  guardarArchivo,
  resolverTicket
);
router.put(
  "/tickets/resolver/aceptar/:id",
  verifyToken,
  verifyRole(["Moderador"]),
  validateData("aceptarResolucion"),
  aceptarResolucion
);
router.put(
  "/tickets/resolver/rechazar/:id",
  verifyToken,
  verifyRole(["Moderador"]),
  validateData("rechazarResolucion"),
  rechazarResolucion
);
router.get(
  "/tickets/historico",
  verifyToken,
  verifyRole(["Root", "Administrador"]),
  obtenerAreas
);
router.get(
  "/tickets/historico/area",
  verifyToken,
  verifyRole(["Root","Administrador", "Moderador"]),
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
  "/tickets/buscar/:id",
  verifyToken,
  buscarTicket,
  formatearCamposFecha,
  populateTickets
);
//TODO agregar la validacion de la informacion por schema
router.post(
  "/tickets/crear/ticket",
  uploadMiddleware,
  verifyToken,
  verifyRole(["Root", "Administrador"]),
  guardarCliente,
  guardarArchivo,
  createTicket,
  enviarCorreo
);
router.put(
  "/tickets/editar", //agregar id como parametro
  verifyToken,
  verifyRole(["Root", "Administrador"]),
  editTicket
);

export default router;
