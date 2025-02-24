import mongoose from "mongoose";
import Dependencia from "../models/dependencia.model.js";
import Direccion_area from "../models/direccion_area.model.js";
import Direccion_general from "../models/direccion_general.model.js";
import Clientes from "../models/clientes.model.js";

export const guardarCliente = async (req, res, next) => {
  const session = req.mongoSession;
  try {
    console.log("no hay cliente");
    req.ticketState = JSON.parse(req.body.ticketState);
    if (!req.body.nuevoCliente) {
      return next();
    }

    const nuevoCliente = JSON.parse(req.body.nuevoCliente);

    const nuevaDependencia = nuevoCliente.nuevaDependencia || null;
    const nuevaDArea = nuevoCliente.nuevaDArea || null;
    const nuevaDGeneral = nuevoCliente.nuevaDGeneral || null;

    if (nuevaDependencia) {
      const nuevoDependencia = await Dependencia.create(
        [{ Dependencia: nuevaDependencia }],
        { session }
      );
      console.log("nueva dependencia", nuevoDependencia);
      nuevoCliente.Dependencia = nuevoDependencia[0]._id;
    }

    if (nuevaDArea) {
      const nuevoDArea = new Direccion_area({ direccion_area: nuevaDArea });
      await nuevoDArea.save({ session });
      console.log("Área de dirección guardada manualmente:", nuevoDArea);
      nuevoCliente.direccion_area = nuevoDArea._id;
    }

    if (nuevaDGeneral) {
      const nuevoDGeneral = await Direccion_general.create(
        [{ Direccion_General: nuevaDGeneral }],
        { session }
      );
      console.log("nueva general", nuevoDGeneral);
      nuevoCliente.Direccion_General = nuevoDGeneral[0]._id;
    }
    const cliente = new Clientes({...nuevoCliente});
    await cliente.save({session});
    if (!guardarCliente) {
      console.log("error al guardar el cliente");
      await session.abortTransaction();
      session.endSession();
      return res.status(500).json({ desc: "Error al guardar el cliente" });
    }

    req.cliente = cliente._id;
    console.log("Cliente guardado");
    return next();
  } catch (error) {
    console.error("Error al guardar cliente:", error);
    console.log("Estado de la sesión al caer en el catch de guardar cliente:", session.inTransaction());
    if (session) {
      console.log("Transaccion abortada");
      await session.abortTransaction();
      session.endSession();
    }
    res.status(500).json({ desc: "Error al guardar el cliente" });
  }
};