import { BLACKLIST } from "../models/index.js";

export const addToBlacklist = async (req, res, next) => {
    const token = req.cookies.access_token; 
    console.log(req.user);
    const invalidate = new BLACKLIST({
        ...req.user,
        token: token,
        invalided_at: Date.now(),
    })
    try {
        await invalidate.save()
        next()
    } catch (error) {
        console.log(error);
    }
}