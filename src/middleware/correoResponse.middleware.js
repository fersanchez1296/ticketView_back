export const correoResponse = async (req, res) => {
  return res.status(201).json({
    desc: req.response,
  });
};
