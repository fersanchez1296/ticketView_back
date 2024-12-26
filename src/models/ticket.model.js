import mongoose, { Schema } from "mongoose";
import AutoIncrementFactory from "mongoose-sequence";
const AutoIncrement = AutoIncrementFactory(mongoose.connection)
const HistoriaTicketSchema = new Schema({
  Nombre: { type: Schema.Types.ObjectId, ref: "USUARIOS", required: true },
  Mensaje: { type: String, required: true, trim: true },
  Fecha: { type: Date, required: true, default: Date.now },
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
    Asignado_final_a: {
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
    Correo_cliente: {
      type: String,
      trim: true,
    },
    Telefono_cliente: {
      type: String,
      trim: true,
    },
    Dependencia_cliente:{
      type: String,
      trim: true,
    },
    Archivo:{
      type: Object || String,
      trim: true,
    },
  },
  {
    timesStampes: true,
  }
);

ticketModel.plugin(AutoIncrement, {
  id: 'ticket_id_seq',
  inc_field: "Id",
  start_seq: 54102,
});

export default mongoose.model("TICKETS", ticketModel, "Tickets");
