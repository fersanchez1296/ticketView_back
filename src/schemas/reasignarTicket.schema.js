import Joi from "joi";
const reasignarSchema = Joi.object({
  Prioridad: Joi.string().alphanum().allow("").required(),
  Fecha_limite_respuesta_SLA: Joi.string().alphanum().allow("").required(),
  Fecha_limite_resolucion_SLA: Joi.string().alphanum().allow("").required(),
  Reasignado_a: Joi.string().alphanum().required(),
  Area_reasignado_a: Joi.string().alphanum().required(),
  Correo: Joi.string().email().required(),
  Nombre: Joi.string().required(),
  vistoBueno: Joi.boolean().required(),
});

export default reasignarSchema;
