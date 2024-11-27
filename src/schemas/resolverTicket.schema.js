import Joi from "joi";
const resolverTicketSchema = Joi.object({
  _id: Joi.string().alphanum().required(),
  descripcion_resolucion: Joi.string().required(),
});

export default resolverTicketSchema;
