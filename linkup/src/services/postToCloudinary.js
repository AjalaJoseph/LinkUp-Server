import cloudinary from "../config/cloudinary.js";

export const uploadToCloudinary = async (filebuffer) =>{
    return new Promise((resolve, reject) =>{
        const uploadStream = cloudinary.uploader.upload_stream(
            { 
                folder:"linkup_posts",
                transformation:[
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
