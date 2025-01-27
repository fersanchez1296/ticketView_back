import Joi from "joi";
const resolverSchema = Joi.object({
  Respuesta_cierre_reasignado: Joi.string().required(),
  Files: Joi.object().allow(null, ""),
  vistoBueno: Joi.boolean(),
  Area_reasignado_a: Joi.string().alphanum().required(),
});

export default resolverSchema;
