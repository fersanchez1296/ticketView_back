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
  let ticketState = JSON.parse(req.body.ticketState);
  ticketState.Nombre_cliente = nuevoCliente.Nombre;
  ticketState.Telefono_cliente = nuevoCliente.Telefono;
  ticketState.Extension_cliente = nuevoCliente.Extension;
  ticketState.Ubicacion_cliente = nuevoCliente.Ubicacion;
  ticketState.Correo_cliente = nuevoCliente.Correo;
  ticketState.Dependencia_cliente = nuevoCliente.Dependencia;
  ticketState.Direccion_area = nuevoCliente.direccion_area;
  ticketState.Direccion_general = nuevoCliente.Direccion_General;

  try {
    if (nuevaDependencia) {
      console.log("Agregando nuevaDependencia:", nuevaDependencia);
      const nuevoDependencia = await Dependencia.create(
        [{ Dependencia: nuevaDependencia }],
        { session }
      );
      console.log("idDependencia", nuevoDependencia);
      ticketState.Dependencia_cliente = nuevoDependencia[0]._id;
      nuevoCliente.Dependencia = nuevoDependencia[0]._id;
    }

    if (nuevaDArea) {
      console.log("Agregando nuevaDArea:", nuevaDArea);
      const nuevoDArea = await Direccion_area.create(
        [{ direccion_area: nuevaDArea }],
        { session }
      );
      ticketState.Direccion_area = nuevoDArea[0]._id;
      nuevoCliente.direccion_area = nuevoDArea[0]._id;
    }

    if (nuevaDGeneral) {
      console.log("Agregando nuevaDGeneral:", nuevaDGeneral);
      const nuevoDGeneral = await Direccion_general.create(
        [{ Direccion_General: nuevaDGeneral }],
        { session }
      );
      ticketState.Direccion_general = nuevoDGeneral[0]._id;
      nuevoCliente.Direccion_General = nuevoDGeneral[0]._id;
    }
    const guardarCliente = await Clientes.create([{ ...nuevoCliente }], { session });
    if(!guardarCliente) {
        await session.abortTransaction();
        session.endSession();
        return res.status(500).json({desc: "Error al guardar el cliente"});
    }
    req.ticketState = ticketState;
    next();
  } catch (error) {
    console.log(error);
    await session.abortTransaction();
    session.endSession();
    res.status(500).json({ desc: "Error al guardar el cliente" });
  }
};
