import { Router } from "express";
import {
  dashboard,
  general,
  oficio,
  nccliente,
  ncresolutor,
} from "../controllers/dashboard.controller.js";
import { verifyToken } from "../middleware/verifyToken.middleware.js";
import { buscarTicket } from "../controllers/ticket.controller.js";
import { populateTickets } from "../middleware/populateTickets.middleware.js";
import { formatearCamposFecha } from "../middleware/formatearFechas.middleware.js";
import { buscarCliente } from "../middleware/buscarCliente.middleware.js";
import { buscarResolutor } from "../middleware/buscarResolutor.middleware.js";
import { buscarArea } from "../middleware/buscarArea.middleware.js";
import { buscarSubcategoria } from "../middleware/buscarSubcategoria.middleware.js";
import { buscarId } from "../middleware/buscarId.middleware.js";
const router = Router();

router.get("/tickets/dashboard", verifyToken, dashboard);
router.get(
  "/tickets/general/",
  verifyToken,
  buscarCliente,
  buscarResolutor,
  buscarArea,
  buscarSubcategoria,
  buscarId,
  general,
  populateTickets,
  formatearCamposFecha
);
router.get(
  "/tickets/id/:id",
  verifyToken,
  buscarTicket,
  populateTickets,
  formatearCamposFecha
);
router.get(
  "/tickets/oficio/",
  verifyToken,
  oficio,
  populateTickets,
  formatearCamposFecha
);
router.get(
  "/tickets/nccliente/",
  verifyToken,
  buscarCliente,
  nccliente,
  populateTickets,
  formatearCamposFecha
);
router.get(
  "/tickets/ncresolutor/",
  verifyToken,
  buscarResolutor,
  ncresolutor,
  populateTickets,
  formatearCamposFecha
);
export default router;
