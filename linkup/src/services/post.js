import { prisma } from "../config/db.js";
import { createPost, 
    getUserPost, 
    getPersonalizedFeedService, 
    closePostModel, 
    deletePost, 
    postResponseModel,
    getSinglePost,
    getAllResponses,
     getSinglePostResponse,
    acceptPostApplicantModel,
    searchForPostModel
     } from "../models/postModel.js";

    //  create post businnes logic
export const createPostService = async (data) =>{
    const insertPost = await createPost(data)
    return insertPost
}

//  get user all post service
export const getAllUserPostService = async (userId,page, limit) =>{
    const myPosts = await getUserPost(userId, page, limit)
    return myPosts
}

//  getPersonalizedFeedService business logic
 export const getSpecificPostService = async (userProfile) =>{
    
    const postData = await getPersonalizedFeedService( userProfile.limit, userProfile.id,userProfile.cursor)
    if(postData){
        const rankedPost = postData.posts.map(post =>{
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
        return {
           data: rankedPost.sort((a, b) => b.matchscore - a.matchscore),
            pagination: postData.pagination

        }
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
        throw Object.assign(new Error("NOT FOUND :This help request no longer exists"), {statusCode:401});
    }
     if (postExist.isClosed ===true) {
        throw Object.assign(new Error("This help request has already been closed and resolved"), {statusCode:403});
     }

     if (postExist._count.responses >= postExist.maxApplicants) {
        throw Object.assign(new Error("Application limit reached! This post cannot accept any more responders"), {statusCode:404});
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
        throw Object.assign(new Error("Target help request not found"), {statusCode:401});
    }
      if (postExist.userId !== userId) {
        throw Object.assign(new Error("Unauthorized: You can only view applications for posts created by your account"),{statusCode:404});
    }
    const responses = await getAllResponses(postId)
    return {
        postTitle:postExist.title,
        responses:responses
    }
}

//  handleApplicantStatusService
export const handleApplicantStatusService = async(payload) =>{
    const response = await getSinglePostResponse(payload.responseId)
     if (!response) {
        throw Object.assign(new Error("Application record not found"), {statusCode:401});
    }

    if (response.post.userId !== payload.userAId) {
        throw Object.assign(new Error("Unauthorized: You can only review applicants on your own posts"), {statusCode:404});
    }
    const data = {
        responseId:payload.responseId,
        action:payload.action,
        userAId:payload.userAId,
        userBId:response.userId,
        postId:response.postId
    }
    const handlePostResponseStatus = await acceptPostApplicantModel(data)
    return handlePostResponseStatus
}

//  search for specific post service
export const searchForPostService = async (userId, cursor, userInput) =>{
    const search = await searchForPostModel(userId, cursor, userInput )
    return search
}