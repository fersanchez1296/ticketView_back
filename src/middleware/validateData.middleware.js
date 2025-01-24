import * as schemas from "../schemas/index.js";

export const validateData = (schemaName) => {
  return (req, res, next) => {
    const schema = schemas[`${schemaName}Schema`];
    if (!schema) {
      console.log("Invalid schema name");
      return res.status(400).json({ error: "Invalid schema name" });
    }
    if(req.body.ticketData){
      req.ticketData = JSON.parse(req.body.ticketData);
    }
    const { error } = schema.validate(
      req.body.ticketData ? JSON.parse(req.body.ticketData) : req.body
    );
    if (error) {
      console.log("Error de validacion de la informacion", error);
      return res
        .status(400)
        .json({ error: error.details?.[0]?.message || "Validation error" });
    }
    next();
  };
};
