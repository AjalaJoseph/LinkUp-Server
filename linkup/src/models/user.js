import { prisma } from "../config/db.js";
import { getPublicIdFromUrl } from "../utils/urlhelper.js";
import {deleteImageFromCloudinary} from "../services/cloudinaryService.js"
export const findUserByEmail = async(email) =>{
    const checkUser =await prisma.user.findUnique({
        where:{
            email:email
        }
    })
    return  checkUser
}
//  find user by id
export const findUserById = async(id) =>{
    const find = await prisma.user.findUnique({
        where:{
            id:id
        }
    })
    return find
}

//  create new user
export const createUser = async(data) =>{
    return await prisma.user.create({
        data:{
            name:data.name,
            email:data.email,
            password:data.password
        }
    })
}

//  update profit
export const upadeteProfit = async(data) =>{
    return await prisma.user.update({
        where:{
            id:data.id
        },
        data:{
            bio:data.bio,
            state:data.state,
            skills:data.skills,
            city:data.city,
            profileCompleted:false,
        }
    })
} 
//  insert profile image
export const uploadProfilePic = async (data) =>{
    // get user profile picture if exist

   const existsPic = await prisma.user.findUnique({
    where:{
        id:data.id
    },
    select:{profileImage:true}
   })
   if(existsPic && existsPic.profileImage){
    const oldPictureUrl = await getPublicIdFromUrl(existsPic.profileImage)
    if(oldPictureUrl){
        await deleteImageFromCloudinary(oldPictureUrl)
    }
   }

//    insert image into the database
    const image = await prisma.user.update({
        where:{
            id :data.id
        },
        data:{
            profileImage:data.imageUrl,
            profileCompleted:true
        }
    })
    return image
}

// change password model
export const changePassword = async (id, newPassword)=>{
    const updatePassword = await prisma.user.update({
        where:{
            id: id
        },
        data:{
            password:newPassword
        }
    })
    return updatePassword
}

//  reset password
export const resetPassword = async (email, password) =>{
     const resetPassword = await prisma.user.update({
        where:{
            email:email
        },
        data:{
            password:password
        }
    })
    return resetPassword
}