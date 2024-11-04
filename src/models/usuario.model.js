import mongoose from "mongoose";

const usuarioModel = mongoose.Schema(
    {
      username: {
        type: String,
        trim: true,
        required: true,
      },
      password: {
        type: String,
        trim: true,
        required: true,
      },
      nombre_completo: {
        type: String,
        trim: true,
        required: true,
      },
      rol: {
        type: String,
        trim: true,
        required: true,
      },
    },
    {
      timesStampes: true,
    }
  );
  
  export default mongoose.model("USUARIO", usuarioModel, "Usuarios");