import { createPost, getUserPost, getPersonalizedFeedService, closePostModel, deletePost } from "../models/postModel.js";
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