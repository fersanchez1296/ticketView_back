import {
    USUARIO,
} from "../models/index.js"
import encryptPassword from "../functions/encryptPassword.function.js";
export const register = async (req, res) => {
    const {user} = req.session;
    if(!user) return res.status(403).send("Acceso no autorizado")
    const {password} = req.body;
    const hashedPassword = await encryptPassword(password);
    try {
        const newUsuario = new USUARIO({
            ...req.body,
            password: hashedPassword
        });
        newUsuario.save();
        if(newUsuario){
            res.status(200).json({ desc: 'Usuario Registrado Correctamente' });
        }else{
            res.status(500).json({ desc: 'Error al registrar el usuario. Inténtalo más tarde' });
        }
    } catch (error) {
        console.log(error);
    }
};

export const getUsuariosPorCoordinacion = async (req, res) => {
    const {user} = req.session;
    if(!user) return res.status(403).send("Acceso no autorizado")
    try {
        const usuarios = await USUARIO.find({"isActive" : true},{"Nombre" : 1, "Coordinacion" : 1})
        if(usuarios){
            res.status(200).json({ data: usuarios, desc: 'Usuario encontrados en la base de datos' });
        }else{
            res.status(500).json({ desc: 'Error al registrar el usuario. Inténtalo más tarde' });
        }
    } catch (error) {
        console.log(error);
    }
};


  
  
  
  