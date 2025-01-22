import mongoose from "mongoose";

const dependenciaModel = mongoose.Schema(
    {
        Dependencia: {
        type: String,
        trim: true,
        required: true,
      },
    },
    {
      timesStampes: true,
    }
  );
  
  export default mongoose.model("Dependencia", dependenciaModel, "Dependencia");