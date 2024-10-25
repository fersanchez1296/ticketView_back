import mongoose from "mongoose";
import "dotenv/config";
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.DB_DEV)
        console.log(">>>DB is connected!")
    } catch (err) {
        console.log(">>>Cant connect to DB!")
        console.log(err.message)
    }
}

export default connectDB