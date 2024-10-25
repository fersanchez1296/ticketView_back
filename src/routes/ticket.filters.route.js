import { Router } from "express";
import {
getTicketsByFilter
} from "../controllers/ticket.filters.controller.js";

const router = Router();

router.get("/ticketsByFilter/", getTicketsByFilter);

export default router;