import connectDB from "./config/db_connection.js";
import express from "express";
import morgan from "morgan";
import ticketsRoute from "./routes/ticket.routes.js";
import ticketsFilterRoute from "./routes/ticket.filters.route.js"
import usuariosRoutes from "./routes/users.routes.js"
import authRoutes from "./routes/auth.routes.js"
import dashboard from "./routes/dashboard.routes.js"
import cors from "cors";
import "dotenv/config";
import cookieParser from "cookie-parser";

morgan.token('date', function () {
  return new Date().toISOString(); // Obtiene la fecha y hora en formato ISO
});

const format = '[:date] :method :url :status :response-time ms - :res[content-length]';
const app = express();
app.use(
  cors({
    origin: "http://localhost:4000", //API Gateway
    //origin: "*",
    credentials: true,
  })
);
app.use(morgan(format));
app.use(express.json());
app.use(cookieParser())
app.use("", ticketsRoute);
app.use("/api", ticketsFilterRoute);
app.use("/api", usuariosRoutes);
app.use("/api", authRoutes);
app.use("/api", dashboard);


connectDB() 
app.listen(process.env.PORT)