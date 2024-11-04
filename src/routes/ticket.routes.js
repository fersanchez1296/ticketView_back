import { Router } from "express";
import {
getTickets, getTicketsAbiertos
} from "../controllers/ticket.controller.js";
import {verifyToken} from "../middleware/verifyToken.middleware.js"

const router = Router();

//router.post("/tickets", postTicket);
//router.get("/tickets", getTickets);
router.get("/tickets", verifyToken, getTicketsAbiertos);
//router.get("/tickets/:id", getSingleTicket);
//router.put("/tickets/:id", putTicket);
//router.delete("/tickets/:id", deleteTicket);

export default router;