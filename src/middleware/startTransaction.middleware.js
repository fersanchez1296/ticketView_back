import mongoose from "mongoose";

export async function startTransaction(req, res, next) {
    const session = await mongoose.startSession();
    session.startTransaction();
    req.mongoSession = session; // Store session in req
    next();
}