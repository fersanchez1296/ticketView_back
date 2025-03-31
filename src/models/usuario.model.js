import mongoose, { Schema } from "mongoose";

const ticketResueltosSchema = new Schema({
  a_tiempo: { type: Number },
  fuera_tiempo: { type: Number },
});

const usuarioModel = mongoose.Schema(
  {
    Username: {
      type: String,
      trim: true,
      required: true,
    },
    Password: {
      type: String,
      trim: true,
      required: true,
    },
    Nombre: {
      type: String,
      trim: true,
      required: true,
    },
    Rol: {
      type: mongoose.Schema.Types.ObjectId,
      trim: true,
      required: true,
      ref: "ROLES",
    },
    Area: [{ type: mongoose.Schema.Types.ObjectId, ref: "AREA" }],
    Correo: {
      type: String,
      trim: true,
      required: true,
    },
    Coordinacion: {
      type: String,
      trim: true,
      required: true,
    },
    isActive: {
      type: Boolean,
      trim: true,
      required: true,
    },
    Fecha_creacion: {
      type: Date,
      trim: true,
      required: true,
    },
    Fecha_baja: {
      type: Date,
      trim: true,
      required: true,
    },
    Dependencia: {
      type: String,
      trim: true,
      required: true,
    },
    Direccion_general: {
      type: String,
      trim: true,
      required: true,
    },
    Tickets_resueltos: {
      type: ticketResueltosSchema,
      default: 0,
    },
  },
  {
    timesStampes: true,
  }
);

export default mongoose.model("USUARIOS", usuarioModel, "Usuarios");
