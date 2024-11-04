import {
    TICKETS,
} from "../models/index.js"
import mongoose from 'mongoose';


export const getTickets = async (req, res) => {
    const page = parseInt(req.query.page) || 1; 
    const limit = parseInt(req.query.limit) || 10; 
    const skip = (page - 1) * limit; 
    console.log(page,limit);
    try {
        const results = await TICKETS.find().skip(skip).limit(limit);
        const total = await TICKETS.countDocuments(); 
        res.status(200).json({
            data: results,
            totalPages: Math.ceil(total / limit),
            currentPage: page,
        });
    } catch (error) {
        res.status(500).json({ message: "Error al obtener los datos" });
    }
};

export const getTicketsAbiertos = async (req, res) => {
    const {username} = req.user;
    //console.log(req.user);
    const collection = req.query.collection;
    const TicketModel = mongoose.model("Ticket", TICKETS.schema, collection);
    try {
        const data = await TicketModel.find({"Asignado_a" : username})
        .populate("Tipo_incidencia", "Tipo_de_incidencia -_id")
        .populate("Equipo_asignado", "Equipo_asignado _id")
        .populate("Categoria", "Categoria -_id")
        .populate("Servicio", "Servicio -_id")
        .populate("Subcategoria", "Subcategoria -_id")
        .populate("Secretaria", "Secretaria -_id")
        .populate("Direccion_general", "Direccion_General -_id")
        .populate("Direccion_area", "direccion_area -_id")
        .populate("Prioridad", "Prioridad Descripcion -_id")
        .populate("Estado", "Estado _id");

        if (data){
            if (data.Direccion_area);
            console.log("entra")
                data.Direccion_area = "En blalnco o sin asignar."
        }
        res.send(data)
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Error al obtener los datos" });
    }
};


  
  
  
  