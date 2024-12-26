import { redisClient } from "../config/redis_connection.js";
const enviarCorreo = async (req, res) => {
  const correoData = req.correoData;
  redisClient.publish("channel_crearTicket", JSON.stringify(correoData));
  res.status(200).json({ desc: "El ticket se guardó correctamente" });
};

export default enviarCorreo;
