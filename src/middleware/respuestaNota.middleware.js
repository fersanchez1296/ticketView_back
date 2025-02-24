export const responseNota = async (req, res) => {
  res
    .status(201)
    .json({
      desc: "Nota agregada correctamente a la sección de historico del ticket.",
    });
};
