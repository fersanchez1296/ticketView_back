import Joi from "joi";
const reabrirTicketSchema = Joi.object({
  _id: Joi.string().alphanum().required(),
  descripcion_reabrir: Joi.string().required(),
  descripcion_cierre: Joi.string().required(),
  Descripcion: Joi.string().required(),
});

export default reabrirTicketSchema;
