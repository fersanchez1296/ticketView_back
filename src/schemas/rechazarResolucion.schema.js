import Joi from "joi";
const rechazarResolucionSchema = Joi.object({
  _id: Joi.string().alphanum().required(),
  motivo_rechazo: Joi.string().required(),
});

export default rechazarResolucionSchema;
