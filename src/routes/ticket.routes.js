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
  buscarTicket,
  editTicket,
  asignarTicket,
  crearNota,
  reabrirFields,
  exportTicketsToExcel,
  pendienteTicket,
  dependenciasClientes,
  encontartTicket,
  regresarcorreos,
  regresarTicket,
  obtenerTicketsResolutor,
  contactoCliente,
  retornarTicket,
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
import { populateCorreos } from "../controllers/ticket.controller.js";
import { verificarAsignado } from "../middleware/verificarAsignado.middleware.js";
import { obtenerEstadoTicket } from "../middleware/obtenerEstadoTicket.middleware.js";
import incrementarContadorTickets from "../middleware/incrementarContadorTickets.middleware.js";
const router = Router();
router.get(
  "/tickets/estado/:estado",
  verifyToken,
  getTickets,
  populateTickets,
  formatearCamposFecha
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
  incrementarContadorTickets,
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
  incrementarContadorTickets,
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
  verifyRole(["Root", "Administrador", "Moderador", "Auditor"]),
  obtenerAreas
);
router.get(
  "/tickets/historico/area",
  verifyToken,
  verifyRole(["Root", "Administrador", "Moderador", "Auditor"]),
  obtenerTicketsPorArea,
  populateTickets,
  formatearCamposFecha
);
router.post(
  "/tickets/buscar/:id",
  verifyToken,
  buscarTicket,
  populateTickets,
  formatearCamposFecha
);
//TODO agregar la validacion de la informacion por schema
router.post(
  "/tickets/crear/ticket",
  uploadMiddleware,
  verifyToken,
  verifyRole(["Root", "Administrador"]),
  startTransaction,
  guardarCliente,
  verificarAsignado,
  obtenerEstadoTicket,
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
  "/tickets/retornoMesa/:id",
  uploadMiddleware,
  verifyToken,
  startTransaction,
  retornarTicket,
  guardarArchivo,
  endTransaction,
  genericResponse
);

router.get(
  "/tickets/resolutor/:id",
  verifyToken,
  verifyRole(["Root", "Administrador", "Moderador", "Auditor"]),
  obtenerTicketsResolutor,
  populateTickets,
  formatearCamposFecha
);

router.get(
  "/tickets/export/excel",
  verifyToken,
  verifyRole(["Root"]),
  exportTicketsToExcel
);

router.put(
  "/tickets/editar/:id", //agregar id como parametro
  uploadMiddleware,
  verifyToken,
  verifyRole(["Root", "Administrador"]),
  startTransaction,
  editTicket,
  guardarArchivo,
  endTransaction,
  genericResponse
);

router.put(
  "/tickets/pendiente/:id", //agregar id como parametro
  verifyToken,
  verifyRole(["Usuario"]),
  startTransaction,
  pendienteTicket,
  endTransaction,
  generarCorreoData,
  enviarCorreo
);

router.put(
  "/tickets/contactoCliente/:id",
  verifyToken,
  verifyRole(["Root", "Administrador"]),
  startTransaction,
  contactoCliente,
  endTransaction,
  generarCorreoData,
  enviarCorreo
);

router.get("/tickets/clientes/dependencias", verifyToken, dependenciasClientes);

router.get(
  "/tickets/correos/:id",
  verifyToken,
  encontartTicket,
  populateCorreos,
  regresarcorreos
);

router.put(
  "/tickets/regresar/:id",
  uploadMiddleware,
  verifyToken,
  verifyRole(["Root"]),
  startTransaction,
  regresarTicket,
  guardarArchivo,
  endTransaction,
  generarCorreoData,
  enviarCorreo
);
export default router;
