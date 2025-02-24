export const genericResponse = async (req, res) => {
    res
      .status(201)
      .json({
        desc: "El estado del ticket fué modificado con éxito.",
      });
  };
  