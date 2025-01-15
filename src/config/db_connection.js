import mongoose from "mongoose";
const connectDB = async () => {
  try {
    await mongoose.connect(
      `mongodb://${process.env.MONGODB_USER}:${process.env.MONGODB_PASSWORD}@${process.env.MONGODB_HOST}:${process.env.MONGODB_PORT}/tickets?authSource=admin&directConnection=true`
    );
    console.log(">>>DB is connected!");
  } catch (err) {
    console.log(">>>Cant connect to DB!");
    console.log(err.message);
  }
};

export default connectDB;
