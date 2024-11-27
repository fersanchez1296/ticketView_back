import Joi from "joi";
const reasignarTicketSchema = Joi.object({
  id_usuario_reasignar: Joi.string().alphanum().required(),
  id_ticket: Joi.string().alphanum().required(),
});

export default reasignarTicketSchema;
