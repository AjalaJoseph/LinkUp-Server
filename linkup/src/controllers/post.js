import { createPostService, 
    getAllUserPostService,
    getSpecificPostService, 
    closePostService, 
    deletePostService,
    PostResponseService,
    getSinglePostService,
    getAllPostResponses } from "../services/post.js";
import { getUserDataService } from "../services/getUserService.js";
import { uploadToCloudinary } from "../services/postToCloudinary.js";
import { getSinglePost } from "../models/postModel.js";
export const postcontroller = async ( req, res) =>{
    try{
        // const {file} = req.file
    const {id} = req.user
    let postUrl = null ;
    const {title, description, state, country, city, category, tags, helpType, maxApplicant} = req.body
    if(req.file){
         const uploadPostToCloudinary = await uploadToCloudinary(req.file.buffer)
        postUrl = uploadPostToCloudinary.secure_url
    }
    const postData ={
        userId:id,
        title:title,
        description:description,
        state:state,
        country:country || null,
        city:city,
        category:category,
        tag:tags,
        helpType:helpType,
        maxApplicant:maxApplicant,
        image:postUrl|| null
    }
    
    const newPost = await createPostService(postData)

     return res.status(201).json({
            status: "success",
            message: "Post published to LinkUp feed successfully!",
            data: newPost
        });
    }
    catch(error){
         return res.status(500).json({
            status: "error",
            message: error.message || "Failed to publish your post. Server error."
        });
    }
   
}

//  get all user post controller

export const getUserPostController = async (req, res) =>{
    try{
        const { id} = req.user
        const myPosts = await getAllUserPostService(id)
         return res.status(200).json({
            status: "success",
            results: myPosts.length,
            data: myPosts
        });
    }
    catch(error){
        return res.status(500).json({ status: "error", message: error.message });
    }
}

// 
export const  getPersonalizedFeedController = async (req, res) =>{
    try{
        const { id } = req.user

        const user = await getUserDataService(id)
        const userProfile = {
            id:id,
            city: user.city,
            state:user.state,
            skills:user.skills
        }
        const postData = await getSpecificPostService(userProfile)
         return res.status(200).json({
            status: "success",
            results: postData.length,
            data: postData
        });
    }
    catch (error) {
        console.error("LinkUp Smart Feed Engine Error:", error.message);
        return res.status(500).json({ status: "error", message: "Failed to generate personalized social feed" });
    }
}

//  closePost controller

export const closePostController = async(req, res) =>{
    try{
        const userId = req.user.id
    const { postId} = req.params
    const closedPost = await closePostService(postId, userId)
     return res.status(200).json({
            status: "success",
            message: "Help request successfully closed!",
            data: closedPost
     })
    }
    catch (error) {
        console.error("Close post error:", error.message);
        let statusCode = 500;
        if (error.message.includes("Unauthorized")) statusCode = 403;
        if (error.message.includes("not found")) statusCode = 404;

        return res.status(statusCode).json({ status: "fail", message: error.message });
    }
}

export const deletePostController = async (req, res) => {
    try {
        const userId = req.user.id;   // Securely pulled from your access token guard
        const { postId } = req.params; // Extracted dynamically from the URL path parameter

        const deletedPost = await deletePostService(postId, userId);

        return res.status(200).json({
            status: "success",
            message: `The help request "${deletedPost.title}" has been permanently deleted.`
        });

    } catch (error) {
        console.error("Delete post process error:", error.message);
        
        let statusCode = 500;
        if (error.message.includes("Unauthorized")) statusCode = 403;
        if (error.message.includes("not found")) statusCode = 404;

        return res.status(statusCode).json({
            status: "fail",
            message: error.message || "Failed to delete post."
        });
    }
};

// postResponse controller
export const postResponseController = async(req,res) =>{
    try{
        const userId = req.user.id
    const { postId} = req.params
    const post = await getSinglePostService(postId)
    const postResponse = await PostResponseService(postId, userId)
    return res.status(200).json({
        status: "success",
        message: `Your offer to help with "${postResponse.post.title}" has been submitted!`,
        data: postResponse
    })
    }
    catch (error) {
        console.error("Response transaction failure:", error.message);
        let statusCode = 400;
        if (error.message.includes("limit reached") ){
            statusCode = 403;
        } 
        return res.status(statusCode).json({ status: "fail", message: error.message });
    }
}

//  get all post responses controller 
export const getPostResponseController = async(req,res) =>{
    try{
        const userId = req.user.id
        const { postId} = req.params
        
         const result = await getAllPostResponses(postId, userId);
        return res.status(200).json({
            status: "success",
            message: `Successfully retrieved applicants for "${result.postTitle}"`,
            results: result.responses.length,
            data: result.responses
        });
    }catch (error) {
        console.error("Fetch responses error:", error.message);
        
        let statusCode = 500;
        if (error.message.includes("Unauthorized")) statusCode = 403;
        if (error.message.includes("not found")) statusCode = 404;

        return res.status(statusCode).json({
            status: "fail",
            message: error.message || "Failed to retrieve applicants due to a server error."
        });
    }
}