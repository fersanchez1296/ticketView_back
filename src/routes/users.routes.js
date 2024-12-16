import { Router } from "express";
import {
register,
getUsuariosPorCoordinacion,
pruebaemail
} from "../controllers/usuarios.cotroller.js";
import {verifyUserExists} from "../middleware/verifyUserExists.middleware.js"
import { verifyToken } from "../middleware/verifyToken.middleware.js";
import { verifyRole } from "../middleware/verifyRole.middleware.js";
const router = Router();

router.post("/register", verifyToken, verifyRole('Root'), verifyUserExists, register);
router.get("/usuarios",  verifyToken, verifyRole(['Root', 'Administrador','Moderador']), getUsuariosPorCoordinacion);

router.post("/pruebaemail", pruebaemail);
export default router;