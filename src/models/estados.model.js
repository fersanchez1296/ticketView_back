import mongoose from "mongoose";

const estadoModel = mongoose.Schema(
    {
      Estado: {
        type: String,
        trim: true,
        required: true,
      },
    },
    {
      timesStampes: true,
    }
  );
  
  export default mongoose.model("ESTADOS", estadoModel, "Estados");