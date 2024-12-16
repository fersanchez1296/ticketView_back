import "dotenv/config";
import nodemailer from "nodemailer";
import { USUARIO } from "../models/index.js";
import { TICKETS } from "../models/index.js";

export const correo_reasignarTicket = async (req, res) => {
  const { id_usuario_reasignar, id_ticket } = req.body;
  const { Id, Nombre, Rol, Correo } = req.session.user;
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: false, // Cambia según sea necesario
    // tls: {
    //   rejectUnauthorized: false, // Solo si es necesario
    // },
  });

  // Variables dinámicas que puedes personalizar
  const user_reasignar = await USUARIO.findOne({ _id: id_usuario_reasignar });
  const ticket = await TICKETS.findOne({ _id: id_ticket });
  const Correo_resolutor = user_reasignar.Correo;
  const Id_ticket = ticket.Id;
  const Descripcion_ticket = ticket.Descripcion;
  const Nombre_cliente = ticket.Nombre_cliente;

  const mailOptions = {
    from: Correo,
    to: Correo_resolutor,
    subject: `Has sido designado propietario de Incidencia #${Id_ticket}`,
    html: `
    <p>Estimado miembro del equipo de resolución de incidentes de la Mesa de Servicio de la Dirección de Tecnología de Información Financiera,</p>
    <p>Te hemos asignado el ticket <b>#${Id_ticket}</b> que corresponde a la siguiente solicitud:</p>
    <blockquote>"${Descripcion_ticket}"</blockquote>
    <p>Responde a <b>${Nombre_cliente}</b>. Sus datos de contacto son los siguientes:</p>
    <ul>
      <li><b>Dependencia:</b> ${dependencia}</li>
      <li><b>Edificio:</b> ${edificio}</li>
      <li><b>Teléfono:</b> ${telefono}</li>
    </ul>
    <p>Te solicitamos indicar en el espacio correspondiente de la manera más clara posible, cuál fue la solución que le brindaste al usuario; esto nos será útil para dar retroalimentación en caso de que sea necesario.</p>
    <p>Gracias por tu atención.</p>
  `,
    // attachments: [
    //<img src="cid:imagen1" alt="Imagen de ejemplo" style="width:auto;height:auto;" />

    //   {
    //     filename: "maguillerminaacevedoespinoza.png",
    //     path: "C:\\Users\\carlos_ballesteros\\Desktop\\pruebas_correo\\maguillerminaacevedoespinoza.png", // Ruta local a la imagen
    //     cid: "imagen1", // Identificador único usado en el HTML
    //   },
    // ],
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log("Error al enviar el correo:", error);
    } else {
      console.log("Correo enviado:", info.response);
    }
  });
};
