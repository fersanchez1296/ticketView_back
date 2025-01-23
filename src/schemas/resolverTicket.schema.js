import Joi from "joi";
const resolverSchema = Joi.object({
  Respuesta_cierre_reasignado: Joi.string().required(),
  Files: Joi.object().allow(),
  vistoBueno: Joi.boolean(),
});

export default resolverSchema;
