import mongoose, { Schema } from "mongoose";

const categorizacionModel = mongoose.Schema(
    {
      Subcategoria: {
        type: String,
        trim: true,
        required: true,
      },
      Categoria: {
        type: String,
        trim: true,
        required: true,
      },
      Servicio: {
        type: String,
        trim: true,
        required: true,
      },
      Tipo: {
        type: String,
        trim: true,
        required: true,
      },
      Equipo: {
        type: Schema.Types.ObjectId,
        trim: true,
        required: true,
        ref: "AREA"
      },
      Prioridad: {
        type: Number,
        trim: true,
        required: true,
      },
      Descripcion_prioridad: {
        type: String,
        trim: true,
        required: true,
      },
    },
    {
      timesStampes: true,
    }
  );
  
  export default mongoose.model("CATEGORIZACION", categorizacionModel, "Categorizacion");