import axios from "axios";
import FormData from "form-data";
import fs from "fs";

const guardarArchivo = async (req, res, next) => {
  if (
    (req.body.ticketState.NumeroRec_Oficio != "" ||
      req.body.ticketState.Numero_Oficio != "") &&
    !req.file
  ) {
    return res.status(400).json({
      desc: "Se proporcionó un nombre de archivo pero no se inlcuyó un archivo.",
    });
  }
  const token = req.cookies.access_token;
  const { originalname, path } = req.file;
  const formData = new FormData();
  formData.append("file", fs.createReadStream(path), originalname);
  try {
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
    fs.unlinkSync(path);
    if (!response) {
      return res
        .status(400)
        .json({ desc: "Ocurrió un error al guardar el archivo." });
    }
    req.dataArchivo = response.data;
    next();
  } catch (error) {
    res.status(500).json({ desc: "Error interno en el servidor." });
  }
};

export default guardarArchivo;
