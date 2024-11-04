import { Router } from "express";
import {
register
} from "../controllers/usuarios.cotroller.js";
import {verifyUserExists} from "../middleware/verifyUserExists.middleware.js"
import { verifyToken } from "../middleware/verifyToken.middleware.js";
import { verifyRole } from "../middleware/verifyRole.middleware.js";
const router = Router();

router.post("/register", verifyToken, verifyRole('Administrador'), verifyUserExists, register);
export default router;