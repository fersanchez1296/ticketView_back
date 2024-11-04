import {
    USUARIO,
} from "../models/index.js"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import "dotenv/config";
import cookieParser from "cookie-parser";
export const login = async (req, res) => {
    const {username, password} = req.body;
    try {
        const result = await USUARIO.findOne({
            username
        })
        if(result === null){
            res.status(404).json({desc: "Usuario no encontrado"})
        }
        const isValid = await bcrypt.compare(password, result.password);
        if(!isValid){
            res.status(404).json({desc: "Contraseña incorrecta"})
        }
        const userData = {
            username : result.username,
            nombre : result.nombre_completo,
            rol : result.rol
        }
        const token = jwt.sign({...userData, password : result.password},process.env.JWT_TOKEN,{
            expiresIn: "1h"
        })
        res.cookie("access_token", token, {
            httpOnly: true,
            maxAge : 1000 * 60 * 60
        }).status(200).send(userData)
    } catch (error) {
        res.status(401).send(error.error)
    }
};

export const logout = async (req, res) => {
    res.clearCookie("access_token").json({desc: "Logout successful"});
};


  
  
  
  