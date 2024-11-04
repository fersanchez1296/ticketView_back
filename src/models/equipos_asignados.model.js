import mongoose from "mongoose";

const equiposAsignadosModel = mongoose.Schema(
    {
      Equipo_asignado: {
        type: String,
        trim: true,
        required: true,
      },
    },
    {
      timesStampes: true,
    }
  );
  
  export default mongoose.model("EQUIPOS_ASIGNADOS", equiposAsignadosModel, "Equipos_asignados");