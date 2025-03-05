import mongoose from "mongoose";

const counterSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true }, // Identificador único para el contador (por ejemplo, "Id")
  seq: { type: Number, default: 1 } // Valor inicial del contador
});

const Counter = mongoose.model("Counter", counterSchema, "counters");
export default Counter;