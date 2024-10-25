import TICKETS from '../models/ticket.model.js';
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
    const collection = req.query.collection;
    console.log(collection);
    const TicketModel = mongoose.model("Ticket", TICKETS.schema, collection);
    try {
        const data = await TicketModel.find();
        const total = await TICKETS.countDocuments(); 
        res.send(data)
        // res.status(200).json({
        //     data,
        //     totalPages: Math.ceil(total / limit),
        //     currentPage: page,
        // });
    } catch (error) {
        res.status(500).json({ message: "Error al obtener los datos" });
    }
};


  
  
  
  