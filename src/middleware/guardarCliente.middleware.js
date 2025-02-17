import mongoose from "mongoose";
import Dependencia from "../models/dependencia.model.js";
import Direccion_area from "../models/direccion_area.model.js";
import Direccion_general from "../models/direccion_general.model.js";
import Clientes from "../models/clientes.model.js";
import * as Models from "../models/index.js";

export const guardarCliente = async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    //req.sessionDB = session;
    req.ticketState = JSON.parse(req.body.ticketState);
    if (!req.body.nuevoCliente) {
      return next();
    }
    const nuevoCliente = JSON.parse(req.body.nuevoCliente);
    console.log(nuevoCliente);
    const nuevaDependencia = nuevoCliente.nuevaDependencia
      ? nuevoCliente.nuevaDependencia
      : null;
    const nuevaDArea = nuevoCliente.nuevaDArea ? nuevoCliente.nuevaDArea : null;
    const nuevaDGeneral = nuevoCliente.nuevaDGeneral
      ? nuevoCliente.nuevaDGeneral
      : null;

    if (nuevaDependencia) {
      const nuevoDependencia = await Dependencia.create(
        [{ Dependencia: nuevaDependencia }],
        { session }
      );
      console.log("nueva dependencia", nuevoDependencia);
      nuevoCliente.Dependencia = nuevoDependencia[0]._id;
    }

    if (nuevaDArea) {
      const nuevoDArea = await Direccion_area.create(
        [{ direccion_area: nuevaDArea }],
        { session }
      );
      console.log("nueva area", nuevoDArea);
      nuevoCliente.direccion_area = nuevoDArea[0]._id;
    }

    if (nuevaDGeneral) {
      const nuevoDGeneral = await Direccion_general.create(
        [{ Direccion_General: nuevaDGeneral }],
        { session }
      );
      console.log("nueva general", nuevoDGeneral);
      nuevoCliente.Direccion_General = nuevoDGeneral[0]._id;
    }
    const [guardarCliente] = await Clientes.create([{ ...nuevoCliente }], {
      session,
    });
    console.log("console de guardar cliente", guardarCliente);
    if (!guardarCliente) {
      await session.abortTransaction();
      session.endSession();
      return res.status(500).json({ desc: "Error al guardar el cliente" });
    }
    req.cliente = guardarCliente._id;
    req.sessionDB = session;
    return next();
  } catch (error) {
    console.log("error", error);
    await session.abortTransaction();
    session.endSession();
    res.status(500).json({ desc: "Error al guardar el cliente" });
  }
};
