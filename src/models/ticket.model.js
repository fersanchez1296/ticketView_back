import mongoose, { Schema } from "mongoose";

const ticketModel = mongoose.Schema(
    {
      Id: {
        type: Number,
        trim: true,
      },
      "Tipo_incidencia": {
        type: Schema.Types.ObjectId,
        trim: true,
        ref: "TIPO_TICKET"
      },
      "Fecha_hora_creacion": {
        type: Date,
        trim: true,
      },
      "Fecha_hora_limite_resolucion_SLA": {
        type: Date,
        trim: true,
      },
      "Fecha_hora_ultima_modificacion": {
        type: Date,
        trim: true,
      },
      "Estado": {
        type: Schema.Types.ObjectId,
        trim: true,
        ref: "ESTADOS"
      },
      "Equipo_asignado": {
        type: Schema.Types.ObjectId,
        trim: true,
        ref: "EQUIPOS_ASIGNADOS"
      },
      "Asignado_a": {
        type: String,
        trim: true,
      },
      "Creado_por": {
        type: String,
        trim: true,
      },
      "Categoria": {
        type: Schema.Types.ObjectId,
        trim: true,
        ref: "CATEGORIAS"
      },
      "Servicio": {
        type: Schema.Types.ObjectId,
        trim: true,
        ref: "SERVICIOS"
      },
      "Subcategoria": {
        type: Schema.Types.ObjectId,
        trim: true,
        ref: "SUBCATEGORIA"
      },
      "Nombre_cliente": {
        type: String,
        trim: true,
      },
      Secretaria: {
        type: Schema.Types.ObjectId,
        trim: true,
        ref: "SECRETARIA"
      },
      "Direccion_general": {
        type: Schema.Types.ObjectId,
        trim: true,
        ref: "DIRECCION_GENERAL"
      },
      "Direccion_area": {
        type: Schema.Types.ObjectId,
        trim: true,
        ref: "DIRECCION_AREA"
      },
      "Descripcion": {
        type: String,
        trim: true,
      },
      "Prioridad": {
        type: Schema.Types.ObjectId,
        trim: true,
        ref: "PRIORIDADES"
      },
      "Incidencia_grave": {
        type: String,
        trim: true,
      },
      "Fecha_limite_respuesta_SLA": {
        type: Date,
        trim: true,
      },
    },
    {
      timesStampes: true,
    }
  );
  
  export default mongoose.model("TICKETS", ticketModel);