import mongoose from "mongoose";

const secretariaModel = mongoose.Schema(
    {
        Secretaria: {
        type: String,
        trim: true,
        required: true,
      },
    },
    {
      timesStampes: true,
    }
  );
  
  export default mongoose.model("SECRETARIA", secretariaModel, "Secretaria");