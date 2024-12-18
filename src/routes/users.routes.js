import { Router } from "express";
import multer from "multer";
import {
register,
getUsuariosPorCoordinacion,
pruebaemail
} from "../controllers/usuarios.cotroller.js";
import {verifyUserExists} from "../middleware/verifyUserExists.middleware.js"
import { verifyToken } from "../middleware/verifyToken.middleware.js";
import { verifyRole } from "../middleware/verifyRole.middleware.js";
const router = Router();
const upload = multer({ dest: 'temp/' });
router.post("/register", verifyToken, verifyRole('Root'), verifyUserExists, register);
router.get("/usuarios",  verifyToken, verifyRole(['Root', 'Administrador','Moderador']), getUsuariosPorCoordinacion);
router.post("/prueba", upload.single('file'), pruebaemail);
export default router;