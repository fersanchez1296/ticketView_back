import { Router } from "express";
import { dashboard } from "../controllers/dashboard.controller.js";
import { verifyToken } from "../middleware/verifyToken.middleware.js";
const router = Router();

router.get("/tickets/dashboard", verifyToken, dashboard);

export default router;
