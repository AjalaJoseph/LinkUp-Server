import cloudinary from "../config/cloudinary.js";

export const uploadToCloudinary = async (filebuffer) =>{
    return new Promise((resolve, reject) =>{
        const uploadStream = cloudinary.uploader.upload_stream(
            { 
                folder:"linkup_profiles",
                faces:true,
                transformation:[
                     { width: 400, height: 400, crop: "thumb", gravity: "face" },
                     {quality: "auto"},
                      { fetch_format: "auto" }
                ]
             },
            (error,result)=>{
                if(error){
                    return reject(error)
                }
                resolve(result)
        }
        )
        uploadStream.end(filebuffer)
    })
}

// delete user profile picture if exist inside the cloudinary
export const  deleteImageFromCloudinary  = async (publicId) =>{
    try{
        const deleteImage = await cloudinary.uploader.destroy(publicId, {invalidate:true})
        return deleteImage
    }
    catch (error) {
        throw new Error("Cloudinary file wiping failed:", error)
        return null
    }
}