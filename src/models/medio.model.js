import mongoose from "mongoose";

const MedioModel = mongoose.Schema(
    {
      Medio: {
        type: String,
        trim: true,
        required: true,
      },
    },
    {
      timesStampes: true,
    }
  );
  
  export default mongoose.model("MEDIO", MedioModel, "Medios_contacto");