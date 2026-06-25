import { createPostService, 
    getAllUserPostService,
    getSpecificPostService, 
    closePostService, 
    deletePostService,
    PostResponseService,
    getSinglePostService,
    getAllPostResponses,
    handleApplicantStatusService,
    searchForPostService
     } from "../services/post.js";
import { getUserDataService } from "../services/getUserService.js";
import { uploadToCloudinary } from "../services/postToCloudinary.js";
import { getSinglePost ,getAllMyApplicant, getSinglePostResponse} from "../models/postModel.js";
import { getSocketIOInstance } from "../config/socketEngine.js";
export const postcontroller = async ( req, res, next) =>{
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
    const io = getSocketIOInstance()
    io.emit('new_post_published', {
            message: `A new ${helpType.toLowerCase()} post was just published in your area!`,
            post: newPost
        });
     return res.status(201).json({
            status: "success",
            message: "Post created and published successfully.",
            data: newPost
        });
    }
    catch(error){
        next(error)
    }
   
}

//  get all user post controller

export const getUserPostController = async (req, res, next) =>{
    try{
        const { id} = req.user
       const page = Math.max(1, parseInt(req.query.page, 10) || 1);
        const limit = Math.max(1, parseInt(req.query.limit, 10) || 10);
        const myPosts = await getAllUserPostService(id, page, limit)
         return res.status(200).json({
            status: "success",
            results: myPosts.myPosts.length,
            data: myPosts.myPosts,
            pagination:myPosts.pagination
        });
    }
    catch(error){
        next(error)
    }
}

// 
export const  getPersonalizedFeedController = async (req, res, next) =>{
    try{
        const { id } = req.user
         const limit = parseInt(req.query.limit, 10) || 20;
        const cursor = req.query.cursor || null;
        const user = await getUserDataService(id)
        const userProfile = {
            id:id,
            city: user.city,
            state:user.state,
            skills:user.skills,
            limit:limit,
            cursor:cursor
        }
        const postData = await getSpecificPostService(userProfile)
         return res.status(200).json({
            status: "success",
            results: postData.data.length,
            data: postData.data,
            pagination:postData.pagination
            
        });
    }
    catch (error) {
        next(error)
    }
}

//  closePost controller

export const closePostController = async(req, res, next) =>{
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
       next(error)
    }
}

export const deletePostController = async (req, res, next) => {
    try {
        const userId = req.user.id;   // Securely pulled from your access token guard
        const { postId } = req.params; // Extracted dynamically from the URL path parameter

        const deletedPost = await deletePostService(postId, userId);

        return res.status(200).json({
            status: "success",
            message: `The help request "${deletedPost.title}" has been permanently deleted.`
        });

    } catch (error) {
        next(error)
    }
};

// postResponse controller
export const postResponseController = async(req, res, next) =>{
    try{
        const userId = req.user.id
    const { postId} = req.params
    const post = await getSinglePostService(postId)
    const postResponse = await PostResponseService(postId, userId)
    const io = getSocketIOInstance()
    io.to(post.userId).emit('new_responder_applied', {
        postId:postId,
        message: `user id ${req.user.id} has just applied to your post: "${post.title}"`,
         data: postResponse
    })
    return res.status(200).json({
        status: "success",
        message: `Your offer to help with "${postResponse.post.title}" has been submitted!`,
        data: postResponse
    })
    }
    catch (error) {
        next(error)
    }
}

//  get all post responses controller 
export const getPostResponseController = async(req,res, next) =>{
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
       next(error)
    }
}

// reviewApplicantController
export const reviewApplicantController = async (req, res, next) => {
    try{
        const userAId = req.user.id
        const {responseId} = req.params
        const {action} = req.body
        if (!action || !['ACCEPTED', 'REJECTED'].includes(action)) {
            return res.status(400).json({ 
                status: "fail", 
                message: "Invalid action. Please specify 'ACCEPTED' or 'REJECTED' in uppercase." 
            });
        }
        const payload= {
            responseId:responseId,
            action:action,
            userAId:userAId
        }

         const updatedApplication = await handleApplicantStatusService(payload); 
        const customMessage = action === 'ACCEPTED' 
            ? "Applicant accepted! A secure chat channel has been unlocked."
            : "Applicant has been successfully declined.";
              const appliedId = await getSinglePostResponse(responseId)
             const io =  getSocketIOInstance()
                io.to(appliedId.userId).emit('application_status_update', {
                    postId: updatedApplication.postId,
                    status: action,
                    message:customMessage
                })
        return res.status(200).json({
            status: "success",
            message: customMessage,
            data: updatedApplication
        });
    } catch (error) {
        next(error)
    }
}

//  get all applicant 
export const getAllMyApplicantController = async (req, res, next) =>{
    try{
        const userId = req.user.id
       const page = Math.max(1, parseInt(req.query.page, 10) || 1);
        const limit = Math.max(1, parseInt(req.query.limit, 10) || 10);
        const applicant = await getAllMyApplicant(userId, page,limit)
        return res.status(200).json({
            status:"success",
            message:"Application retrieve successfully",
            result:applicant.myApplication.length,
            data:applicant.myApplication,
            pagination:applicant.pagination
        })
    }catch(error){
       next(error)
    }
}

//  search for specific post controller 
export const searchForPostController = async (req, res, next) =>{
    try{
        const userId = req.user.id
        const cursor = req.query.cursor || null;
         const userInput = req.query.query || ""; 
        const result = await searchForPostService(userId, cursor, userInput)
         return res.status(200).json({
            status: "success",
            result: result.posts.length,
            data: result.posts,
            meta: result.meta
        });

    }catch(error){
        next(error)
    }
}