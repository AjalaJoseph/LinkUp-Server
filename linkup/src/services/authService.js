import bcrypt from 'bcrypt'
import { findUserByEmail, createUser,upadeteProfit, uploadProfilePic, changePassword, findUserById  } from '../models/user.js'
import { generateAccessToken, generateRefreshToken } from '../utils/generateToken.js'
import { redis } from '../config/redis.js'  
import { uploadToCloudinary, deleteImageFromCloudinary } from './cloudinaryService.js'
import cloudinary from '../config/cloudinary.js'
export const registerUser = async(user) =>{
    const email = user.email
    const userExist = await findUserByEmail(email)
    if(userExist){
        throw Object.assign(new Error('Email already exists'),{statusCode:409})
    }
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
        throw Object.assign(new Error('user not found'), { statusCode: 404 })
    }
    const isPassworMatch = await bcrypt.compare(password, userData.password)
    if(!isPassworMatch){
        throw Object.assign(new Error('Invalid credentials'), {statusCode:400})
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
    const updateUser = await upadeteProfit(data)
    delete updateUser.password
    return updateUser
}
// cloudinary and face detection business logic 
export const cloudinaryService = async (file) =>{
    const result = await uploadToCloudinary(file)
    // console.log(result)
    const facesDetected = result.faces ||[]
    const faceCount = facesDetected.length
    if(faceCount ===0){
        await cloudinary.uploader.destroy(result.public_id)
        throw Object.assign(new Error("Verification failed: No human face detected. Please upload a clear photo of yourself."), {statusCode:400})
    }
    if(faceCount>1){
        await cloudinary.uploader.destroy(result.public_id)
        throw Object.assign(new Error(`Verification failed: Detected ${faceCount} faces. LinkUp profiles only allow single-person photos.`), {statusCode:401})
    }

    return result
}
//  upload profile image business logic
export const uploadProfileImageService = async(data)=>{
    const image = await uploadProfilePic(data)
    delete image.password
    return image
}

//  change password business logic
export const changePasswordService = async (id,oldPassword, newPassword) =>{
    const getUser = await findUserById(id)
    const comparePassword = await bcrypt.compare(oldPassword, getUser.password)
    if(!comparePassword){
        throw Object.assign(new Error('old password not correct enter correct password'),{statusCode:400})
    }
    const hashNewPassword = await bcrypt.hash(newPassword, 10)
    const passwordUpdate = await changePassword(id, hashNewPassword)
    delete passwordUpdate.password
    return passwordUpdate
}