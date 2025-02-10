import mongoose, { Schema } from "mongoose";

const clientesModel = mongoose.Schema(
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
    Dependencia: {
      type: Schema.Types.ObjectId,
      ref: "Dependencia",
      required: true,
    },
    Direccion_General: {
      type: Schema.Types.ObjectId,
      ref: "DIRECCION_GENERAL",
      required: true,
    },
    direccion_area: {
      type: Schema.Types.ObjectId,
      ref: "DIRECCION_AREA",
      required: true,
    },
    Telefono: {
      type: String,
      trim: true,
      required: true,
    },
    Extension: {
      type: String,
      trim: true,
    },
    Ubicacion: {
      type: String,
      trim: true,
      required: true,
    },
  },
  {
    timesStampes: true,
  }
);

export default mongoose.model("Clientes", clientesModel, "Clientes");
