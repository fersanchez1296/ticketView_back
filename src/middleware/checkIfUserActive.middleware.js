import { USUARIO } from "../models/index.js";

const obtenerSuperUsuario = async () => {
  try {
    const user = await USUARIO.find({ Rol: "Root", isActive: true });
    return user;
  } catch (error) {}
};

export const checkIfUserActive = async (req, res, next) => {
  const { Creado_por } = req.body;
  try {
    const userIsActive = await USUARIO.exists({
      isActive: true,
      Asignado_a: Creado_por,
    });

    if (!userIsActive) {
      const usuario = await obtenerSuperUsuario();
      next();
      return usuario;
    }

    next();
    return false;
  } catch (error) {
    console.log(error);
  }
};
