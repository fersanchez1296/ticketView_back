import mongoose from "mongoose";

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
      type: String,
      trim: true,
      required: true,
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
  },
  {
    timesStampes: true,
  }
);

export default mongoose.model("USUARIOS", usuarioModel, "Usuarios");
