import { redisClient } from "../config/redis_connection.js";

const enviarCorreo = async (req, res) => {
  try {
    const correoData = req.correoData;
    const channel = req.channel;
    if (typeof channel !== "string") {
      throw new TypeError("El canal debe ser una cadena");
    }
    const message = JSON.stringify(correoData);
    await redisClient.publish(channel, message);
    if (channel === "channel_crearTicket") {
      console.log("Correo enviado");
      return res
        .status(200)
        .json({ desc: `Se creó el ticket con número ${req.ticketId}` });
    }
    console.log("Correo enviado");
    return res
      .status(200)
      .json({
        desc: `Acción realizada correctamente para el ticket con número #${req.ticketId}`,
      });
  } catch (error) {
    console.error("Error al enviar el correo:", error);
    res.status(500).json({ error: "Error al enviar el correo" });
  }
};

export default enviarCorreo;
