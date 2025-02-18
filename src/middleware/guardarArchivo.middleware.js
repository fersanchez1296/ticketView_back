import axios from "axios";
import FormData from "form-data";
import fs from "fs";
import { TICKETS } from "../models/index.js";

const guardarArchivos = async (req, res, next) => {
  if (!req.files || req.files.length === 0) {
    console.log("No se proporcionaron archivos...");
    return next();
  }

  console.log("Guardando archivos...");
  const token = req.cookies.access_token;
  const formData = new FormData();

  // Agregamos todos los archivos al FormData
  req.files.forEach((file) => {
    formData.append("files", fs.createReadStream(file.path), file.originalname);
  });

  try {
    // Enviar una sola petición con todos los archivos
    const response = await axios.post(
      "http://files-service-node:4400/files",
      formData,
      {
        headers: {
          ...formData.getHeaders(),
          Cookie: `access_token=${token}`,
        },
        withCredentials: true,
      }
    );

    // Eliminar los archivos temporales después de enviarlos
    req.files.forEach((file) => fs.unlinkSync(file.path));

    if (!response.data || !Array.isArray(response.data)) {
      console.error("Respuesta inválida al guardar archivos:", response);
      return res
        .status(400)
        .json({ desc: "Ocurrió un error al guardar los archivos." });
    }

    // Guardar en la base de datos
    const result = await TICKETS.findOneAndUpdate(
      { _id: req.ticketIdDb },
      { $push: { Files: { $each: response.data } } },
      { session: req.mongoSession }
    );
    console.log(result);

    if (!result) {
      throw new Error("Error al guardar los archivos en la BD.");
    }

    console.log("Archivos guardados exitosamente.");
    return next();
  } catch (error) {
    //console.error("Error al guardar los archivos:", error);
    await req.mongoSession.abortTransaction();
    req.mongoSession.endSession();
    return res.status(500).json({ desc: "Error interno en el servidor." });
  }
};

export default guardarArchivos;
