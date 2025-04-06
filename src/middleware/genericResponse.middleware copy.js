export const responsePendingReason = async (req, res) => {
    return res
      .status(201)
      .json({
        desc: "Razón pendiente agregada con exito.",
      });
  };
  