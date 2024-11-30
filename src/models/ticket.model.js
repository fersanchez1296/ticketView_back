import mongoose, { Schema } from "mongoose";
<<<<<<< HEAD

=======
import autoIncrement from "mongoose-id-autoincrement";
>>>>>>> 2ef7b9d0d5a3cc03374c6dd73f6470f7602ba3a1
const HistoriaTicketSchema = new Schema({
  Nombre: { type: Schema.Types.ObjectId, ref: "USUARIOS", required: true },
  Mensaje: { type: String, required: true, trim: true },
  Fecha: { type: Date, required: true, default: Date.now },
});

const ticketModel = mongoose.Schema(
  {
    Id: {
      type: Number,
      trim: true,
    },
    Tipo_incidencia: {
      type: Schema.Types.ObjectId,
      trim: true,
      ref: "TIPO_TICKET",
    },
    Fecha_hora_creacion: {
      type: Date,
      trim: true,
    },
    Fecha_limite_resolucion_SLA: {
      type: Date,
      trim: true,
    },
    Fecha_hora_ultima_modificacion: {
      type: Date,
      trim: true,
    },
    Estado: {
      type: Schema.Types.ObjectId,
      trim: true,
      ref: "ESTADOS",
    },
    Area_asignado: {
      type: Schema.Types.ObjectId,
      trim: true,
      ref: "AREA",
    },
    Asignado_a: {
      type: Schema.Types.ObjectId,
      trim: true,
      ref: "USUARIOS",
    },
    Creado_por: {
      type: Schema.Types.ObjectId,
      trim: true,
      ref: "USUARIOS",
    },
    Categoria: {
      type: Schema.Types.ObjectId,
      trim: true,
      ref: "CATEGORIAS",
    },
    Servicio: {
      type: Schema.Types.ObjectId,
      trim: true,
      ref: "SERVICIOS",
    },
    Subcategoria: {
      type: Schema.Types.ObjectId,
      trim: true,
      ref: "SUBCATEGORIA",
    },
    Nombre_cliente: {
      type: String,
      trim: true,
    },
    Secretaria: {
      type: Schema.Types.ObjectId,
      trim: true,
      ref: "SECRETARIA",
    },
    Direccion_general: {
      type: Schema.Types.ObjectId,
      trim: true,
      ref: "DIRECCION_GENERAL",
    },
    Direccion_area: {
      type: Schema.Types.ObjectId,
      trim: true,
      ref: "DIRECCION_AREA",
    },
    Descripcion: {
      type: String,
      trim: true,
    },
    Prioridad: {
      type: Schema.Types.ObjectId,
      trim: true,
      ref: "PRIORIDADES",
    },
    Incidencia_grave: {
      type: String,
      trim: true,
    },
    Fecha_limite_respuesta_SLA: {
      type: Date,
      trim: true,
    },
    Fecha_hora_cierre: {
      type: Date,
      trim: true,
    },
    Reasignado_a: {
      type: Schema.Types.ObjectId,
      trim: true,
      ref: "USUARIOS",
    },
    Area_reasignado_a: {
      type: Schema.Types.ObjectId || [],
      trim: true,
      ref: "AREA",
    },
    Respuesta_cierre_reasignado: {
      type: Schema.Types.ObjectId,
      trim: true,
    },
    Respuesta_cierre_reasignado: {
      type: String,
      trim: true,
    },
    Fecha_hora_resolucion: {
      type: Date,
      trim: true,
    },
    Resuelto_por: {
      type: Schema.Types.ObjectId,
      trim: true,
      ref: "USUARIOS",
    },
<<<<<<< HEAD
    Asignado_final: {
=======
    Asignado_final_a: {
>>>>>>> 2ef7b9d0d5a3cc03374c6dd73f6470f7602ba3a1
      type: Schema.Types.ObjectId,
      trim: true,
      ref: "USUARIOS",
    },
    Cerrado_por: {
      type: Schema.Types.ObjectId,
      trim: true,
      ref: "USUARIOS",
    },
    Historia_ticket: {
      type: [HistoriaTicketSchema],
      default: [],
    },
    Causa: {
      type: String,
      trim: true,
    },
    Descripcion_cierre: {
      type: String,
      trim: true,
    },
  },
  {
    timesStampes: true,
  }
);

<<<<<<< HEAD
=======
autoIncrement.initialize(mongoose.connection);

ticketModel.plugin(autoIncrement.plugin, {
  model: "TICKETS",
  field: "Id",
  startAt: 1,
  incrementBy: 1,
});

>>>>>>> 2ef7b9d0d5a3cc03374c6dd73f6470f7602ba3a1
export default mongoose.model("TICKETS", ticketModel, "Tickets");
