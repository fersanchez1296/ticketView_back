import mongoose from "mongoose";

const serviciosModel = mongoose.Schema(
    {
      Servicio: {
        type: String,
        trim: true,
        required: true,
      },
    },
    {
      timesStampes: true,
    }
  );
  
  export default mongoose.model("SERVICIOS", serviciosModel, "Servicios");