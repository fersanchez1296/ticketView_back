import { TICKETS } from "../models/index.js";
import { redisClient } from "../config/redis_connection.js";
export const responseNota = async (req, res) => {
  try {
    const { rol } = req.session.user;
    console.log(req.ticket.Reasignado_a);
    console.log(req.ticket);
    if (!req.ticket.Reasignado_a || req.ticket.Reasignado_a.lenght === 0) {
      return res.status(201).json({
        desc: "Nota agregada correctamente a la sección de historico del ticket.",
      });
    }
    if (rol !== "Usuario") {
      const channel = req.channel;
      const populate = await TICKETS.populate(req.ticket, [
        {
          path: "Reasignado_a",
          select: "Nombre Correo _id",
        },
      ]);
      const correoData = {
        idTicket: populate.Id,
        nota: req.Nota,
        correoResolutor: populate.Reasignado_a[0].Correo ?? "",
        nombreUsuario: populate.Reasignado_a[0].Nombre ?? "",
      };
      const message = JSON.stringify(correoData);
      await redisClient.publish(channel, message);
      return res.status(201).json({
        desc: "Nota agregada correctamente a la sección de historico del ticket. Se notificó al resolutor via correo electrónico.",
      });
    }
    return res.status(201).json({
      desc: "Nota agregada correctamente a la sección de historico del ticket.",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      desc: "Ocurrio un error al agregar la nota. Error interno en el servidor.",
    });
  }
};
