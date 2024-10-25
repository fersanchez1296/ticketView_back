import mongoose from "mongoose";

const ticketModel = mongoose.Schema(
    {
      id: {
        type: Number,
        trim: true,
      },
      fecha_inicio: {
        type: Date,
        trim: true,
      },
      mesa_ayuda_abre: {
        type: String,
        trim: true,
      },
      estado_asignado: {
        type: String,
        required: true,
        trim: true,
      },
      estado_final: {
        type: String,
        required: true,
        trim: true,
      },
      categoria: {
        type: String,
        required: true,
        trim: true,
      },
      descripcion: {
        type: String,
        required: true,
        trim: true,
      },
      correo_asignado: {
        type: String,
        required: true,
        trim: true,
      },
      prioridad: {
        type: String,
        required: true,
        trim: true,
      },
      fecha_cierre_ticket: {
        type: Date,
        required: true,
        trim: true,
      },
      mesa_ayuda_cierre: {
        type: String,
        required: true,
        trim: true,
      },
      equipo_asignado: {
        type: String,
        required: true,
        trim: true,
      },
      tipo_ticket: {
        type: String,
        required: true,
        trim: true,
      },
      medio_solicitud_recibido: {
        type: String,
        required: true,
        trim: true,
      },
      cliente: {
        type: String,
        required: true,
        trim: true,
      },
      dependencia_cliente: {
        type: String,
        required: true,
        trim: true,
      },
      area_reasinado_a: {
        type: String,
        required: true,
        trim: true,
      },
      respuesta_cierre_reasignado: {
        type: String,
        required: true,
        trim: true,
      },
    },
    {
      timesStampes: true,
    }
  );
  
  export default mongoose.model("TICKETS", ticketModel);