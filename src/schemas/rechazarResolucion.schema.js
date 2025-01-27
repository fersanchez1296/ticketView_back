import Joi from "joi";
const rechazarResolucionSchema = Joi.object({
  feedback: Joi.string().required(),
  Nombre: Joi.string().required(),
});

export default rechazarResolucionSchema;
