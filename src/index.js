import connectDB from "./config/db_connection.js";
import express from "express";
import morgan from "morgan";
import ticketsRoute from "./routes/ticket.routes.js";
import ticketsFilterRoute from "./routes/ticket.filters.route.js";
import usuariosRoutes from "./routes/users.routes.js";
import dashboard from "./routes/dashboard.routes.js";
import cors from "cors";
import "dotenv/config";
import cookieParser from "cookie-parser";
import { redisClient } from "./config/redis_connection.js";

morgan.token("date", function () {
  return new Date().toISOString();
});
const format =
  "[:date] :method :url :status :response-time ms - :res[content-length]";
const app = express();
app.use(
  cors({
    origin: ["http://localhost:4000", "http://localhost:3000"], //API Gateway
    //origin: "*",
    credentials: true,
  })
);
app.use(morgan(format));
app.use(express.json());
app.use(cookieParser());
app.use(ticketsRoute);
app.use(ticketsFilterRoute);
app.use(usuariosRoutes);
app.use(dashboard);

connectDB();
redisClient.connect().then(() => {
  console.log("Redis connected");
  app.listen(process.env.PORT);
});
