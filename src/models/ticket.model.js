import mongoose, { Schema } from "mongoose";
import AutoIncrementFactory from "mongoose-sequence";
const AutoIncrement = AutoIncrementFactory(mongoose.connection);
const HistoriaTicketSchema = new Schema({
  Nombre: { type: Schema.Types.ObjectId, ref: "USUARIOS", required: true },
  Mensaje: { type: String, required: true, trim: true },
  Fecha: { type: Date, required: true, default: Date.now },
});

const fileSchema = new Schema({
  name: { type: String, trim: true },
  url: { type: String },
});

const ticketModel = mongoose.Schema(
  {
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
    Cliente: {
      type: Schema.Types.ObjectId,
      trim: true,
      ref: "Clientes",
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
      ref: "USUARIOS",
    },
    Area_reasignado_a: {
      type: Schema.Types.ObjectId,
      ref: "AREA",
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
    Cerrado_por: {
      type: Schema.Types.ObjectId,
      trim: true,
      ref: "USUARIOS",
    },
    Historia_ticket: {
      type: [HistoriaTicketSchema],
      default: [],
    },
    Descripcion_cierre: {
      type: String,
      trim: true,
    },
    NumeroRec_Oficio: {
      type: String,
      trim: true,
      default: "",
    },
    Numero_Oficio: {
      type: String,
      trim: true,
      default: "",
    },
    Files: {
      type: [fileSchema],
      trim: true,
      default: [],
    },
    vistoBueno: {
      type: Boolean,
      trim: true,
      default: false,
    },
  },
  {
    timesStampes: true,
  }
);

ticketModel.plugin(AutoIncrement, {
  Id: "ticket_id_seq",
  inc_field: "Id",
  start_seq: 560,
});

export default mongoose.model("TICKETS", ticketModel, "Tickets");
