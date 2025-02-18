import mongoose from "mongoose";

export async function startTransaction(req, res, next) {
    console.log("Transaccion iniciada");
    const session = await mongoose.startSession();
    session.startTransaction();
    req.mongoSession = session; // Store session in req
    next();
}