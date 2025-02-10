import { redisClient } from "../config/redis_connection.js";

const enviarCorreo = async (req, res) => {
  try {
    const correoData = req.correoData;
    const channel = req.channel;
    console.log("middleware", correoData, channel);

    // Asegúrate de que el canal y el mensaje sean cadenas
    if (typeof channel !== "string") {
      throw new TypeError("El canal debe ser una cadena");
    }
    const message = JSON.stringify(correoData);

    // Publicar el mensaje en el canal
    if(!req.standby){
      await redisClient.publish(channel, message);
    }
    if (req.ticketId) {
      return res
        .status(200)
        .json({ desc: `Se creó el número de ticket ${req.ticketId}` });
    }
    return res
      .status(200)
      .json({ desc: "Transacción realizada correctamente" });
  } catch (error) {
    console.error("Error al enviar el correo:", error);
    res.status(500).json({ error: "Error al enviar el correo" });
  }
};

export default enviarCorreo;
