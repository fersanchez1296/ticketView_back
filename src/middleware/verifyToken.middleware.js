import jwt from "jsonwebtoken";
import "dotenv/config";
export const verifyToken = (req, res, next) => {
    const token = req.cookies.access_token;
    if(!token) {
        return res.status(403).send("No autorizado. Token inválido o expirado")
    }
    req.session = {user: null}
    try {
        const data = jwt.verify(token, process.env.JWT_TOKEN);
        req.user = data;
        next()
    } catch (error) {
        console.log(error);
        res.status(403).json({ mensaje: "Token inválido o expirado" })
    }
    
}