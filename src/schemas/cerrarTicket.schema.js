import Joi from "joi";
const cerrarSchema = Joi.object({
  Files: Joi.object().allow(null, ""),
  Descripcion_cierre: Joi.string().required(),
  Numero_Oficio: Joi.string().allow("").required(),
});

export default cerrarSchema;
