import { Router } from "express";
import {
login, logout
} from "../controllers/auth.controller.js";
import { addToBlacklist } from "../middleware/addToBlacklist.middleware.js";
import { verifyToken } from "../middleware/verifyToken.middleware.js";

const router = Router();

router.post("/login", login);
router.post("/logout",verifyToken, addToBlacklist, logout);
export default router;