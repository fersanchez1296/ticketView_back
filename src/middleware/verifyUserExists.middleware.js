import {
    USUARIO,
} from "../models/index.js"
import mongoose from 'mongoose';

export const verifyUserExists = async (req, res, next) => {
    const {username} = req.body;
    try {
        const result = await USUARIO.find({
            username : username
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


  
  
  
  