export async function endTransaction(req, res, next) {
    try {
      if (req.mongoSession && req.mongoSession.inTransaction()) {
        await req.mongoSession.commitTransaction();
        console.log("Transacción confirmada.");
      }
      req.mongoSession.endSession();
      return next();
    } catch (error) {
      console.error("Error en la transacción:", error);
  
      if (req.mongoSession) {
        await req.mongoSession.abortTransaction();
        req.mongoSession.endSession();
      }
  
      return res.status(500).json({
        desc: "Ocurrió un error al procesar la información del ticket."
      });
    }
  }