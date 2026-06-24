import { registerUser, 
    loginService,
    updateService,
     uploadProfileImageService, 
     cloudinaryService,
    changePasswordService } from "../services/authService.js";
import { uploadToCloudinary } from "../services/cloudinaryService.js"
import {generateAccessToken} from '../utils/generateToken.js'
import { redis } from "../config/redis.js";
import { logger } from "../utils/logger.js";
import dotenv from 'dotenv'
dotenv.config()
export const registerController = async(req, res, next) =>{
    try{
        const {name, email, password} = req.body
        const user ={
            "name" : name,
            "email" : email,
            "password" : password
        }
        const userData = await registerUser(user)
        return res.status(201).json({
            status:"success",
            message: "User registered successfully",
            user: {
                id: userData.id,
                name:userData.name,
                email: userData.email
            }
        })
    }
    catch(error){
        next(error)
    }
}

// login controller
export const loginController = async (req, res, next) =>{
    try{
        const {email, password} = req.body
        const loginUser = await loginService(email, password)
        res.cookie('refreshToken', loginUser.refreshToken, {
                httpOnly: true,
                sameSite: 'Strict',
                maxAge: 7 * 24 * 60 * 60 * 1000 ,// 7 days in milliseconds
                secure: process.env.NODE_ENV === 'production' 
            })
        res.status(201).json({
            status:"success",
            message:"login successfull",
            data:{
                id:loginUser.userData.id,
                name:loginUser.userData.name,
                email:loginUser.userData.email,
                profileComplited: loginUser.userData.profileCompleted
            },
            accessToken:loginUser.accessToken
        })
        // res.cookie("refreshToken", )
    }
    catch(error){
        next(error)
    }
}

//  update profit controller
export const updateProfitController = async(req, res, next) =>{
    try{
        const {state, city, bio, skills} = req.body
        const {id, email} = req.user
        // console.log(id, email)
        const data = {
            id:id,
            email:email,
            state:state,
            city:city,
            bio:bio,
            skills:skills
        }
        const update = await updateService(data)
           return res.status(200).json({
            status: "success",
            message: "Profile updated successfully",
            data: update
        });
    }
    catch(error){
        next(error)
    }
}
//  profile picture image uploading controller
export const uploadProfileImageController = async (req, res, next) =>{
    try{
        const {id} = req.user
        const file = req.file
        
        if(!file){
            return res.status(400).json({ 
                status: "fail",
                 message: "Please select an image file"
                });
        }
        const imageUrl = await cloudinaryService(file.buffer)
        const data ={
            id:id,
            imageUrl:imageUrl.secure_url
        }
        const saveToDatabase = await uploadProfileImageService(data)
        
        return res.status(200).json({
            status: "success",
            message: "Profile picture uploaded successfully!",
            data: saveToDatabase
        });
    }
    catch (error) {
        next(error)
    }
}

//  refresh token controller
export const refreshTokenController = async(req, res, next)=>{
    try{
        const {id, email} =req.user
        const newAccessToken = await generateAccessToken(id, email)
        return res.status(200).json({
            status: "success",
            accessToken: newAccessToken
        });
    }
    catch(error){
        next(error)
    }
}

//  logout controller
export const logoutController = async (req, res, next) =>{
    try{
        const {id} = req.user
        await redis.del(`refresh:${id}`)
       res.clearCookie('refreshToken', {
            httpOnly: true,
            sameSite: 'strict'
        });
        return res.status(200).json({
            status: "success",
            message: "Logged out successfully"
        });
    }
    catch(error){
         res.clearCookie('refreshToken', {
            httpOnly: true,
            sameSite: 'strict',
            secure: process.env.NODE_ENV === 'production'
        });
        next(error)
    }
}

//  change password controller 
export const changePasswordController = async (req, res, next) =>{
    try{
        const id = req.user.id
        const {old_password, new_password} = req.body
        await changePasswordService(id,old_password, new_password)
        return res.status(200).json({status:"success", message:"password updated sucessfully"})
    }
    catch(error){
        next(error)
    }
}