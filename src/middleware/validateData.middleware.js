import * as schemas from "../schemas/index.js";

export const validateData = (schemaName) => {
  return (req, res, next) => {
    const resolverTicketStore = JSON.parse(req.body.resolverTicketStore);
    req.resolverTicketStore = resolverTicketStore;
    const schema = schemas[`${schemaName}Schema`];
    if (!schema) {
      return res.status(400).json({ desc: "Invalid schema name" });
    }
    // const { error } = schema.validate(resolverTicketStore.Respuesta_cierre_reasignado);
    // if (error) {
    //   return res
    //     .status(400)
    //     .json({ desc: error.details?.[0]?.message || "Validation error" });
    // }

    next();
  };
};
