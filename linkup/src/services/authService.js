import bcrypt from 'bcrypt'
import { findUserByEmail, createUser,upadeteProfit } from '../models/user.js'
import { generateAccessToken, generateRefreshToken } from '../utils/generateToken.js'
import { redis } from '../config/redis.js'  

export const registerUser = async(user) =>{
    const email = user.email
    const userExist = await findUserByEmail(email)
    if(userExist){
        throw new Error('Email already exists')
    }

    // hash password
    
    const hashPassword = await bcrypt.hash(user.password, 10)
    const name = await user.name
    const data ={
        "name":user.name,
        "email":user.email,
        "password":hashPassword
    }
    const userInsert = await createUser(data)
    return userInsert
}

// login serevice
export const loginService = async (email, password) =>{
    const userData = await findUserByEmail(email)
    if(!userData){
        throw new Error('user not found')
    }
    const isPassworMatch = await bcrypt.compare(password, userData.password)
    if(!isPassworMatch){
        throw new Error('Invalid credentials')
    }
    const accessToken = await generateAccessToken(userData.id, userData.email)
    const refreshToken = await generateRefreshToken(userData.id, userData.email)
    await redis.set(`refresh:${userData.id}`,refreshToken, "EX", 60*60*24*7)
    delete userData.password
    return{
        userData,
        accessToken,
         refreshToken
    }
}

//  update profile service
export const updateService = async(data) =>{
    console.log(data)
    const updateUser = await upadeteProfit(data)
    return updateUser
}