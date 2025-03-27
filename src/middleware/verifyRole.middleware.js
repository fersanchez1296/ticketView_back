export const verifyRole = (role) => {
  return (req, res, next) => {
    if (req.session.user && role.includes(req.session.user.rol)) {
      return next();
    } else {
      console.log("Acceso denegado, rol insuficiente");
      res.status(403).json({ desc: "Acceso denegado, rol insuficiente" });
    }
  };
};
