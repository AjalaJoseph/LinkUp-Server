import { prisma } from "../config/db.js";
export const createPost = async (data) =>{
    const post = await prisma.post.create({
        data:{
            userId:data.userId,
            title:data.title,
            description:data.description,
            image:data.image || null,
            tag:data.tag,
            category:data.category,
            helpType: data.helpType,
            country:data.country,
            state:data.state,
            city:data.city,
            maxApplicants:data.maxApplicants
        },
        include:{
            user:{
               select:{
                 id:true,
                name:true,
                email:true
               }
            }
        }
    })
    return post
}

//  get user post
export const getUserPost = async (userId) =>{
    return await prisma.post.findMany({
        where:{
            userId:userId
        },
        orderBy:{createdAt:"desc"},
        include:{
            _count:{
                select:{
                    responses:true
                }
            }
        }
    })
}

//  get all post in the data base 
export const getPersonalizedFeedService = async (userId) =>{
    const allOpenPosts = await prisma.post.findMany({
        where:{
            isClosed:false,
            userId:{not:userId}
        },
        include:{
            user:{
                select:{
                    id:true,
                    name:true,
                    profileImage:true
                }
            }
        }
    })

    return allOpenPosts
}

//  close post model
export const closePostModel = async ( postId, userId) =>{
    const post = await prisma.post.findUnique({
        where:{
            id:postId
        }
    })
     
    if(!post){
        throw new Error("Post not found")
    }

    if (post.userId !== userId) {
        throw new Error("Unauthorized: You can only close posts created by your account");
    }

    const closePost = await prisma.post.update({
        where:{id:postId},
        data:{
            isClosed:true
        }
    });

    return closePost
}

//  delete post model

export const deletePost = async(postId, userId) =>{
     const post = await prisma.post.findUnique({
        where:{
            id:postId
        }
    })
     
    if(!post){
        throw new Error("Post not found")
    }

    if (post.userId !== userId) {
        throw new Error("Unauthorized: You can only delete posts created by your account");
    }

    const deleteSpecificPost = await prisma.post.delete({
        where:{
            id:postId
        },
        select:{
            id:true,
            title:true
        }
    })
    return deleteSpecificPost
}