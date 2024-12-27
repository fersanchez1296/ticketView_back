import { redisClient } from "../config/redis_connection.js";
const enviarCorreo = async (req, res) => {
  const correoData = req.correoData;
  const channel =  req.channel;
  redisClient.publish(channel, JSON.stringify(correoData));
  res.status(200).json({ desc: "Transacción realizada correctamente" });
};
export default enviarCorreo;
