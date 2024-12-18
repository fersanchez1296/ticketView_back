export const verifyRole = (role) => {
  return (req, res, next) => {
    console.log("entrando a verificar el rol");
    if (req.session.user && role.includes(req.session.user.rol)) {
      next();
    } else {
      console.log("Acceso denegado, rol insuficiente");
      res.status(403).json({ mensaje: "Acceso denegado, rol insuficiente" });
    }
  };
};
