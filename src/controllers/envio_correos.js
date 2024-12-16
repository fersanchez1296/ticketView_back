import "dotenv/config";
import nodemailer from "nodemailer";
import { USUARIO } from "../models/index.js";
import { TICKETS } from "../models/index.js";
import { CLIENTES } from "../models/index.js";

//Esta función se puede utilizar para asignar y reasignar los tickets
export const correo_reasignarTicket = async (req, res) => {
  const { id_usuario_reasignar, id_ticket, id_cliente} = req.body;
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
  const cliente = await CLIENTES.findOne({ _id: id_cliente });
  const Correo_resolutor = user_reasignar.Correo;
  const Id_ticket = ticket.Id;
  const Descripcion_ticket = ticket.Descripcion;
  const Nombre_cliente = cliente.Nombre;
  const Dependencia = cliente.Dependencia;
  const Telefono = cliente.Telefono;

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
      <li><b>Dependencia:</b> ${Dependencia}</li>
      <li><b>Teléfono:</b> ${Telefono}</li>
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

export const correo_crearTicket = async (req, res) => {
  const { id_cliente, id_ticket } = req.body;
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
  //Falta modificar el envió hacia el correo del cliente
  const cliente = await CLIENTES.findOne({ _id: id_cliente });
  const ticket = await TICKETS.findOne({ _id: id_ticket });
  const Correo_cliente = cliente.Correo;
  const Id_ticket = ticket.Id;
  const Descripcion_ticket = ticket.Descripcion;

  const mailOptions = {
    from: Correo,
    to: Correo_cliente,
    subject: `El ticket #${Id_ticket} fue creado.`,
    html: `
    <h1>El ticket #${Id_ticket} fue creado</h1>
    <p>Gracias por ponerte en contacto con la Mesa de Servicio de la Dirección de Tecnología de la Información Financiera.</p>
    <p>Tu solicitud ha sido dada de alta en nuestro sistema, con el número de ticket <b>#${Id_ticket}</b> te sugerimos guardarlo, ya que te será útil para futuras consultas.</p>
    <p>La descripción de tu solicitud es la siguiente:</b>
    <blockquote>"${Descripcion_ticket}"</blockquote>
    <p>Nuestros especialistas están trabajando para brindarte la mejor solución.</p>
    <p>Si deseas agregar comentarios, responde a este correo electrónico.</p>
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

export const correo_cerrarTicket = async (req, res) => {
  const { id_cliente, id_ticket } = req.body;
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
  //Falta modificar el envió hacia el correo del cliente
  const cliente = await CLIENTES.findOne({ _id: id_cliente });
  const ticket = await TICKETS.findOne({ _id: id_ticket });
  const Correo_cliente = cliente.Correo;
  const Id_ticket = ticket.Id;
  const Descripcion_ticket = ticket.Respuesta_cierre_reasignado;

  const mailOptions = {
    from: Correo,
    to: Correo_cliente,
    subject: `El ticket #${Id_ticket} fue cerrado.`,
    html: `
    <h1>El ticket #${Id_ticket} fue creado</h1>
    <p>Nos complace informarte que hemos atendido tu solicitud, con el número de ticket #${Id_ticket}, dando por cerrado el incidente en nuestro sistema.</p>
    <p>La solución de nuestro especialista fue la siguiente:</p>
    <blockquote>"${Descripcion_ticket}"</blockquote>
    <p>Te invitamos a responder la siguiente encuesta, la cual nos permitirá seguir mejorando la calidad de nuestros servicios:</b>
    https://forms.gle/ywFD7f5FJPnspSRH7.</p>
    
    <p>¿Consideras que la solución no fue satisfactoria? ¿hay algún comentario que te gustaría hacernos llegar? Cuéntanos respondiendo a este correo electrónico.</p>
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
