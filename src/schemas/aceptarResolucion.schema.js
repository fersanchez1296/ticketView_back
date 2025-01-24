import Joi from "joi";
const aceptarResolucionSchema = Joi.object({
  Nombre: Joi.string().required(),
});

export default aceptarResolucionSchema;
