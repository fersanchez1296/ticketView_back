// import * as schemas from "../schemas/index.js";
// export const validateData = (schma) => {
//   return (req, res, next) => {
//     let error;
//     switch (schma) {
//       case "Crear":
//         error = schemas.crearTicketSchema.validate(req.body);
//         if (error) {
//           return res.status(400).json({ error: error.details[0].message });
//         }
//         break;
//       case "Cerrar":
//         error = schemas.cerrarTicketSchema.validate(req.body);
//         if (error) {
//           return res.status(400).json({ error: error.details[0].message });
//         }
//         break;
//       case "Aceptar":
//         error = schemas.aceptarResolucionSchema.validate(req.body);
//         if (error) {
//           return res.status(400).json({ error: error.details[0].message });
//         }
//         break;
//       case "Rechazar":
//         error = schemas.rechazarResolucionSchema.validate(req.body);
//         if (error) {
//           return res.status(400).json({ error: error.details[0].message });
//         }
//         break;
//       case "Editar":
//         error = schemas.editarTicketSchema.validate(req.body);
//         if (error) {
//           return res.status(400).json({ error: error.details[0].message });
//         }
//         break;
//       case "Reabrir":
//         error = schemas.reabrirTicketSchema.validate(req.body);
//         if (error) {
//           return res
//             .status(400)
//             .json({ error: error.error.details[0].message });
//         }
//         break;
//       case "Reasignar":
//         error = schemas.reasignarTicketSchema.validate(req.body);
//         if (error) {
//           return res.status(400).json({ error: error.details[0].message });
//         }
//         break;
//       case "Resolver":
//         error = schemas.resolverTicketSchema.validate(req.body);
//         if (error) {
//           console.log("Este se supone es el error=>", error);
//           return res.status(400).json({ error: error.details[0].message });
//         }
//         break;
//       default:
//         break;
//     }
//     next();
//   };
// };

import * as schemas from "../schemas/index.js";

export const validateData = (schemaName) => {
  return (req, res, next) => {
    const schema = schemas[`${schemaName}Schema`];
    if (!schema) {
      return res.status(400).json({ error: "Invalid schema name" });
    };
    const { error } = schema.validate(req.body);
    if (error) {
      return res
        .status(400)
        .json({ error: error.details?.[0]?.message || "Validation error" });
    }

    next();
  };
};
