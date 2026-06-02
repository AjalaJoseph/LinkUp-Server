import { prisma } from "../config/db.js";
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
    const find = await prisma.findUnique({
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
            profileImage:null
        }
    })
} 