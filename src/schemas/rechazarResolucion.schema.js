import Joi from "joi";
const rechazarResolucionSchema = Joi.object({
  motivo_rechazo: Joi.string().required(),
});

export default rechazarResolucionSchema;
