import { prisma } from "../config/db.js";
import { createPost, 
    getUserPost, 
    getPersonalizedFeedService, 
    closePostModel, 
    deletePost, 
    postResponseModel,
    getSinglePost,
    getAllResponses } from "../models/postModel.js";
export const createPostService = async (data) =>{
    const insertPost = await createPost(data)
    return insertPost
}

//  get user all post service
export const getAllUserPostService = async (userId) =>{
    return await getUserPost(userId)
}
//  getPersonalizedFeedService business logic
 export const getSpecificPostService = async (userProfile) =>{
    
    const posts = await getPersonalizedFeedService(userProfile.id)

    if(posts){
        const rankedPost = posts.map(post =>{
            let score = 0;
            //  rule one setting city as first priority
            if(post.city && userProfile.city && post.city.toLowerCase() === userProfile.city.toLowerCase()){
                score  +=100
            }
            //  rule 2 skills as the second priority
            if(post.tag && Array.isArray(post.tag) && Array.isArray(userProfile.skills)){
                const matchingSkillAndTag = post.tag.filter(t =>
                    userProfile.skills.some(s =>s.toLowerCase() === t.toLowerCase())
                )
                score +=(matchingSkillAndTag.length * 50)
            }

            //  rule 3 match state or check post within your state

            if(post.state && userProfile.state && post.state.toLowerCase() === userProfile.state.toLowerCase()){
                score +=25
            }

             // Rule D: get all viutual post 
            if (post.helpType === 'VIRTUAL') {
                score += 10;
            }

            const data ={
                ...post,
                matchscore:score
            }
            return data
        })
        return rankedPost.sort((a, b) => b.matchscore - a.matchscore)
    }
 }

//   close post service
export const closePostService = async (postId, userId) =>{
    return await closePostModel(postId, userId)
}

//   delete post service
export const deletePostService = async (postId, userId) =>{
    return await deletePost(postId, userId)
}

//  getsingle post service
export const getSinglePostService = async (postId) =>{
    const postExist = await getSinglePost(postId)
    if(!postExist){
        throw new Error("This help request no longer exists");
    }
     if (postExist.isClosed ===true) {
        throw new Error("This help request has already been closed and resolved");
     }

     if (postExist._count.responses >= postExist.maxApplicants) {
        throw new Error("Application limit reached! This post cannot accept any more responders");
    }
    return postExist
}
export const PostResponseService = async (postId, userId) =>{
    return await postResponseModel(postId, userId)
}

//  get all responses service
export const getAllPostResponses = async(postId, userId) =>{
     const postExist = await getSinglePost(postId)
    if(!postExist){
        throw new Error("Target help request not found");
    }
      if (postExist.userId !== userId) {
        throw new Error("Unauthorized: You can only view applications for posts created by your account");
    }
    const responses = await getAllResponses(postId)
    return {
        postTitle:postExist.title,
        responses:responses
    }
}