import { Router } from "express";
import {
  getTickets,
  resolverTicket,
  areasReasignacion,
  areasAsignacion,
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
  asignarTicket,
  ticketsPorResolutor,
  crearNota,
  reabrirFields
} from "../controllers/ticket.controller.js";
import { verifyToken } from "../middleware/verifyToken.middleware.js";
import { verifyRole } from "../middleware/verifyRole.middleware.js";
import { validateData } from "../middleware/validateData.middleware.js";
import { populateTickets } from "../middleware/populateTickets.middleware.js";
import { formatearCamposFecha } from "../middleware/formatearFechas.middleware.js";
import { uploadMiddleware } from "../middleware/upload.middleware.js";
import { guardarCliente } from "../middleware/guardarCliente.middleware.js";
import guardarArchivo from "../middleware/guardarArchivo.middleware.js";
import enviarCorreo from "../middleware/enviarCorreo.middleware.js";
import { startTransaction } from "../middleware/startTransaction.middleware.js";
import { endTransaction } from "../middleware/endTransaction.middleware.js";
import { generarCorreoData } from "../middleware/generarCorreoData.middleware.js";
import { responseNota } from "../middleware/respuestaNota.middleware.js";
const router = Router();
//router.get("/tickets", verifyToken, getTicketsAbiertos);
router.get(
  "/tickets/estado/:estado",
  verifyToken,
  getTickets,
  formatearCamposFecha,
  populateTickets
);
router.get(
  "/tickets/reabrir/fields",
  verifyToken,
  verifyRole(["Root", "Administrador"]),
  reabrirFields,
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
router.get("/tickets/asignar/areas", verifyToken, areasAsignacion);
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
  "/tickets/reabrir/:id",
  uploadMiddleware,
  verifyToken,
  verifyRole(["Root", "Administrador"]),
  startTransaction,
  reabrirTicket,
  guardarArchivo,
  endTransaction,
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
  verifyRole(["Root", "Administrador", "Moderador"]),
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
  startTransaction,
  guardarCliente,
  createTicket,
  guardarArchivo,
  endTransaction,
  generarCorreoData,
  enviarCorreo
);

router.put(
  "/tickets/nota/:id",
  uploadMiddleware,
  verifyToken,
  startTransaction,
  crearNota,
  guardarArchivo,
  endTransaction,
  responseNota
);

router.put(
  "/tickets/editar", //agregar id como parametro
  verifyToken,
  verifyRole(["Root", "Administrador"]),
  editTicket
);

router.get(
  "/tickets/resolutor/:userId",
  verifyToken,
  verifyRole(["Root", "Administrador", "Moderador"]),
  ticketsPorResolutor,
  formatearCamposFecha,
  populateTickets
);

export default router;
