import Joi from "joi";
const cerrarSchema = Joi.object({
  _id: Joi.string().alphanum().required(),
  Descripcion_cierre: Joi.string().required(),
  Causa: Joi.string().required(),
});

export default cerrarSchema;
