import "dotenv/config"; 
export const correo_reasignarTicket = async (req,res) => {
  const nodemailer = require("nodemailer");

  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: false, // Cambia según sea necesario
    // tls: {
    //   rejectUnauthorized: false, // Solo si es necesario
    // },
  });

  // Variables dinámicas que puedes personalizar
  const incidenciaId = 12345;
  const descripcion = "Descripción del problema";
  const nombreUsuario = "Nombre del Usuario";
  const dependencia = "Nombre de la Dependencia";
  const edificio = "Nombre del Edificio";
  const telefono = "123456789";

  const mailOptions = {
    from: '"Mesa de Servicio" <carlos_ballesteros@jalisco.gob.mx>',
    to: "carlos.ballesteros8937@alumnos.udg.mx",
    subject: `Has sido designado propietario de Incidencia #${incidenciaId}`,
    html: `
    <p>Estimado miembro del equipo de resolución de incidentes de la Mesa de Servicio de la Dirección de Tecnología de Información Financiera,</p>
    <p>Te hemos asignado el ticket <b>#${incidenciaId}</b> que corresponde a la siguiente solicitud:</p>
    <blockquote>"${descripcion}"</blockquote>
    <p>Responde a <b>${nombreUsuario}</b>. Sus datos de contacto son los siguientes:</p>
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
