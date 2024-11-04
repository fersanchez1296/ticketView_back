export const verifyRole = (role) => {
    return (req, res, next) => {
        if (req.user && req.user.rol === role) {
            next();
        } else {
            res.status(403).json({ mensaje: "Acceso denegado, rol insuficiente" });
        }
    };
};
