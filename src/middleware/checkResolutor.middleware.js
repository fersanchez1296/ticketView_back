import { TICKETS, USUARIO } from "../models/index.js";

const obtenerModerador = async (id_area_resolutor) => {
  try {
    const moderador = await USUARIO.findOne({
      Rol: "Moderador",
      Area: { $in: id_area_resolutor },
    });
    return moderador;
  } catch (error) {
    console.log(error);
  }
};
/**
 *
 * @param {Lo que envia el cliente} req
 * @param {Lo que se envia al cliente} res
 * @param {Continuar con la siguiente funcion} next
 * Esta funcion verifica si la persona a la cual se encuentra
 * asignado el ticket (Asignado_a) y quien esta resolviendo
 * el ticket (req.session.user._id) son la misma persona,
 * ademas de validar el rol.
 * Si el resolutor (req.session.user._id) y a quien se
 * encuentra asignado el ticket (Asignado_a) son la misma persona
 * y si el rol de quien resulve es igual a "Usuario", se debe cambiar
 * el Asignado_a por un moderador relacionado con su area.
 * Si el rol de quien resuelve es distinto
 */
export const checkResolutor = async (req, res, next) => {
  const { _id, Asignado_a } = req.body.ticket; // id del ticket y Persona a quien se encuentra asignado el Ticket
  const { Id, Rol, Area } = req.session.user; //id y rol de la Persona quien esta resolviendo el ticket
  try {
    //validar si el usuario es el mismo
    const esMismoUsuario = await TICKETS.exists({
      _id,
      Asignado_a: Id,
    });
    console.log("Es mismo Usuario?", esMismoUsuario)
    if (esMismoUsuario) {
      console.log("EL USUARIO ES EL MISMO")
      //Si el usuario es el mismo, buscamos a un moderador de area
      const nuevoAsignado = await obtenerModerador(Area);
      console.log("Nuevo asignado", nuevoAsignado)
      //Guardamos en req.Asignado_a el id del nuevo asignado
      req.Asignado_a = nuevoAsignado._id;
    } else {
      //Si el usuario no es el mismo, validamos que el usuario no sea un administrador o superusuario
      //esto para respetar el flujo del ticket.
      console.log("NO ES EL MISMO USUARIO")
      const esModerador = await USUARIO.exists({
        Asignado_a,
        Rol: "Moderador",
      });
      console.log("Es moderador?", esModerador)
      if (esModerador) {
        console.log("EL ASIGNADO ES MODERADOR")
        req.Asignado_a = Asignado_a;
      } else {
        console.log("EL ASIGNADO NO ES MODERADOR")
        const nuevoAsignado = await obtenerModerador(esModerador.Area);
        console.log("Nuevo asignado", nuevoAsignado)
        req.Asignado_a = nuevoAsignado._id;
      }
    }
    next();
  } catch (error) {
    console.log(error);
  }
};
