import jwt from "jsonwebtoken"
import dotenv from "dotenv"
import { redis } from "../config/redis.js";
dotenv.config()
 export const verifyToken =async (req, res, next) =>{
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(" ")[1]
    if(!token){
        return res.status(401).json({ error: 'Access denied. Token required.' });
    }
    const isBlacklisted = await redis.get(`blacklist:${token}`);
        
        if (isBlacklisted) {
            return res.status(401).json({ 
                status: "fail", 
                message: "This session has been terminated. Please log in again." 
            });
        }
        
    try{
        const decode = jwt.verify(token, process.env.JWT_SECRET)
        req.user = decode
        return next()
    }
    catch(err){
        return res.status(403).json({ error: 'Invalid or expired token.' });
    }
 }
//  refresh token middleware
export const verifyRefreshToken =async (req, res, next) =>{
    const { refreshToken} = req.cookies
    if(!refreshToken){
        return res.status(401).json({status:"fail", message:"Refresh token is missing"})
    }

    const decode = jwt.verify(refreshToken, process.env.REFRESH_SECRET)
    const { id, email} = decode
    const checkRedisToken = await redis.get(`refresh:${id}`)
    if(!checkRedisToken || refreshToken !==checkRedisToken){
        return res.status(403).json({ status: "fail", message: "Invalid or expired session" });
    }
    req.user =decode
    return next()
}