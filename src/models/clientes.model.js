import mongoose from "mongoose";

const clienteModel = mongoose.Schema(
  {
    Nombre: {
      type: String,
      trim: true,
      required: true,
    },
    Correo: {
      type: String,
      trim: true,
      required: true,
    },
    Telefono: {
      type: Number,
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

export default mongoose.model("CLIENTES", clienteModel, "Clientes");
