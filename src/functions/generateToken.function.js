import jwt from "jsonwebtoken"
import "dotenv/config";
export const generateToken = (data) => {
    const token =  jwt.sign({...data},process.env.JWT_TOKEN,{
    expiresIn: "1h"
    })
    return token;
}