import { registerUser, loginService,updateService, uploadProfileImageService, cloudinaryService } from "../services/authService.js";
import { uploadToCloudinary } from "../services/cloudinaryService.js"
import {generateAccessToken} from '../utils/generateToken.js'
export const registerController = async(req, res) =>{
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
            message: "User register successfully",
            user: {
                id: userData.id,
                name:userData.name,
                email: userData.email
            }
        })
    }
    catch(error){
        return res.status(400).json({
            status:"fail",
            error:error.message
        })
    }
}

// login controller
export const loginController = async (req, res) =>{
    try{
        const {email, password} = req.body
        const loginUser = await loginService(email, password)
        res.cookie('refreshToken', loginUser.refreshToken, {
                httpOnly: true,
                sameSite: 'Strict',
                maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days in milliseconds
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
            token:loginUser.accessToken
        })
        // res.cookie("refreshToken", )
    }
    catch(error){
        return res.status(400).json({
            status:"fail",
            error: error.message
        })
    }
}

//  update profit controller
export const updateProfitController = async(req, res) =>{
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
        return res.status(400).json({ status: "fail", message: error.message || "Failed to update profile" });
    }
}
//  profile picture image uploading controller
export const uploadProfileImageController = async (req, res) =>{
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
        console.error("Upload controller operation error:", error);
        return res.status(400).json({ status: "error", message: error.message || "Failed to upload image" });
    }
}

//  refresh token controller
export const refreshTokenController = async(req, res)=>{
    try{
        const {id, email} =req.user
        const newAccessToken = await generateAccessToken(id, email)
        return res.status(200).json({
            status: "success",
            accessToken: newAccessToken
        });
    }
    catch(error){
        return res.status(400).json({status:"fail", message:error.message})
    }
}