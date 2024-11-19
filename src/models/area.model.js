import mongoose from "mongoose";

const AreaModel = mongoose.Schema(
    {
      Area: {
        type: String,
        trim: true,
        required: true,
      },
    },
    {
      timesStampes: true,
    }
  );
  
  export default mongoose.model("AREA", AreaModel, "Area");