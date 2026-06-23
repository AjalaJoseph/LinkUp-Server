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
export const getUserPost = async (userId, page, limit) =>{
    const skip = (page - 1) * limit
    const totalPosts = await prisma.post.count({
        where:{
            userId:userId
        },
    })
    const totalPages = Math.ceil(totalPosts/limit)
    const myPosts = await prisma.post.findMany({
        where:{
            userId:userId
        },
        skip:skip,
        take:limit,
        orderBy:{createdAt:"desc"},
        include:{
            _count:{
                select:{
                    responses:true
                }
            }
        }
    })
     return {
        myPosts,
        meta: {
            totalItems: totalPosts,
            totalPages: totalPages,
            currentPage: page,
            limit: limit,
            hasNextPage: page < totalPages,
            hasPreviousPage: page > 1
        }
    };
}

//  get all post in the data base 
export const getPersonalizedFeedService = async (limit,userId, cursor) =>{
     const queryOptions = {
        where: {
            isClosed: false,
            userId: { not: userId } // Still excludes the logged-in user's own posts
        },
        include: {
            user: {
                select: {
                    id: true,
                    name: true,
                    profileImage: true
                }
            }
        },
         take: limit + 1, // 🔥 Strategy: Fetch 1 extra item to check if a next page exists
        orderBy: {
            createdAt: 'desc' // Orders newest items first for the feed
        }
    };

    if(cursor){
        queryOptions.cursor = { id: cursor };
        queryOptions.skip = 1;
    }
    const posts = await prisma.post.findMany(queryOptions);
    const hasNextPage = posts.length > limit;
    const paginatedPosts = hasNextPage ? posts.slice(0, limit) : posts;
    const nextCursor = hasNextPage ? paginatedPosts[paginatedPosts.length - 1].id : null;
    return {
        posts: paginatedPosts,
        meta: {
            nextCursor,
            hasNextPage
        }
    };
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
export const getSinglePost = async(postId) =>{
    return await prisma.post.findUnique({
        where:{
            id:postId
        },
        include: { _count: { select: { responses: true } } }
    })
}
// postResponse model
export const postResponseModel = async (postId, userId) =>{
    const createPostResponse = await prisma.postResponse.create({
        data:{
            postId:postId,
            userId:userId
        },
        include: {
            post: { select: { title: true } }
        }
    })
    return createPostResponse
}

//  Get all responses for a post model
export const getAllResponses = async (postId, userId) =>{
    const responses = await prisma.postResponse.findMany({
          where: { postId: postId },
        orderBy: { createdAt: 'desc' }, 
        include: {
            user: { 
                select: {
                    id: true,
                    name: true,
                    profileImage: true,
                    bio: true,
                    conversationsB:{
                        where:{
                            userAId:userId,
                            postId:postId
                        },
                        select: { 
                            id: true, 
                            userAId: true, 
                            userBId: true 
                        },
                    }
                } 
            },
           post:{
            select:{
                title:true
            }
            }
        }
    })
    return responses
}
// get single post response 
export const getSinglePostResponse = async (responseId) =>{
    return await prisma.postResponse.findUnique({
        where:{
            id:responseId
        },
        include: { post: true }
    })
}
//  accept applicant model
export const acceptPostApplicantModel = async (payload)=>{
    return await prisma.$transaction(async (tx) =>{
        const updatedPostResponse = await tx.postResponse.update({
            where:{
                id:payload.responseId
            },
            data:{
                status:payload.action
            },
             select: { id: true, status: true, postId: true, userId: true }
        })
        if(payload.action === "ACCEPTED"){
            await tx.conversation.create({
                data:{
                    postId:payload.postId,
                    userAId:payload.userAId,
                    userBId:payload.userBId
                }
            })
        }

        if (payload.action === "REJECTED") {
            await tx.conversation.deleteMany({
                where: {
                   postId:payload.postId,
                    userAId:payload.userAId,
                    userBId:payload.userBId
                }
            });
        }
        
        return updatedPostResponse
    })
}

//  get my applicant model

export const getAllMyApplicant = async (userId, page, limit) =>{
     const skip = (page - 1) * limit
    const totalPostsApplie = await prisma.postResponse.count({
        where:{
            userId:userId
        },
    })
    const totalPages = Math.ceil(totalPostsApplie/limit)
    const myApplication = await prisma.postResponse.findMany({
        where:{
            userId:userId
        },
        include:{
            post:{
                include:{
                    conversations:{
                        where:{
                            userBId:userId
                        },
                        select: { 
                            id: true, 
                            userAId: true, 
                            userBId: true 
                        }
                    }
                }
            }
        },
        skip:skip,
        take:limit,
        orderBy:{createdAt:"desc"}
    })
    return {
        myApplication,
        meta: {
            totalItems: totalPostsApplie,
            totalPages: totalPages,
            currentPage: page,
            limit: limit,
            hasNextPage: page < totalPages,
            hasPreviousPage: page > 1
        }
    };
}


//  search for post
export const searchForPostModel = async (userId, cursor, userInput) => {
    const whereClause = {
        isClosed: false,
        userId: { not: userId }
    };

    const limit = 20; 
      if (userInput && userInput.trim() !== ""){
        const searchTerms = userInput.trim().split(/\s+/);
        
        whereClause.AND = searchTerms.map(term => ({
            OR: [
                { category: { contains: term, mode: 'insensitive' } },
                {city: {contains: term, mode:'insensitive'}},
                { tag: { array_contains: term.toLowerCase()  } },
                { title: { contains: term, mode: 'insensitive' } },
            ]
        }));
    } 

    const queryOptions = {
        where: whereClause,
        take: limit + 1, 
        include: {
            user: {
                select: { id: true, name: true, profileImage: true }
            }
        },
        orderBy: {
            createdAt: 'desc' 
        }
    };

    // Inject cursor points safely for React Native scroll pagination triggers
    if (cursor && cursor !== "null") {
        queryOptions.cursor = { id: cursor };
        queryOptions.skip = 1; 
    }

    const posts = await prisma.post.findMany(queryOptions);

    const hasNextPage = posts.length > limit;
    const paginatedPosts = hasNextPage ? posts.slice(0, limit) : posts;
    const nextCursor = hasNextPage ? paginatedPosts[paginatedPosts.length - 1].id : null;

    return {
        posts: paginatedPosts,
        meta: {
            nextCursor,
            hasNextPage
        }
    };
}; 
