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
  DIRECCION_AREA,
  DIRECCION_GENERAL,
  DEPENDENCIAS,
} from "../models/index.js";
import mongoose from "mongoose";
const ObjectId = mongoose.Types.ObjectId;

export const getTicketsUsuario = async (userId, Estado) => {
  try {
    const result = await TICKETS.find({
      $and: [{ Estado }, { Reasignado_a: userId }],
    }).lean();
    if (!result) {
      return false;
    }
    return result;
  } catch (error) {
    return false;
  }
};

export const getTicketsModerador = async (userId, Estado) => {
  try {
    const result = await TICKETS.find({
      $and: [{ Estado }, { Asignado_a: userId }, { Reasignado_a: userId }],
    }).lean();
    if (!result) {
      return false;
    }
    return result;
  } catch (error) {
    return false;
  }
};

export const getTicketsRevision = async (area, Estado) => {
  try {
    const result = await TICKETS.find({
      $and: [{ Estado }, { Area_reasignado_a: { $in: area } }],
    }).lean();
    if (!result) {
      return false;
    }
    return result;
  } catch (error) {
    return false;
  }
};

export const getTicketsNuevosModerador = async (userId, Estado) => {
  try {
    const result = await TICKETS.find({
      $and: [
        { Estado: new ObjectId(Estado) },
        { Asignado_a: new ObjectId(userId) },
      ],
    }).lean();
    if (!result) {
      return false;
    }
    return result;
  } catch (error) {
    return false;
  }
};

export const getTicketsAdmin = async (Estado) => {
  try {
    const result = await TICKETS.find({ Estado }).lean();
    if (!result) {
      return false;
    }
    return result;
  } catch (error) {
    return false;
  }
};

export const getTicketsNuevos = async (userId, estado) => {
  try {
    const RES = await TICKETS.aggregate([
      {
        $match: {
          $and: [
            {
              $or: [
                { Asignado_a: new ObjectId(userId) },
                { Reasignado_a: new ObjectId(userId) },
              ],
            },
            { Estado: estado },
          ],
        },
      },
      {
        $addFields: {
          Asignado_final_a: {
            $cond: [
              {
                $eq: ["$Asignado_a", new ObjectId(userId)],
              },
              "$Asignado_a",
              "$Reasignado_a",
            ],
          },
        },
      },
      {
        $project: {
          Asignado_final: 0,
        },
      },
    ]);

    return RES;
  } catch (error) {
    return false;
  }
};

export const getTicketsStandby = async (userId, estado) => {
  try {
    const RES = await TICKETS.aggregate([
      {
        $match: {
          $and: [
            {
              $or: [
                { Asignado_a: new ObjectId(userId) },
                { Reasignado_a: new ObjectId(userId) },
              ],
            },
            { Estado: estado },
          ],
        },
      },
      {
        $addFields: {
          Asignado_final_a: {
            $cond: [
              {
                $eq: ["$Asignado_a", new ObjectId(userId)],
              },
              "$Asignado_a",
              "$Reasignado_a",
            ],
          },
        },
      },
      {
        $project: {
          Asignado_final: 0,
        },
      },
    ]);

    return RES;
  } catch (error) {
    return false;
  }
};

export const getTicketsEnCurso = async (userId, estado) => {
  try {
    const RES = await TICKETS.aggregate([
      {
        $match: {
          $and: [
            {
              $or: [
                { Asignado_a: new ObjectId(userId) },
                { Reasignado_a: new ObjectId(userId) },
              ],
            },
            { Estado: new ObjectId(estado) },
          ],
        },
      },
      {
        $addFields: {
          Asignado_final_a: {
            $cond: [
              {
                $eq: ["$Asignado_a", new ObjectId(userId)],
              },
              "$Asignado_a",
              "$Reasignado_a",
            ],
          },
        },
      },
      {
        $project: {
          Asignado_final: 0,
        },
      },
    ]);
    return RES;
  } catch (error) {
    console.log(error);
    return false;
  }
};

// export const getTicketsRevision = async (estado, Area) => {
//   try {
//     const RES = await TICKETS.find({
//       $and: [
//         { Estado: new ObjectId(estado) },
//         {
//           $or: [
//             { Area_reasignado_a: { $in: Area } },
//             { Area_asignado: { $in: Area } },
//           ],
//         },
//       ],
//     }).lean();
//     return RES;
//   } catch (error) {
//     return false;
//   }
// };

export const getTicketsReabiertos = async (userId, estado) => {
  try {
    const RES = await TICKETS.aggregate([
      {
        $match: {
          $and: [
            {
              $or: [
                { Asignado_a: new ObjectId(userId) },
                { Reasignado_a: new ObjectId(userId) },
              ],
            },
            { Estado: estado },
          ],
        },
      },
      {
        $addFields: {
          Asignado_final_a: {
            $cond: [
              {
                $eq: ["$Asignado_a", new ObjectId(userId)],
              },
              "$Asignado_a",
              "$Reasignado_a",
            ],
          },
        },
      },
      {
        $project: {
          Asignado_final: 0,
        },
      },
    ]);

    return RES;
  } catch (error) {
    return false;
  }
};

export const getTicketsPendientes = async (userId, estado) => {
  try {
    const RES = await TICKETS.aggregate([
      {
        $match: {
          $and: [
            {
              $or: [
                { Asignado_a: new ObjectId(userId) },
                { Reasignado_a: new ObjectId(userId) },
              ],
            },
            { Estado: estado },
          ],
        },
      },
      {
        $addFields: {
          Asignado_final_a: {
            $cond: [
              {
                $eq: ["$Asignado_a", new ObjectId(userId)],
              },
              "$Asignado_a",
              "$Reasignado_a",
            ],
          },
        },
      },
      {
        $project: {
          Asignado_final: 0,
        },
      },
    ]);

    return RES;
  } catch (error) {
    return false;
  }
};

export const getTicketsCerradosForResolAndMod = async (userId, estado) => {
  try {
    const RES = await TICKETS.aggregate([
      {
        $match: {
          $and: [
            {
              Estado: estado,
            },
            {
              $or: [
                { Resuelto_por: new ObjectId(userId) },
                { Asignado_a: new ObjectId(userId) },
                { Reasignado_a: new ObjectId(userId) },
              ],
            },
          ],
        },
      },
      {
        $addFields: {
          Asignado_final_a: {
            $cond: [
              { $eq: ["$Resuelto_por", new ObjectId(userId)] },
              "$Resuelto_por",
              {
                $cond: [
                  { $eq: ["$Asignado_a", new ObjectId(userId)] },
                  "$Asignado_a",
                  "$Reasignado_a",
                ],
              },
            ],
          },
        },
      },
      {
        $project: {
          Asignado_final: 0,
        },
      },
    ]);
    return RES;
  } catch (error) {
    return false;
  }
};

export const getTicketsCerradosForAdmin = async (userId, estado) => {
  try {
    const RES = await TICKETS.aggregate([
      {
        $match: {
          $and: [
            { Estado: estado },
            {
              $or: [
                { Resuelto_por: new ObjectId(userId) },
                { Asignado_a: new ObjectId(userId) },
                { Reasignado_a: new ObjectId(userId) },
                { Cerrado_por: new ObjectId(userId) },
                { Creado_por: new ObjectId(userId) },
              ],
            },
          ],
        },
      },
      {
        $addFields: {
          Asignado_final_a: {
            $cond: [
              { $eq: ["$Resuelto_por", new ObjectId(userId)] },
              "$Resuelto_por",
              {
                $cond: [
                  { $eq: ["$Asignado_a", new ObjectId(userId)] },
                  "$Asignado_a",
                  {
                    $cond: [
                      { $eq: ["$Reasignado_a", new ObjectId(userId)] },
                      "$Reasignado_a",
                      "$Cerrado_por",
                    ],
                  },
                ],
              },
            ],
          },
        },
      },
      {
        $project: {
          Asignado_final: 0,
        },
      },
    ]);

    return RES;
  } catch (error) {
    return false;
  }
};

export const getTicketsResueltosForResolAndMod = async (userId, estado) => {
  try {
    const RES = await TICKETS.aggregate([
      {
        $match: {
          $and: [
            {
              Estado: estado,
            },
            { Resuelto_por: new ObjectId(userId) },
          ],
        },
      },
      {
        $addFields: {
          Asignado_final_a: {
            $cond: [
              {
                $eq: ["$Resuelto_por", new ObjectId(userId)],
              },
              "$Resuelto_por",
              "$Resuelto_por",
            ],
          },
        },
      },
      {
        $project: {
          Asignado_final: 0,
        },
      },
    ]);

    return RES;
  } catch (error) {
    return false;
  }
};

export const getTicketsResueltosForAdmin = async (userId, estado) => {
  try {
    const RES = await TICKETS.aggregate([
      {
        $match: {
          $and: [{ Estado: estado }, { Creado_por: new ObjectId(userId) }],
        },
      },
      {
        $addFields: {
          Asignado_final_a: {
            $cond: [
              {
                $eq: ["$Resuelto_por", new ObjectId(userId)],
              },
              "$Resuelto_por",
              "$Resuelto_por",
            ],
          },
        },
      },
      {
        $project: {
          Asignado_final: 0,
        },
      },
    ]);

    return RES;
  } catch (error) {
    return false;
  }
};

export const getAreasParaReasignacion = async (Area) => {
  try {
    const RES = await AREA.find({ _id: { $in: Area } });
    return RES;
  } catch (error) {
    return false;
  }
};

export const getAreasParaAsignacion = async () => {
  try {
    const RES = await AREA.find();
    return RES;
  } catch (error) {
    return false;
  }
};

export const getResolutoresParaAsignacionPorArea = async (
  Area,
  moderador,
  administrador
) => {
  try {
    const usuarios = await USUARIO.find({
      isActive: true,
      Area: new ObjectId(Area),
      $or: [
        { Rol: new ObjectId(moderador) },
        { Rol: new ObjectId(administrador) },
      ],
    }).select("Nombre Correo");
    return usuarios;
  } catch (error) {
    return false;
  }
};

export const getResolutoresParaReasignacionPorArea = async (Area) => {
  try {
    const usuarios = await USUARIO.find({
      isActive: true,
      $or: [
        { Area: new ObjectId(Area) },
        //{ Rol: { $in: [new ObjectId(moderador), new ObjectId(administrador)] } },
      ],
    }).select("Nombre Correo");
    return usuarios;
  } catch (error) {
    return false;
  }
};

export const getInfoSelectsCrearTicket = async (
  moderador,
  root,
  administrador
) => {
  // Se agrego un gion bajo (_) al final del nombre de las constantes para evitar tener errores
  // con el nombre de los modelos
  try {
    const [
      ESTADOS_,
      TIPOSTICKET_,
      CATEGORIAS_,
      SERVICIOS_,
      SUBCATEGORIA_,
      PRIORIDADES_,
      AREAS_,
      DIRECCIONESAREAS_,
      USUARIOS_,
      DIRECCIONESGENERALES_,
      DEPENDENCIAS_,
    ] = await Promise.all([
      ESTADOS.find({
        Estado: "NUEVO",
      }),
      TIPO_TICKET.find(),
      CATEGORIAS.find(),
      SERVICIOS.find(),
      SUBCATEGORIA.find(),
      PRIORIDADES.find(),
      AREA.find(),
      DIRECCION_AREA.find(),
      USUARIO.find(
        {
          isActive: { $ne: false },
          Rol: new ObjectId("672bc1c20467f98349b6101c"),
        },
        { Nombre: 1, Correo: 1, Area: 1 }
      ),
      DIRECCION_GENERAL.find(),
      DEPENDENCIAS.find(),
    ]);

    const AREASRESOLUTORES = await Promise.all(
      AREAS_.map(async (area) => {
        const resolutor = await USUARIO.find({
          Area: new ObjectId(area._id),
          isActive: true,
          $or: [
            { Rol: new ObjectId(moderador) },
            { Rol: new ObjectId(root) },
            { Rol: new ObjectId(administrador) },
          ],
        }).select("Nombre Correo");
        return {
          area: { area: area.Area, _id: area._id },
          resolutores: resolutor,
        };
      })
    );
    return {
      estados: ESTADOS_,
      tiposTickets: TIPOSTICKET_,
      categorias: CATEGORIAS_,
      servicios: SERVICIOS_,
      subcategoria: SUBCATEGORIA_,
      prioridades: PRIORIDADES_,
      areas: AREAS_,
      direccion_areas: DIRECCIONESAREAS_,
      direccion_generales: DIRECCIONESGENERALES_,
      areasResolutores: AREASRESOLUTORES,
      dependencias: DEPENDENCIAS_,
    };
  } catch (error) {
    return false;
  }
};

export const getEstadoTicket = async (Estado) => {
  try {
    const RES = await ESTADOS.findOne({ Estado });
    return RES._id;
  } catch (error) {
    return false;
  }
};

export const getAreas = async () => {
  try {
    const RES = await AREA.find();
    return RES;
  } catch (error) {
    return false;
  }
};

export const getTicketsPorArea = async (area) => {
  try {
    const RES = await TICKETS.aggregate([
      {
        $match: {
          $or: [
            { Area_asignado: new ObjectId(area) },
            { Area_reasignado_a: new ObjectId(area) },
          ],
        },
      },
      {
        $addFields: {
          Asignado_final_a: {
            $cond: [
              {
                $eq: ["$Asignado_a", new ObjectId(area)],
              },
              "$Asignado_a",
              "$Reasignado_a",
            ],
          },
        },
      },
    ]);
    return RES;
  } catch (error) {
    return false;
  }
};

export const getAreasModerador = async (Area) => {
  try {
    const [RES] = await AREA.find({ _id: { $in: Area } });
    return RES;
  } catch (error) {
    return false;
  }
};

export const getUsuarios = async () => {
  try {
    const RES = await USUARIO.find({}, { password: 0 });
    return RES;
  } catch (error) {
    return false;
  }
};

export const getUsuariosActivos = async () => {
  try {
    const RES = await USUARIO.find({ isActive: true }, { password: 0 });
    return RES;
  } catch (error) {
    return false;
  }
};

export const getUsuariosInactivos = async () => {
  try {
    const RES = await USUARIO.find({ isActive: false }, { password: 0 });
    return RES;
  } catch (error) {
    return false;
  }
};

export const getUsuarioPorId = async (_id) => {
  try {
    const RES = await USUARIO.findById({ _id });
    return RES;
  } catch (error) {
    return false;
  }
};

export const getUsuarioPorUsername = async (username) => {
  try {
    const RES = await USUARIO.findOne({
      Username: username,
    });

    return RES;
  } catch (error) {
    return false;
  }
};

export const getNTicketsPorEstadoPorUsuario = async (idUsuario, estado) => {
  try {
    const ESTADO = await getEstadoTicket(estado);
    const RES = await TICKETS.find({
      $and: [
        {
          $or: [{ Asignado_a: idUsuario }, { Reasignado_a: idUsuario }],
        },
        { Estado: ESTADO },
      ],
    }).countDocuments();

    return RES;
  } catch (error) {
    return false;
  }
};

export const getNTicketsPorEstado = async (estado) => {
  try {
    const ESTADO = await getEstadoTicket(estado);
    const RES = await TICKETS.find({
      Estado: ESTADO,
    }).countDocuments();

    return RES;
  } catch (error) {
    return false;
  }
};

export const getInfoDashboard = async () => {
  try {
    const [
      ABIERTOS,
      REABIERTOS,
      CERRADOS,
      PENDIENTES,
      NUEVOS,
      REVISION,
      RESUELTOS,
    ] = await Promise.all([
      getNTicketsPorEstadoPorUsuario("EN CURSO"),
      getNTicketsPorEstadoPorUsuario("REABIERTO"),
      getNTicketsPorEstadoPorUsuario("CERRADO"),
      getNTicketsPorEstadoPorUsuario("PENDIENTE"),
      getNTicketsPorEstadoPorUsuario("NUEVO"),
      getNTicketsPorEstadoPorUsuario("REVISIÓN"),
      getNTicketsPorEstadoPorUsuario("RESUELTO"),
    ]);

    const [
      TOTALABIERTOS,
      TOTALREABIERTOS,
      TOTALCERRADOS,
      TOTALPENDIENTES,
      TOTALNUEVOS,
      TOTALREVISION,
      TOTALRESUELTOS,
    ] = await Promise.all([
      getNTicketsPorEstado("EN CURSO"),
      getNTicketsPorEstado("REABIERTO"),
      getNTicketsPorEstado("CERRADO"),
      getNTicketsPorEstado("PENDIENTE"),
      getNTicketsPorEstado("NUEVO"),
      getNTicketsPorEstado("REVISIÓN"),
      getNTicketsPorEstado("RESUELTO"),
    ]);

    return {
      abiertos: ABIERTOS,
      reabiertos: REABIERTOS,
      cerrados: CERRADOS,
      pendientes: PENDIENTES,
      nuevos: NUEVOS,
      revision: REVISION,
      resueltos: RESUELTOS,
      totalAbiertos: TOTALABIERTOS,
      totalReabiertos: TOTALREABIERTOS,
      totalCerrados: TOTALCERRADOS,
      totalPendientes: TOTALPENDIENTES,
      totalNuevos: TOTALNUEVOS,
      totalRevision: TOTALREVISION,
      totalResueltos: TOTALRESUELTOS,
    };
  } catch (error) {
    return false;
  }
};

export const getTicketPorID = async (id) => {
  try {
    const RES = await TICKETS.findOne({
      Id: id,
    }).lean();
    if (!RES) {
      return false;
    }
    return [RES];
  } catch (error) {
    return false;
  }
};

export const getPrioridades = async () => {
  try {
    const RES = await PRIORIDADES.find();
    return RES;
  } catch (error) {
    return false;
  }
};
