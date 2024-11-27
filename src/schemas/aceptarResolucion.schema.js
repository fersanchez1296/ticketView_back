import Joi from "joi";
const aceptarResolucionSchema = Joi.object({
  _id: Joi.string().alphanum().required(),
});

export default aceptarResolucionSchema;
