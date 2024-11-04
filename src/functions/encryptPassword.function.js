import bcrypt from "bcryptjs"
import "dotenv/config";
const encryptPassword = async (pass) => {
    const hashedPassword = await bcrypt.hash(pass, 10);
    return hashedPassword;
}

export default encryptPassword;