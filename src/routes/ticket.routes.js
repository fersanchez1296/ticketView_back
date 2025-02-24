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
  reabrirFields,
  exportTicketsToExcel,
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
import { genericResponse } from "../middleware/genericResponse.middleware.js";
const router = Router();
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
  reabrirFields
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
  uploadMiddleware,
  verifyToken,
  verifyRole(["Root", "Administrador"]),
  startTransaction,
  asignarTicket,
  guardarArchivo,
  endTransaction,
  generarCorreoData,
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
  // validateData("cerrar"),
  startTransaction,
  cerrarTicket,
  guardarArchivo,
  endTransaction,
  generarCorreoData,
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
  generarCorreoData,
  enviarCorreo
);
router.put(
  "/tickets/resolver/:id",
  uploadMiddleware,
  verifyToken,
  verifyRole(["Root", "Administrador", "Moderador", "Usuario"]),
  startTransaction,
  // validateData("resolver"),
  resolverTicket,
  guardarArchivo,
  endTransaction,
  genericResponse
);
router.put(
  "/tickets/resolver/aceptar/:id",
  verifyToken,
  verifyRole(["Moderador"]),
  // validateData("aceptarResolucion"),
  startTransaction,
  aceptarResolucion,
  endTransaction,
  genericResponse
);
router.put(
  "/tickets/resolver/rechazar/:id",
  uploadMiddleware,
  verifyToken,
  verifyRole(["Moderador"]),
  // validateData("rechazarResolucion"),
  startTransaction,
  rechazarResolucion,
  guardarArchivo,
  endTransaction,
  genericResponse
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

router.get(
  "/tickets/export/excel",
  verifyToken,
  verifyRole(["Root"]),
  exportTicketsToExcel
);

export default router;
