import Joi from "joi";
const resolverSchema = Joi.object({
  _id: Joi.string().alphanum().required(),
  Descripcion_resolucion: Joi.string().required(),
});

export default resolverSchema;
