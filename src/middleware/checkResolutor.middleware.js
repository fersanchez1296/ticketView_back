import { TICKETS, USUARIO } from "../models/index.js";

const obtenerModerador = async(id_area_resolutor) => {
    try {
        const moderador = await USUARIO.findOne({Rol: "Moderador", Area: {$in : id_area_resolutor}})
        return  moderador;
    } catch (error) {
        
    }
}


export const checkResolutor = async (req, res, next) => {
  const id_ticket = req.body._id;
  const { Id: id_resolutor, Area: area_resolutor } = req.session.user;
  try {
    const isAssigned = await TICKETS.exists({
      _id: id_ticket,
      Asignado_a: id_resolutor,
    });

    if (isAssigned) {
      const moderador = await obtenerModerador(area_resolutor);
      next()
      return moderador;
    }
    next()
    return false;
  } catch (error) {
    console.log(error);
  }
};
