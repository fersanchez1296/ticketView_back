import mongoose from "mongoose";
import Dependencia from "../models/dependencia.model.js";
import Direccion_area from "../models/direccion_area.model.js";
import Direccion_general from "../models/direccion_general.model.js";
import Clientes from "../models/clientes.model.js";
import * as Models from "../models/index.js";

export const guardarCliente = async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  req.sessionDB = session;
  if (!req.body.nuevoCliente) {
    req.ticketState = JSON.parse(req.body.ticketState);
    return next();
  }
  const nuevoCliente = JSON.parse(req.body.nuevoCliente);
  delete nuevoCliente._id;
  delete nuevoCliente.isEdit;
  const nuevaDependencia = nuevoCliente.nuevaDependencia;
  const nuevaDArea = nuevoCliente.nuevaDArea;
  const nuevaDGeneral = nuevoCliente.nuevaDGeneral;

  try {
    if (nuevaDependencia) {
      const nuevoDependencia = await Dependencia.create(
        [{ Dependencia: nuevaDependencia }],
        { session }
      );
      nuevoCliente.Dependencia = nuevoDependencia[0]._id;
    }

    if (nuevaDArea) {
      const nuevoDArea = await Direccion_area.create(
        [{ direccion_area: nuevaDArea }],
        { session }
      );
      nuevoCliente.direccion_area = nuevoDArea[0]._id;
    }

    if (nuevaDGeneral) {
      const nuevoDGeneral = await Direccion_general.create(
        [{ Direccion_General: nuevaDGeneral }],
        { session }
      );
      nuevoCliente.Direccion_General = nuevoDGeneral[0]._id;
    }
    const [guardarCliente] = await Clientes.create([{ ...nuevoCliente }], { session });
    console.log(guardarCliente);
    if(!guardarCliente) {
        await session.abortTransaction();
        session.endSession();
        return res.status(500).json({desc: "Error al guardar el cliente"});
    }
    req.cliente = guardarCliente._id;
    req.ticketState = JSON.parse(req.body.ticketState);
    next();
  } catch (error) {
    console.log(error);
    await session.abortTransaction();
    session.endSession();
    res.status(500).json({ desc: "Error al guardar el cliente" });
  }
};
