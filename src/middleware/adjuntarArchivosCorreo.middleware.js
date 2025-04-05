import FormData from "form-data";
import axios from "axios";
import fs from "fs";
export const adjuntarArchivosCorreo = async (req, res, next) => {
  const session = req.mongoSession;
  try {
    const formData = new FormData();
    const correoData = {
      details: req.cuerpo,
      idTicket: req.ticketId,
    };
    formData.append("correoData", JSON.stringify(correoData));
    const token = req.cookies.access_token;
    if (req.files.length !== 0) {
      req.files.forEach((file) => {
        formData.append(
          "files",
          fs.createReadStream(file.path),
          file.originalname
        );
      });
    }
    const response = await axios.post(
      `http://email-service-node:4300/${req.endpoint}/${req.params.id}`,
      formData,
      {
        headers: {
          ...formData.getHeaders(),
          Cookie: `access_token=${token}`,
        },
        withCredentials: true,
      }
    );
    if (response.status === 200 && response.data.success) {
      req.response = response.data.desc;
      return next();
    } else {
      console.error(
        "⚠️    Hubo un problema al enviar el correo:",
        response.data.desc
      );
      await session.abortTransaction();
      session.endSession();
      return res.status(500).json({ message: response.data.desc });
    }
  } catch (error) {
    console.error(
      "⚠️    Hubo un problema al enviar el correo. Error interno en el servidor.",
      error
    );
    await session.abortTransaction();
    session.endSession();
    return res.status(500).json({
      message:
        "⚠️    Hubo un problema al enviar el correo. Error interno en el servidor.",
    });
  }
};
