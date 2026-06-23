import { getUserDataService } from "../services/getUserService.js";
export const getUserControlller = async (req, res, next) =>{
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
        next(error)
    }
}