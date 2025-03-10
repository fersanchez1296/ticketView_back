import mongoose, { Schema } from "mongoose";
import Counter from "../models/counter.model.js"; // Importar el modelo Counter

const HistoriaTicketSchema = new Schema({
  Nombre: { type: Schema.Types.ObjectId, ref: "USUARIOS", required: true },
  Mensaje: { type: String, required: true, trim: true },
  Fecha: { type: Date, required: true, default: Date.now },
  Titulo: { type: String, required: true, trim: true },
});

const ReabiertoSchema = new Schema({
  Descripcion: { type: String, trim: true },
  Fecha: { type: Date, required: true, default: Date.now },
});

const fileSchema = new Schema({
  name: { type: String, trim: true },
  url: { type: String },
});

const ticketModel = new Schema(
  {
    //campos del cliente
    Cliente: {
      type: Schema.Types.ObjectId,
      trim: true,
      ref: "Clientes",
    },
    //campos del ticket
    Id: { type: Number, unique: true },
    Tipo_incidencia: {
      type: Schema.Types.ObjectId,
      trim: true,
      ref: "TIPO_TICKET",
    },
    Estado: {
      type: Schema.Types.ObjectId,
      trim: true,
      ref: "ESTADOS",
    },
    Area: { type: mongoose.Schema.Types.ObjectId, ref: "AREA" },
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
    Descripcion: {
      type: String,
      trim: true,
    },
    Prioridad: {
      type: Schema.Types.ObjectId,
      trim: true,
      ref: "PRIORIDADES",
    },
    Medio: {
      type: Schema.Types.ObjectId,
      trim: true,
      ref: "MEDIO",
    },
    Cerrado_por: {
      type: Schema.Types.ObjectId,
      trim: true,
      ref: "USUARIOS",
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
    vistoBueno: {
      type: Boolean,
      trim: true,
      default: false,
    },
    standby: {
      type: Boolean,
      trim: true,
      default: false,
    },
    Reabierto: {
      type: [ReabiertoSchema],
      default: [],
    },
    //archivos
    Files: {
      type: [fileSchema],
      trim: true,
      default: [],
    },
    //historia
    Historia_ticket: {
      type: [HistoriaTicketSchema],
      default: [],
    },
    //tags
    Tags: {
      type: [String],
      trim: true,
      default: [],
    },
    //fechas
    Fecha_hora_creacion: {
      type: Date,
      trim: true,
    },
    Fecha_limite_resolucion_SLA: {
      type: Date,
      trim: true,
    },
    Fecha_limite_respuesta_SLA: {
      type: Date,
      trim: true,
    },
    Fecha_hora_ultima_modificacion: {
      type: Date,
      trim: true,
    },
    Fecha_hora_cierre: {
      type: Date,
      trim: true,
    },
    Fecha_hora_resolucion: {
      type: Date,
      trim: true,
    },
    //moderador
    Asignado_a: [
      { type: mongoose.Schema.Types.ObjectId, ref: "USUARIOS", default: [] },
    ],
    //resolutor
    Reasignado_a: [
      { type: mongoose.Schema.Types.ObjectId, ref: "USUARIOS", default: [] },
    ],
    Respuesta_cierre_reasignado: {
      type: String,
      trim: true,
    },
    Resuelto_por: {
      type: Schema.Types.ObjectId,
      trim: true,
      ref: "USUARIOS",
    },
  },
  {
    timestamps: true,
  }
);

// Middleware para incrementar el campo `Id` antes de guardar el ticket
ticketModel.pre("save", async function (next) {
  if (!this.isNew) return next(); // Solo se ejecuta si es un nuevo documento

  const session = await mongoose.startSession(); // Inicia la transacción
  session.startTransaction();

  try {
    // Obtener el contador para el `Id` desde la colección "counters"
    const counter = await Counter.findOneAndUpdate(
      { id: "Id" }, // Buscamos por el campo `id` en la colección de contadores
      { $inc: { seq: 1 } }, // Incrementamos el contador
      { new: true, upsert: true, session } // Usamos la sesión de la transacción
    );

    // Asignamos el nuevo `Id` al ticket
    this.Id = counter.seq;

    // No necesitamos hacer un this.save() aquí. El guardado se realiza al final en el controlador.

    // Completamos la transacción y cerramos la sesión
    await session.commitTransaction();
    session.endSession();

    next(); // Continuamos con el guardado del ticket
  } catch (error) {
    await session.abortTransaction(); // Si hay error, revertimos la transacción
    session.endSession(); // Cerramos la sesión
    next(error); // Pasamos el error al siguiente middleware
  }
});

export default mongoose.model("TICKETS", ticketModel, "Tickets");
