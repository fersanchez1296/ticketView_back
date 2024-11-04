import mongoose from "mongoose";

const categoriasModel = mongoose.Schema(
    {
      Categoria: {
        type: String,
        trim: true,
        required: true,
      },
    },
    {
      timesStampes: true,
    }
  );
  
  export default mongoose.model("CATEGORIAS", categoriasModel, "Categorias");