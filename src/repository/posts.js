export const postCrearTicket = async () => {};

export const postRegistrarUsuario = async (body, pasword) => {
  const RES = new USUARIO({
    ...body,
    password: hashedPassword,
  });
  RES.save();
  return RES;
};
