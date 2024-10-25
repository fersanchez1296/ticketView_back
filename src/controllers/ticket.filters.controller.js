import TICKETS from '../models/ticket.model.js';


export const getTicketsByFilter = async (req, res) => {
    const page = parseInt(req.query.page) || 1; 
    const limit = parseInt(req.query.limit) || 10; 
    const skip = (page - 1) * limit;

    const filters = {};

    if (req.query.estado_asignado) {
        filters.estado_asignado = req.query.estado_asignado;
    }

    if (req.query.asignado_a) {
        filters.asignado_a = req.query.asignado_a;
    }

    if (req.query.prioridad) {
        filters.prioridad = req.query.prioridad;
    }

    if (req.query.equipo_asignado) {
        filters.equipo_asignado = req.query.equipo_asignado;
    }

    if (req.query.tipo_ticket) {
        filters.tipo_ticket = req.query.tipo_ticket;
    }

    if (req.query.cliente) {
        filters.cliente = req.query.cliente;
    }

    try {
        const results = await TICKETS.find(filters).skip(skip).limit(limit);
        const total = await TICKETS.countDocuments(filters); // Total de resultados para paginación
        res.json({
            data: results,
            totalPages: Math.ceil(total / limit),
            currentPage: page
        });
    } catch (error) {
        res.status(500).json({ message: "Error al obtener los tickets", error });
    }
};

  
  
  
  