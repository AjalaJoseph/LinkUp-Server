import { registerUser, loginService,updateService } from "../services/authService.js";
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
        console.log(req.body, req.user)
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