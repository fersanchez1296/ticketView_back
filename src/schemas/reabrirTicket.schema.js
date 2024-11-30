import Joi from "joi";
const reabrirTicketSchema = Joi.object({
  _id: Joi.string().alphanum().required(),
<<<<<<< HEAD
=======
  Asignado_a: Joi.string().alphanum().required(),
  Area_asignado: Joi.string().alphanum().required(),
  Reasignado_a: Joi.string().alphanum().required(),
  Area_reasignado_a: Joi.string().alphanum().required(),
>>>>>>> 2ef7b9d0d5a3cc03374c6dd73f6470f7602ba3a1
  descripcion_reabrir: Joi.string().required(),
  descripcion_cierre: Joi.string().required(),
  Descripcion: Joi.string().required(),
});

export default reabrirTicketSchema;
