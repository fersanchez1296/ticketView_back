import mongoose from "mongoose";

const subcategoriaModel = mongoose.Schema(
    {
      Subcategoria: {
        type: String,
        trim: true,
        required: true,
      },
    },
    {
      timesStampes: true,
    }
  );
  
  export default mongoose.model("SUBCATEGORIA", subcategoriaModel, "Subcategoria");