import { CLIENTES } from "../models/index.js";

export const buscarCliente = async (req, res, next) => {
  try {
    req.cliente = [];
    const { termino } = req.query;
    const result = await CLIENTES.find({
      $or: [
        { Nombre: { $regex: termino, $options: "i" } },
        { Correo: { $regex: termino, $options: "i" } },
      ],
    });
    if (result.length) {
      req.cliente.push({
        field: "Cliente",
        ids: result.map((c) => c._id),
      });
      return next();
    }
    req.cliente = result;
    return next();
  } catch (error) {
    return res.status(500).json({
      desc: "Ocurrio un error al buscar el cliente. Error interno en el servidor",
    });
  }
};
