export const verifyRole = (role) => {
    return (req, res, next) => {
        if (req.session.user && role.includes(req.session.user.Rol)) {
            next();
        } else {
            res.status(403).json({ mensaje: "Acceso denegado, rol insuficiente" });
        }
    };
};
