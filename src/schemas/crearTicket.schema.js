import Joi from "joi";
const crearSchema = Joi.object({
  Tipo_incidencia: Joi.string().alphanum().required(),
  Estado: Joi.string().alphanum().required(),
  Area_asignado: Joi.string().alphanum().required(),
  Asignado_a: Joi.string().alphanum().required(),
  Categoria: Joi.string().alphanum().required(),
  Servicio: Joi.string().alphanum().required(),
  Subcategoria: Joi.string().alphanum().required(),
  Nombre_cliente: Joi.string().required(),
  Direccion_general: Joi.string().alphanum().required(),
  Direccion_area: Joi.string().alphanum().required(),
  Descripcion: Joi.string().required(),
  Incidencia_grave: Joi.string().required(),
  Prioridad: Joi.string().alphanum().required(),
  NumeroRec_Oficio: Joi.string().allow(null, ''),
  Numero_Oficio: Joi.string().allow(null, ''),
});

export default crearSchema;
