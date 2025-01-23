import * as schemas from "../schemas/index.js";

export const validateData = (schemaName) => {
  return (req, res, next) => {
    const schema = schemas[`${schemaName}Schema`];
    if (!schema) {
      return res.status(400).json({ desc: "Invalid schema name" });
    };
    const { error } = schema.validate(req.body);
    if (error) {
      return res
        .status(400)
        .json({ desc: error.details?.[0]?.message || "Validation error" });
    }

    next();
  };
};
