import { getUserDataService } from "../services/getUserService.js";
export const getUserControlller = async (req, res) =>{
    try{
        const id = req.user.id
        const data = await getUserDataService(id)
        return res.status(200).json({
            status:"success",
            message:"User profile fetched successfully",
            user:data
        })
    }
    catch(error){
        return res.status(500).json({
            status: "error",
            message: error.message || "Failed to retrieve user profile data"
        });
    }
}