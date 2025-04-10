export const buscarId = async (req, res, next) => {
  try {
    const { termino } = req.query;
    const id = parseInt(termino, 10);
    if (isNaN(id)) {
      req.Id = 0;
      return next();
    } else {
      req.id = id;
    }
    return next();
  } catch (error) {
    return res.status(500).json({
      desc: "Ocurrio un error al buscar el Id. Error interno en el servidor",
    });
  }
};
