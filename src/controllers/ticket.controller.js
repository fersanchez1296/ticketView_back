import { TICKETS, ESTADOS, AREA, USUARIO } from "../models/index.js";
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
  const { Id } = req.session.user;
  try {
    const estadoDoc = await ESTADOS.findOne({ Estado: "REVISIÓN" });
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

export const getTicketsCerrados = async (req, res) => {
  const { Id } = req.session.user;
  try {
    const estadoDoc = await ESTADOS.findOne({ Estado: "CERRADO" });
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
  const { Id_ticket, Resuelto_por_id, Descripcion_resolucion } = req.body;
  const Fecha_hora_actual = new Date();
  const { Rol } = req.session.user;
  try {
    const estadoDoc = await ESTADOS.findOne({
      Estado: Rol != "Usuario" ? "RESUELTO" : "REVISIÓN",
    });
    console.log(estadoDoc);
    if (!estadoDoc) {
      return res.status(404).json({ message: "Estado no encontrado" });
    }

    //TODO falta modificar los campos de Asignado_final, historia ticket, con base en los middleware
    const ticketActualizado = await TICKETS.updateOne(
      { _id: Id_ticket },
      {
        $set: {
          Estado: estadoDoc._id,
          Resuelto_por: Resuelto_por_id,
          Fecha_hora_resolucion: Fecha_hora_actual,
          Respuesta_resolucion: Descripcion_resolucion,
        },
      }
    );
    res.json(ticketActualizado);
  } catch (error) {
    console.error("Error al obtener los tickets:", error);
    res.status(500).json({ message: "Error al obtener los datos" });
  }
};

export const areasReasignacion = async (req, res) => {
  const { Rol, Area } = req.session.user;

  try {
    const areas = await AREA.find({ _id: { $in: Area } });
    // 2. Para cada área, obtener los usuarios asociados
    const areasResolutores = await Promise.all(
      areas.map(async (area) => {
        const resolutor = await USUARIO.find({ Area: area._id }).select(
          "Nombre Correo"
        );
        console.log(resolutor);
        return {
          area: area.Area, // Nombre del área
          resolutores: resolutor, // Lista de usuarios en esta área
        };
      })
    );

    // Enviar respuesta con las áreas y sus usuarios
    res.json({ areasResolutores });
  } catch (error) {
    console.error("Error al obtener áreas y usuarios:", error);
    res.status(500).json({ message: "Error al obtener áreas y usuarios" });
  }
};

export const reasignarTicket = async (req, res) => {
  const { id_usuario_reasignar, id_ticket } = req.body;
  const { _id, Nombre } = req.session.user;

  try {
    const result = TICKETS.updateOne(
      { _id: id_ticket },
      {
        $set: {
          Reasignado_a: id_usuario_reasignar,
          Asignado_final: id_usuario_reasignar,
        },
        $push: {
          Historia_ticket: {
            Nombre: _id,
            Mensaje: `El ticket ha sido reasignado a ... por ${Nombre}`,
            Fecha: new Date,
          },
        },
      }
    );

    res.status(200).json({desc: "El ticket se actualizo"})
  } catch (error) {}
};
