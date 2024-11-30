import { USUARIO } from "../models/index.js";
import bcrypt from "bcryptjs";
import "dotenv/config";
import { generateToken } from "../functions/generateToken.function.js";
export const login = async (req, res) => {
  const { Username, Password } = req.body;
  try {
    const result = await USUARIO.findOne({
      Username,
    });
    console.log(result);
    if (result === null) {
      return res.status(404).json({ desc: "Usuario no encontrado" });
    }
    const isValid = await bcrypt.compare(Password, result.Password);
    if (!isValid) {
      return res.status(404).json({ desc: "Contraseña incorrecta" });
    }
    const userData = {
      Id: result._id,
      Username: result.Username,
      Nombre: result.Nombre,
      Rol: result.Rol,
      Area: result.Area,
    };
<<<<<<< HEAD
    console.log(userData)
=======
>>>>>>> 2ef7b9d0d5a3cc03374c6dd73f6470f7602ba3a1
    const token = generateToken(userData);
    return res
      .cookie("access_token", token, {
        httpOnly: true,
        maxAge: 1000 * 60 * 60,
      })
      .status(200)
<<<<<<< HEAD
      .json({ status: 200, desc: "Cookie Establecida", Rol: result.Rol });
=======
      .json({
        status: 200,
        desc: "Cookie Establecida",
        Rol: result.Rol,
        Nombre: result.Nombre,
      });
>>>>>>> 2ef7b9d0d5a3cc03374c6dd73f6470f7602ba3a1
  } catch (error) {
    console.log(error);
    res.status(401).send(error.error);
  }
};

export const logout = async (req, res) => {
  res.clearCookie("access_token").json({ desc: "Logout successful" });
};
