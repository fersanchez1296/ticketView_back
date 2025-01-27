import {
    USUARIO,
} from "../models/index.js"
import mongoose from 'mongoose';

export const verifyUserExists = async (req, res, next) => {
    const {correo} = req.body;
    try {
        const result = await USUARIO.find({
            correo : correo
        })
        if(result.length === 0){
            next()
        }else{
            return res.status(409).json({ desc: 'El usuario ya existe' });
        }
        
    } catch (error) {
        console.log(error);
    }
};


  //Se va a verificar que el usuario no exista en la colección mediante su correo ya que el correo es un dato único
  
  
  