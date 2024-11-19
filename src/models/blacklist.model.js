import mongoose from "mongoose";

const blacklistModel = mongoose.Schema(
    {
      token: {
        type: String,
        trim: true,
        required: true,
      },
      created_at: {
        type: Date,
        default: Date.now,
        required: true,
      },
      invalided_at: {
        type: Date,
        trim: true,
        required: true,
      },
    },
    {
      timesStampes: true,
    }
  );
  
  export default mongoose.model("BLACKLIST", blacklistModel, "Blacklist");