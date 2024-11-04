import mongoose from "mongoose";

const prioridadesModel = mongoose.Schema(
    {
      Prioridad: {
        type: Number,
        trim: true,
        required: true,
      },
      Descripcion: {
        type: String,
        trim: true,
        required: true,
      },
    },
    {
      timesStampes: true,
    }
  );
  
  export default mongoose.model("PRIORIDADES", prioridadesModel, "Prioridades");