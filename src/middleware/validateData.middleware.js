import * as schemas from "../schemas/index.js";
export const validateData = (schma) => {
  return (req, res, next) => {
    let error;
    switch (schma) {
      case "Crear":
        error = schemas.crearTicketSchema.validate(req.body);
        if (error) {
          return res.status(400).json({ error: error.details[0].message });
        }
        break;
      case "Cerrar":
        error = schemas.cerrarTicketSchema.validate(req.body);
        if (error) {
          return res.status(400).json({ error: error.details[0].message });
        }
        break;
      case "Aceptar":
        error = schemas.aceptarResolucionSchema.validate(req.body);
        if (error) {
          return res.status(400).json({ error: error.details[0].message });
        }
        break;
      case "Rechazar":
        error = schemas.rechazarResolucionSchema.validate(req.body);
        if (error) {
          return res.status(400).json({ error: error.details[0].message });
        }
        break;
      case "Editar":
        error = schemas.editarTicketSchema.validate(req.body);
        if (error) {
          return res.status(400).json({ error: error.details[0].message });
        }
        break;
      case "Reabrir":
        error = schemas.reabrirTicketSchema.validate(req.body);
        if (error) {
<<<<<<< HEAD
          return res.status(400).json({ error: error.details[0].message });
=======
          return res.status(400).json({ error: error.error.details[0].message });
>>>>>>> 2ef7b9d0d5a3cc03374c6dd73f6470f7602ba3a1
        }
        break;
      case "Reasignar":
        error = schemas.reasignarTicketSchema.validate(req.body);
        if (error) {
          return res.status(400).json({ error: error.details[0].message });
        }
        break;
      case "Resolver":
        error = schemas.resolverTicketSchema.validate(req.body);
        if (error) {
          return res.status(400).json({ error: error.details[0].message });
        }
        break;
      default:
        break;
    }
    next();
  };
};
