import {
  TICKETS,
  ESTADOS,
  AREA,
  USUARIO,
  TIPO_TICKET,
  CATEGORIAS,
  SERVICIOS,
  SUBCATEGORIA,
  PRIORIDADES,
  SECRETARIA,
  DIRECCION_AREA,
  DIRECCION_GENERAL,
} from "../models/index.js";
import formateDate from "../functions/dateFormat.functions.js";

export const getTickets = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;
  console.log(page, limit);
  try {
    const results = await TICKETS.find().skip(skip).limit(limit);
    const total = await TICKETS.countDocuments();
    res.status(200).json({
      data: results,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
    });
  } catch (error) {
    res.status(500).json({ message: "Error al obtener los datos" });
  }
};

export const getTicketsAbiertos = async (req, res) => {
  const { collection } = req.query; // El nombre del estado enviado desde el cliente (ej. "abierto")
  const { Id, Rol, Coordinacion } = req.session.user; // ID del usuario autenticado
  console.log(Rol);
  try {
    const estadoDoc = await ESTADOS.findOne({ Estado: collection }); // Colección de estados
    if (!estadoDoc) {
      return res.status(404).json({ message: "Estado no encontrado" });
    }

    const ticketsRolResolutor = async () => {
      const tickets = await TICKETS.find({
        Estado: estadoDoc._id,
        Asignado_final: Id,
        //$or: [{ Asignado_a: Id }, { Reasignado_a: Id }],
      })
        .populate("Tipo_incidencia", "Tipo_de_incidencia -_id")
        .populate("Area_asignado", "Area _id")
        .populate("Categoria", "Categoria -_id")
        .populate("Servicio", "Servicio -_id")
        .populate("Subcategoria", "Subcategoria -_id")
        .populate("Secretaria", "Secretaria -_id")
        .populate("Direccion_general", "Direccion_General -_id")
        .populate("Direccion_area", "direccion_area -_id")
        .populate("Prioridad", "Prioridad Descripcion -_id")
        .populate("Estado")
        .populate("Asignado_a", "Nombre Coordinacion")
        .populate("Reasignado_a", "Nombre Coordinacion")
        .populate("Resuelto_por", "Nombre Coordinacion")
        .populate("Creado_por", "Nombre -_id")
        .populate("Area_reasignado_a", "Area -_id")
        .populate("Cerrado_por", "Nombre Coordinacion -_id")
        .populate("Asignado_final", "Nombre Coordinacion");

      // Procesamos los resultados para definir el campo Asignado_a_final
      const data = tickets.map((ticket) => {
        return {
          ...ticket.toObject(),
          // Asignado_a_final:
          //   ticket.Asignado_a && ticket.Asignado_a._id === Id
          //     ? ticket.Asignado_a
          //     : ticket.Reasignado_a,
          Fecha_hora_creacion: formateDate(ticket.Fecha_hora_creacion),
          Fecha_limite_resolucion_SLA: formateDate(
            ticket.Fecha_limite_resolucion_SLA
          ),
          Fecha_hora_ultima_modificacion: formateDate(
            ticket.Fecha_hora_ultima_modificacion
          ),
          Fecha_hora_cierre: formateDate(ticket.Fecha_hora_cierre),
          Fecha_limite_respuesta_SLA: formateDate(
            ticket.Fecha_limite_respuesta_SLA
          ),
        };
      });

      return data;
    };

    const ticketsRolModerador = async () => {
      const tickets = await TICKETS.find({
        Estado: estadoDoc._id,
        Equipo_asignado: Coordinacion,
      })
        .populate("Tipo_incidencia", "Tipo_de_incidencia -_id")
        .populate("Area_asignado", "Area _id")
        .populate("Categoria", "Categoria -_id")
        .populate("Servicio", "Servicio -_id")
        .populate("Subcategoria", "Subcategoria -_id")
        .populate("Secretaria", "Secretaria -_id")
        .populate("Direccion_general", "Direccion_General -_id")
        .populate("Direccion_area", "direccion_area -_id")
        .populate("Prioridad", "Prioridad Descripcion -_id")
        .populate("Estado")
        .populate("Asignado_a", "Nombre Coordinacion")
        .populate("Reasignado_a", "Nombre Coordinacion")
        .populate("Resuelto_por", "Nombre Coordinacion")
        .populate("Creado_por", "Nombre -_id")
        .populate("Area_reasignado_a", "Area -_id")
        .populate("Cerrado_por", "Nombre Coordinacion -_id")
        .populate("Asignado_final", "Nombre Coordinacion");

      // Procesamos los resultados para definir el campo Asignado_a_final
      const data = tickets.map((ticket) => {
        return {
          ...ticket.toObject(),
          // Asignado_a_final:
          //   ticket.Asignado_a && ticket.Asignado_a._id === Id
          //     ? ticket.Asignado_a
          //     : ticket.Reasignado_a,
          Fecha_hora_creacion: formateDate(ticket.Fecha_hora_creacion),
          Fecha_limite_resolucion_SLA: formateDate(
            ticket.Fecha_limite_resolucion_SLA
          ),
          Fecha_hora_ultima_modificacion: formateDate(
            ticket.Fecha_hora_ultima_modificacion
          ),
          Fecha_hora_cierre: formateDate(ticket.Fecha_hora_cierre),
          Fecha_limite_respuesta_SLA: formateDate(
            ticket.Fecha_limite_respuesta_SLA
          ),
        };
      });
      return data;
    };

    let data;
    if (Rol === "Moderador") {
      data = await ticketsRolModerador();
    } else if (Rol === "Resolutor") {
      data = await ticketsRolResolutor();
    } else {
      return res.status(403).json({ message: "Rol no autorizado" });
    }

    // Enviamos la respuesta
    res.status(200).json(data);
  } catch (error) {
    console.error("Error al obtener los tickets:", error);
    res.status(500).json({ message: "Error al obtener los datos" });
  }
};

export const getTicketsNuevos = async (req, res) => {
  const { Id } = req.session.user;
  try {
    const estadoDoc = await ESTADOS.findOne({ Estado: "NUEVO" });
    if (!estadoDoc) {
      return res.status(404).json({ message: "Estado no encontrado" });
    }
    const tickets = await TICKETS.find({
      Estado: estadoDoc._id,
      Asignado_final: Id,
    })
      .populate("Tipo_incidencia", "Tipo_de_incidencia -_id")
      .populate("Area_asignado", "Area _id")
      .populate("Categoria", "Categoria -_id")
      .populate("Servicio", "Servicio -_id")
      .populate("Subcategoria", "Subcategoria -_id")
      .populate("Secretaria", "Secretaria -_id")
      .populate("Direccion_general", "Direccion_General -_id")
      .populate("Direccion_area", "direccion_area -_id")
      .populate("Prioridad", "Prioridad Descripcion -_id")
      .populate("Estado")
      .populate("Asignado_a", "Nombre Coordinacion")
      .populate("Reasignado_a", "Nombre Coordinacion")
      .populate("Resuelto_por", "Nombre Coordinacion")
      .populate("Creado_por", "Nombre -_id")
      .populate("Area_reasignado_a", "Area -_id")
      .populate("Cerrado_por", "Nombre Coordinacion -_id")
      .populate("Asignado_final", "Nombre Coordinacion");

    // Procesamos los resultados para definir el campo Asignado_a_final
    const data = tickets.map((ticket) => {
      return {
        ...ticket.toObject(),
        Fecha_hora_creacion: formateDate(ticket.Fecha_hora_creacion),
        Fecha_limite_resolucion_SLA: formateDate(
          ticket.Fecha_limite_resolucion_SLA
        ),
        Fecha_hora_ultima_modificacion: formateDate(
          ticket.Fecha_hora_ultima_modificacion
        ),
        Fecha_hora_cierre: formateDate(ticket.Fecha_hora_cierre),
        Fecha_limite_respuesta_SLA: formateDate(
          ticket.Fecha_limite_respuesta_SLA
        ),
      };
    });
    res.status(200).json(data);
  } catch (error) {
    console.error("Error al obtener los tickets:", error);
    res.status(500).json({ message: "Error al obtener los datos" });
  }
};

export const getTicketsEnCurso = async (req, res) => {
  const { Id } = req.session.user;
  try {
    const estadoDoc = await ESTADOS.findOne({ Estado: "EN CURSO" });
    if (!estadoDoc) {
      return res.status(404).json({ message: "Estado no encontrado" });
    }
    const tickets = await TICKETS.find({
      Estado: estadoDoc._id,
      Asignado_final: Id,
    })
      .populate("Tipo_incidencia", "Tipo_de_incidencia -_id")
      .populate("Area_asignado", "Area _id")
      .populate("Categoria", "Categoria -_id")
      .populate("Servicio", "Servicio -_id")
      .populate("Subcategoria", "Subcategoria -_id")
      .populate("Secretaria", "Secretaria -_id")
      .populate("Direccion_general", "Direccion_General -_id")
      .populate("Direccion_area", "direccion_area -_id")
      .populate("Prioridad", "Prioridad Descripcion -_id")
      .populate("Estado")
      .populate("Asignado_a", "Nombre Coordinacion")
      .populate("Reasignado_a", "Nombre Coordinacion")
      .populate("Resuelto_por", "Nombre Coordinacion")
      .populate("Creado_por", "Nombre -_id")
      .populate("Area_reasignado_a", "Area -_id")
      .populate("Cerrado_por", "Nombre Coordinacion -_id")
      .populate("Asignado_final", "Nombre Coordinacion");

    // Procesamos los resultados para definir el campo Asignado_a_final
    const data = tickets.map((ticket) => {
      return {
        ...ticket.toObject(),
        Fecha_hora_creacion: formateDate(ticket.Fecha_hora_creacion),
        Fecha_limite_resolucion_SLA: formateDate(
          ticket.Fecha_limite_resolucion_SLA
        ),
        Fecha_hora_ultima_modificacion: formateDate(
          ticket.Fecha_hora_ultima_modificacion
        ),
        Fecha_hora_cierre: formateDate(ticket.Fecha_hora_cierre),
        Fecha_limite_respuesta_SLA: formateDate(
          ticket.Fecha_limite_respuesta_SLA
        ),
      };
    });
    res.status(200).json(data);
  } catch (error) {
    console.error("Error al obtener los tickets:", error);
    res.status(500).json({ message: "Error al obtener los datos" });
  }
};

export const getTicketsReabiertos = async (req, res) => {
  const { Id } = req.session.user;
  try {
    const estadoDoc = await ESTADOS.findOne({ Estado: "REABIERTO" });
    if (!estadoDoc) {
      return res.status(404).json({ message: "Estado no encontrado" });
    }
    const tickets = await TICKETS.find({
      Estado: estadoDoc._id,
      Asignado_final: Id,
    })
      .populate("Tipo_incidencia", "Tipo_de_incidencia -_id")
      .populate("Area_asignado", "Area _id")
      .populate("Categoria", "Categoria -_id")
      .populate("Servicio", "Servicio -_id")
      .populate("Subcategoria", "Subcategoria -_id")
      .populate("Secretaria", "Secretaria -_id")
      .populate("Direccion_general", "Direccion_General -_id")
      .populate("Direccion_area", "direccion_area -_id")
      .populate("Prioridad", "Prioridad Descripcion -_id")
      .populate("Estado")
      .populate("Asignado_a", "Nombre Coordinacion")
      .populate("Reasignado_a", "Nombre Coordinacion")
      .populate("Resuelto_por", "Nombre Coordinacion")
      .populate("Creado_por", "Nombre -_id")
      .populate("Area_reasignado_a", "Area -_id")
      .populate("Cerrado_por", "Nombre Coordinacion -_id")
      .populate("Asignado_final", "Nombre Coordinacion");

    // Procesamos los resultados para definir el campo Asignado_a_final
    const data = tickets.map((ticket) => {
      return {
        ...ticket.toObject(),
        Fecha_hora_creacion: formateDate(ticket.Fecha_hora_creacion),
        Fecha_limite_resolucion_SLA: formateDate(
          ticket.Fecha_limite_resolucion_SLA
        ),
        Fecha_hora_ultima_modificacion: formateDate(
          ticket.Fecha_hora_ultima_modificacion
        ),
        Fecha_hora_cierre: formateDate(ticket.Fecha_hora_cierre),
        Fecha_limite_respuesta_SLA: formateDate(
          ticket.Fecha_limite_respuesta_SLA
        ),
      };
    });
    res.status(200).json(data);
  } catch (error) {
    console.error("Error al obtener los tickets:", error);
    res.status(500).json({ message: "Error al obtener los datos" });
  }
};

export const getTicketsPendientes = async (req, res) => {
  const { Id } = req.session.user;
  try {
    const estadoDoc = await ESTADOS.findOne({ Estado: "PENDIENTE" });
    if (!estadoDoc) {
      return res.status(404).json({ message: "Estado no encontrado" });
    }
    const tickets = await TICKETS.find({
      Estado: estadoDoc._id,
      Asignado_final: Id,
    })
      .populate("Tipo_incidencia", "Tipo_de_incidencia -_id")
      .populate("Area_asignado", "Area _id")
      .populate("Categoria", "Categoria -_id")
      .populate("Servicio", "Servicio -_id")
      .populate("Subcategoria", "Subcategoria -_id")
      .populate("Secretaria", "Secretaria -_id")
      .populate("Direccion_general", "Direccion_General -_id")
      .populate("Direccion_area", "direccion_area -_id")
      .populate("Prioridad", "Prioridad Descripcion -_id")
      .populate("Estado")
      .populate("Asignado_a", "Nombre Coordinacion")
      .populate("Reasignado_a", "Nombre Coordinacion")
      .populate("Resuelto_por", "Nombre Coordinacion")
      .populate("Creado_por", "Nombre -_id")
      .populate("Area_reasignado_a", "Area -_id")
      .populate("Cerrado_por", "Nombre Coordinacion -_id")
      .populate("Asignado_final", "Nombre Coordinacion");

    // Procesamos los resultados para definir el campo Asignado_a_final
    const data = tickets.map((ticket) => {
      return {
        ...ticket.toObject(),
        Fecha_hora_creacion: formateDate(ticket.Fecha_hora_creacion),
        Fecha_limite_resolucion_SLA: formateDate(
          ticket.Fecha_limite_resolucion_SLA
        ),
        Fecha_hora_ultima_modificacion: formateDate(
          ticket.Fecha_hora_ultima_modificacion
        ),
        Fecha_hora_cierre: formateDate(ticket.Fecha_hora_cierre),
        Fecha_limite_respuesta_SLA: formateDate(
          ticket.Fecha_limite_respuesta_SLA
        ),
      };
    });
    res.status(200).json(data);
  } catch (error) {
    console.error("Error al obtener los tickets:", error);
    res.status(500).json({ message: "Error al obtener los datos" });
  }
};

export const getTicketsRevision = async (req, res) => {
  const { Id, Area } = req.session.user;
  try {
    const estadoDoc = await ESTADOS.findOne({ Estado: "REVISIÓN" });
    if (!estadoDoc) {
      return res.status(404).json({ message: "Estado no encontrado" });
    }
    const tickets = await TICKETS.find({
      $and: [{ Estado: estadoDoc._id }, { Area_reasignado_a: { $in: Area } }],
    })
      .populate("Tipo_incidencia", "Tipo_de_incidencia -_id")
      .populate("Area_asignado", "Area _id")
      .populate("Categoria", "Categoria -_id")
      .populate("Servicio", "Servicio -_id")
      .populate("Subcategoria", "Subcategoria -_id")
      .populate("Secretaria", "Secretaria -_id")
      .populate("Direccion_general", "Direccion_General -_id")
      .populate("Direccion_area", "direccion_area -_id")
      .populate("Prioridad", "Prioridad Descripcion -_id")
      .populate("Estado")
      .populate("Asignado_a", "Nombre Coordinacion")
      .populate("Reasignado_a", "Nombre Coordinacion")
      .populate("Resuelto_por", "Nombre Coordinacion")
      .populate("Creado_por", "Nombre -_id")
      .populate("Area_reasignado_a", "Area -_id")
      .populate("Cerrado_por", "Nombre Coordinacion -_id")
      .populate("Asignado_final", "Nombre Coordinacion");

    // Procesamos los resultados para definir el campo Asignado_a_final
    const data = tickets.map((ticket) => {
      return {
        ...ticket.toObject(),
        Fecha_hora_creacion: formateDate(ticket.Fecha_hora_creacion),
        Fecha_limite_resolucion_SLA: formateDate(
          ticket.Fecha_limite_resolucion_SLA
        ),
        Fecha_hora_ultima_modificacion: formateDate(
          ticket.Fecha_hora_ultima_modificacion
        ),
        Fecha_hora_cierre: formateDate(ticket.Fecha_hora_cierre),
        Fecha_limite_respuesta_SLA: formateDate(
          ticket.Fecha_limite_respuesta_SLA
        ),
      };
    });
    res.status(200).json(data);
  } catch (error) {
    console.error("Error al obtener los tickets:", error);
    res.status(500).json({ message: "Error al obtener los datos" });
  }
};

export const getTicketsCerrados = async (req, res) => {
  const { Id, Rol } = req.session.user;
  let tickets;
  try {
    const estadoDoc = await ESTADOS.findOne({ Estado: "CERRADO" });
    if (!estadoDoc) {
      return res.status(404).json({ message: "Estado no encontrado" });
    }
    tickets = await TICKETS.find({
      $and: [
        { $or: [{ Asignado_a: Id }, { Reasignado_a: Id }] },
        { Estado: estadoDoc._id },
      ],
    })
      .populate("Tipo_incidencia", "Tipo_de_incidencia -_id")
      .populate("Area_asignado", "Area _id")
      .populate("Categoria", "Categoria -_id")
      .populate("Servicio", "Servicio -_id")
      .populate("Subcategoria", "Subcategoria -_id")
      .populate("Secretaria", "Secretaria -_id")
      .populate("Direccion_general", "Direccion_General -_id")
      .populate("Direccion_area", "direccion_area -_id")
      .populate("Prioridad", "Prioridad Descripcion -_id")
      .populate("Estado")
      .populate("Asignado_a", "Nombre Coordinacion")
      .populate("Reasignado_a", "Nombre Coordinacion")
      .populate("Resuelto_por", "Nombre Coordinacion")
      .populate("Creado_por", "Nombre -_id")
      .populate("Area_reasignado_a", "Area -_id")
      .populate("Cerrado_por", "Nombre Coordinacion -_id")
      .populate({
        path: "Historia_ticket",
        populate: { path: "Nombre", select: "Nombre -_id" },
      })
      .populate("Asignado_final", "Nombre Coordinacion");

    // Procesamos los resultados para definir el campo Asignado_a_final
    const data = tickets.map((ticket) => {
      return {
        ...ticket.toObject(),
        Fecha_hora_creacion: formateDate(ticket.Fecha_hora_creacion),
        Fecha_limite_resolucion_SLA: formateDate(
          ticket.Fecha_limite_resolucion_SLA
        ),
        Fecha_hora_ultima_modificacion: formateDate(
          ticket.Fecha_hora_ultima_modificacion
        ),
        Fecha_hora_cierre: formateDate(ticket.Fecha_hora_cierre),
        Fecha_limite_respuesta_SLA: formateDate(
          ticket.Fecha_limite_respuesta_SLA
        ),
        Historia_ticket: ticket.Historia_ticket ? ticket.Historia_ticket.map((historia) => ({
          Nombre: historia.Nombre,
          Mensaje: historia.Mensaje,
          Fecha: formateDate(historia.Fecha),
        })) : [],
      };
    });
    res.status(200).json(data);
  } catch (error) {
    console.error("Error al obtener los tickets:", error);
    res.status(500).json({ message: "Error al obtener los datos" });
  }
};

export const getTicketsResueltos = async (req, res) => {
  const { Id } = req.session.user;
  try {
    const estadoDoc = await ESTADOS.findOne({ Estado: "RESUELTO" });
    if (!estadoDoc) {
      return res.status(404).json({ message: "Estado no encontrado" });
    }
    const tickets = await TICKETS.find({
      Estado: estadoDoc._id,
      Resuelto_por: Id,
    })
      .populate("Tipo_incidencia", "Tipo_de_incidencia -_id")
      .populate("Area_asignado", "Area _id")
      .populate("Categoria", "Categoria -_id")
      .populate("Servicio", "Servicio -_id")
      .populate("Subcategoria", "Subcategoria -_id")
      .populate("Secretaria", "Secretaria -_id")
      .populate("Direccion_general", "Direccion_General -_id")
      .populate("Direccion_area", "direccion_area -_id")
      .populate("Prioridad", "Prioridad Descripcion -_id")
      .populate("Estado")
      .populate("Asignado_a", "Nombre Coordinacion")
      .populate("Reasignado_a", "Nombre Coordinacion")
      .populate("Resuelto_por", "Nombre Coordinacion")
      .populate("Creado_por", "Nombre -_id")
      .populate("Area_reasignado_a", "Area -_id")
      .populate("Cerrado_por", "Nombre Coordinacion -_id")
      .populate("Asignado_final", "Nombre Coordinacion");

    // Procesamos los resultados para definir el campo Asignado_a_final
    const data = tickets.map((ticket) => {
      return {
        ...ticket.toObject(),
        Fecha_hora_creacion: formateDate(ticket.Fecha_hora_creacion),
        Fecha_limite_resolucion_SLA: formateDate(
          ticket.Fecha_limite_resolucion_SLA
        ),
        Fecha_hora_ultima_modificacion: formateDate(
          ticket.Fecha_hora_ultima_modificacion
        ),
        Fecha_hora_cierre: formateDate(ticket.Fecha_hora_cierre),
        Fecha_limite_respuesta_SLA: formateDate(
          ticket.Fecha_limite_respuesta_SLA
        ),
      };
    });
    res.status(200).json(data);
  } catch (error) {
    console.error("Error al obtener los tickets:", error);
    res.status(500).json({ message: "Error al obtener los datos" });
  }
};

export const resolverTicket = async (req, res) => {
  const { _id, descripcion_resolucion } = req.body;
  const { Id, Rol, Nombre } = req.session.user;
  let estado;
  try {
    if (Rol != "Usuario") {
      [estado] = await ESTADOS.find({ Estado: "RESUELTO" });
    } else {
      [estado] = await ESTADOS.find({ Estado: "REVISIÓN" });
    }
    const result = await TICKETS.updateOne(
      { _id },
      {
        $set: {
          Estado: estado._id,
          Resuelto_por: Id,
          Respuesta_cierre_reasignado: descripcion_resolucion,
        },
        $push: {
          Historia_ticket: {
            Nombre: Id,
            Mensaje:
              Rol === "Usuario"
                ? `El ticket ha sido enviado a revisión por ${Nombre} - ${Rol}. En espera de respuesta del moderador.`
                : `El ticket ha sido resuelto por ${Nombre} - ${Rol}.`,
            Fecha: new Date(),
          },
        },
      }
    );
    if (result) {
      return res
        .status(200)
        .json({ desc: "El estado del ticket ha sido modificado." });
    } else {
      return res
        .status(500)
        .json({ desc: "Error al acutualizar el estado del ticket." });
    }
  } catch (error) {
    console.log(error);
  }
};

export const areasReasignacion = async (req, res) => {
  const { Area } = req.session.user;

  try {
    const areas = await AREA.find({ _id: { $in: Area } });
    const areasResolutores = await Promise.all(
      areas.map(async (area) => {
        const resolutor = await USUARIO.find({ Area: area._id }).select(
          "Nombre Correo"
        );
        return {
          area: area.Area,
          resolutores: resolutor,
        };
      })
    );

    res.json({ areasResolutores });
  } catch (error) {
    console.error("Error al obtener áreas y usuarios:", error);
    res.status(500).json({ message: "Error al obtener áreas y usuarios" });
  }
};

export const reasignarTicket = async (req, res) => {
  const { id_usuario_reasignar, id_ticket } = req.body;
  const { Id, Nombre, Rol } = req.session.user;
  try {
    const user = await USUARIO.findOne({ _id: id_usuario_reasignar });
    if (!user) {
      return res
        .status(404)
        .json({ desc: "El usuario no fue encontrado en la BD." });
    }
    const Nombre_resolutor = user.Nombre;
    const result = await TICKETS.updateOne(
      { _id: id_ticket },
      {
        $set: {
          Area_reasignado_a: user.Area,
          Reasignado_a: id_usuario_reasignar,
        },
        $push: {
          Historia_ticket: {
            Nombre: Id,
            Mensaje: `El ticket ha sido reasignado a ${Nombre_resolutor} por ${Nombre} - ${Rol}`,
            Fecha: new Date(),
          },
        },
      }
    );
    if (result) {
      res.status(200).json({ desc: "El ticket fue reasignado correctamente." });
    } else {
      res
        .status(500)
        .json({ desc: "Ocurrio un error al reasignar el ticket." });
    }
  } catch (error) {
    res.status(500).json({ desc: "Error en el servidor" });
    console.log(error);
  }
};

export const getInfoSelects = async (req, res) => {
  try {
    const [
      estados,
      tiposTickets,
      categorias,
      servicios,
      subcategoria,
      prioridades,
      areas,
      secretarias,
      direccion_areas,
      usuarios,
      direccion_generales,
    ] = await Promise.all([
      ESTADOS.find({
        $or: [{ Estado: "NUEVO" }, { Estado: "PENDIENTE" }],
      }),
      TIPO_TICKET.find(),
      CATEGORIAS.find(),
      SERVICIOS.find(),
      SUBCATEGORIA.find(),
      PRIORIDADES.find(),
      AREA.find(),
      SECRETARIA.find(),
      DIRECCION_AREA.find(),
      USUARIO.find(
        { isActive: { $ne: false }, Rol: "Moderador" },
        { Nombre: 1, Correo: 1, Area: 1 }
      ),
      DIRECCION_GENERAL.find(),
    ]);

    const areasResolutores = await Promise.all(
      areas.map(async (area) => {
        const resolutor = await USUARIO.find({
          Area: area._id,
          isActive: true,
          Rol: "Moderador",
        }).select("Nombre Correo");
        return {
          area: area.Area,
          resolutores: resolutor,
        };
      })
    );

    // Preparar la respuesta
    res.status(200).json({
      estados,
      tiposTickets,
      categorias,
      servicios,
      subcategoria,
      prioridades,
      areas,
      secretarias,
      direccion_areas,
      direccion_generales,
      areasResolutores,
    });
  } catch (error) {
    console.error("Error fetching data:", error);
    // Manejo de errores: responder con un mensaje de error
    res.status(500).json({ error: "Error fetching data" });
  }
};

export const cerrarTicket = async (req, res) => {
  const { _id, Descripcion_cierre, Causa } = req.body;
  const { Id, Nombre, Rol } = req.session.user;

  try {
    const [estado] = await ESTADOS.find({ Estado: "CERRADO" });
    const result = await TICKETS.updateOne(
      { _id },
      {
        $set: {
          Estado: estado._id,
          Cerrado_por: Id,
          Descripcion_cierre,
          Causa,
          Fecha_hora_cierre: new Date(),
        },
        $push: {
          Historia_ticket: {
            Nombre: Id,
            Mensaje: `El ticket fue cerrado por ${Nombre} - ${Rol}`,
            Fecha: new Date(),
          },
        },
      }
    );
    console.log(result);
    if (result) {
      return res
        .status(200)
        .json({ desc: "Ticket cerrado de manera correcta." });
    } else {
      return res.status(500).json({ desc: "Error al cerrar el ticket." });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({ desc: "Error interno en el servidor" });
  }
};

//TODO falta evaular la gravedad del ticket (limite_tiempo_respuesta), evaluar si el ticket se reabre para la misma persona o alguien mas
export const reabrirTicket = async (req, res) => {
  const { _id, descripcion_reabirir, Descripcion_cierre, Descripcion } =
    req.body;
  const { Id, Rol, Nombre } = req.session.user;
  try {
    const [estado] = await ESTADOS.find({ Estado: "REABIERTO" });
    if (!estado) {
      return res.status(404).json({ desc: "No se encontro el estado" });
    }
    const result = await TICKETS.updateOne(
      { _id },
      {
        $set: {
          Estado: estado._id,
          Descripcion: descripcion_reabirir,
        },
        $push: {
          Historia_ticket: {
            $each: [
              {
                Nombre: Id,
                Mensaje: `El ticket fue Reabierto por ${Nombre} - ${Rol}`,
                Fecha: new Date(),
              },
              {
                Nombre: Id,
                Mensaje: `Descripcion anterior : ${Descripcion} \nDescripcion de cierre anterior : ${Descripcion_cierre}`,
                Fecha: new Date(),
              },
            ],
          },
        },
      }
    );

    if (result) {
      return res.status(200).json({ desc: "El ticket fue reabierto" });
    } else {
      return res
        .status(500)
        .json({ desc: "Ocurrio un error al rintentar reabrir el ticket" });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({ desc: "Error interno en el servidor" });
  }
};

export const aceptarResolucion = async (req, res) => {
  const { _id } = req.body;
  const { Id, Nombre, Rol } = req.session.user;
  try {
    const [estado] = await ESTADOS.find({ Estado: "RESUELTO" });
    if (!estado) {
      return res.status(404).json({ desc: "No se encontro el estado." });
    }
    const result = await TICKETS.updateOne(
      { _id },
      {
        $set: { Estado: estado._id },
        $push: {
          Historia_ticket: {
            Nombre: Id,
            Mensaje: `${Nombre} - ${Rol} ha aceptado la solucion del Resolutor. El estado del ticket es cambiado a "Resuelto" y se encuentra en espera de Cierre.`,
            Fecha: new Date(),
          },
        },
      }
    );
    if (result) {
      return res
        .status(200)
        .json({ desc: "El estado del ticket fue cambiado a Resuelto" });
    } else {
      return res.status(500).json({ desc: "Error al procesar la solicitud." });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({ desc: "Error interno en el servidor." });
  }
};

export const rechazarResolucion = async (req, res) => {
  const { _id, motivo_rechazo } = req.body;
  const { Id, Nombre, Rol } = req.session.user;
  try {
    const [estado] = await ESTADOS.find({ Estado: "EN CURSO" });
    if (!estado) {
      return res.status(404).json({ desc: "No se encontro el estado." });
    }
    const result = await TICKETS.updateOne(
      { _id },
      {
        $set: {
          Estado: estado._id,
          Resuelto_por: null,
          Respuesta_cierre_reasignado: null,
        },
        $push: {
          Historia_ticket: {
            Nombre: Id,
            Mensaje: `${Nombre} - ${Rol} ha rechazado la solucion del Resolutor. El estado del ticket es cambiado a "Abierto". \nMotivo:\n${motivo_rechazo}`,
            Fecha: new Date(),
          },
        },
      }
    );
    if (result) {
      return res
        .status(200)
        .json({ desc: "El estado del ticket fue cambiado a Abierto" });
    } else {
      return res.status(500).json({ desc: "Error al procesar la solicitud." });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({ desc: "Error interno en el servidor." });
  }
};

export const crearTicket = async (req, res) => {
  "";
};

export const editarTicket = async (req, res) => {};
