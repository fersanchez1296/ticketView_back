import mongoose from "mongoose";

const rolModel = mongoose.Schema(
    {
      Rol: {
        type: String,
        trim: true,
        required: true,
      },
    },
    {
      timesStampes: true,
    }
  );
  
  export default mongoose.model("ROLES", rolModel, "Roles");