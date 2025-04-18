import jwt from "jsonwebtoken";
export const verifyToken = (req, res, next) => {
    const token = req.cookies.access_token;
    if(!token) {
        return res.status(403).send("No autorizado. Token inválido o expirado")
    }
    if (!req.session) {
        req.session = {};
    }
    req.session.user = null;
    try {
        const data = jwt.verify(token, process.env.JWT_TOKEN);
        req.session.user = data;
        next()
    } catch (error) {
        res.status(403).json({ desc: "Token inválido o expirado" })
    }
    
}