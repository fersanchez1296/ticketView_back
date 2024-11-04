import mongoose from "mongoose";

const tipoTicketModel = mongoose.Schema(
    {
      Tipo_de_incidencia: {
        type: String,
        trim: true,
        required: true,
      },
    },
    {
      timesStampes: true,
    }
  );
  
  export default mongoose.model("TIPO_TICKET", tipoTicketModel, "Tipo_ticket");