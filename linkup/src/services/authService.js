import bcrypt from 'bcrypt'
import { findUserByEmail, createUser,upadeteProfit, uploadProfilePic, changePassword, findUserById, resetPassword  } from '../models/user.js'
import { generateAccessToken, generateRefreshToken } from '../utils/generateToken.js'
import { redis } from '../config/redis.js'  
import { uploadToCloudinary, deleteImageFromCloudinary } from './cloudinaryService.js'
import cloudinary from '../config/cloudinary.js'
import { emailQueue } from '../BackgroundQueue/resetPassswordQueue.js'
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

//  forgot password service
export const forgotPasswordService = async (email) =>{
     const checkUser = await findUserByEmail(email);
            if (!checkUser) {
                throw Object.assign(new Error('This Email is not yet registered an account.'),{statusCode:404})
            }
    
            let otpCode;
            let isUnique = false;
    
            while (!isUnique) {
                otpCode = Math.floor(100000 + Math.random() * 900000).toString();
                const collisionCheck = await redis.get(`password_reset_code:${otpCode}`);
                if (!collisionCheck) {
                    isUnique = true;
                }
            }
    
            // 2. Cache the secure unique lookup reference code inside your Valkey instance
            const userKey = `password_reset_code:${otpCode}`;
            await redis.set(userKey, email, 'EX', 600); // 10-minute automatic expiration
            // 3. 🚀 Push to background BullMQ line using your exact queue name definition
           const sendOtpEmail = await emailQueue.add('reset-password', {
                email: email,
                otpCode: otpCode
            }, {
                attempts: 3,
                backoff: { type: 'exponential', delay: 3000 },
                removeOnComplete: true
            });
            return sendOtpEmail
}

//  reset- password 
export const resetPasswordService = async (otpCode, password) =>{
     const valkeyCodeKey = `password_reset_code:${otpCode}`;
    const verifyOtp = await redis.get(valkeyCodeKey)
    if(!verifyOtp){
        throw Object.assign(new Error("Invalid or expired verification code sequence. Please request a new code."), {statusCode:400})
    }
    const newHashPasword = await bcrypt.hash(password, 10)
    const email = verifyOtp
    const newPassword = await resetPassword(email, newHashPasword)
     await redis.del(valkeyCodeKey);
    delete newPassword.password
    return newPassword
}