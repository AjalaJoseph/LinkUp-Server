import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'
dotenv.config()
export const generateAccessToken = (id, email)=>{
    const pay_load ={
        id,
        email
    }
    const accessToken = jwt.sign(pay_load, process.env.JWT_SECRET, {expiresIn: process.env.JWT_EXPIRES_IN} )
     
    return accessToken
}

// generation of refresh token 
export const generateRefreshToken = (id, email) =>{
    const pay_load ={
        id,
        email
    }
    const refreshToken = jwt.sign(pay_load, process.env.REFRESH_SECRET, {expiresIn:process.env.REFREESH_TOKEN_EXPIRES_IN})

    return refreshToken
    }