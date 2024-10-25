import connectDB from "./config/db_connection.js";
import express from "express";
import morgan from "morgan";
import ticketsRoute from "./routes/ticket.route.js";
import ticketsFilterRoute from "./routes/ticket.filters.route.js"
import cors from "cors";
import "dotenv/config";

morgan.token('date', function () {
  return new Date().toISOString(); // Obtiene la fecha y hora en formato ISO
});

const format = '[:date] :method :url :status :response-time ms - :res[content-length]';
const app = express();
app.use(
  cors({
    //origin: ["http://localhost:3000"],
    origin: "*",
    //credentials: true,
  })
);
app.use(morgan(format));
app.use(express.json());
app.use("/api", ticketsRoute);
app.use("/api", ticketsFilterRoute);


connectDB() 
app.listen(process.env.PORT)