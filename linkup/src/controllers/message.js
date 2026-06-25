import {createMessageService,
    getAllConversationService,
    getConversationMessageService,
    getLatestMessageService,
deleteMessageService,
getReceiverId } from "../services/message.js";
import { getSocketIOInstance } from "../config/socketEngine.js";
// send message controller
export const sendMessageController = async (req, res, next) => {
    try {
        const senderId = req.user.id; // Securely pulled from short-lived access token
        const { conversationId, text } = req.body;

        if (!conversationId || !text) {
            return res.status(400).json({ status: "fail", message: "conversationId and text content fields are required" });
        }

        const receiverId = await getReceiverId(conversationId, senderId)
        
        const newMessage = await createMessageService(conversationId, senderId, text);
        const io = getSocketIOInstance()
         io.to(receiverId).emit('receive_message', {
            id: newMessage.id,
            conversationId: newMessage.conversationId,
            senderId: senderId,
            text: text,
            createdAt: newMessage.createdAt
        });
        return res.status(201).json({
            status: "success",
            message: "Message delivered successfully",
            data: newMessage
        });
    } catch (error) {
       next(error)
    }
};

//  get all conversation controller
export const getAlllConversationController = async(req, res, next) =>{
    try{
        const userId = req.user.id
         const limit = parseInt(req.query.limit, 10) || 20;
        const cursor = req.query.cursor || null;
        const getConversation = await getAllConversationService(userId, limit, cursor)
        return res.status(200).json({
            status:"success",
            message:"All conversation details retrieve successfully",
            result:getConversation.allConversation.length,
            getConversation
        })
    }catch(error){
        next(error)
    }
}

//  get message controller 

export const handleGetMessages = async (req, res, next) => {
    try {
        const { conversationId } = req.params;
        const userId = req.user.id; 
        const messages = await getConversationMessageService(conversationId, userId);
        return res.status(200).json({
            status: "success",
            data: messages,
        });
    } catch (error) {
       next(error)
    }
};

//  get latest message controller
export const handleLatestMessage = async (req, res, next) => {
    try {
        const { conversationId } = req.params;
        const userId = req.user.id; 
        const messages = await getLatestMessageService(conversationId, userId);
        return res.status(200).json({
            status: "success",
            result:messages.length,
            data: messages,
        });
    } catch (error) {
        next(error)
    }
};

// delete message controller

export const handleDeleteMessage = async (req, res, next) => {
    try {
        const { messageId } = req.params;
        const userId = req.user.id; // Extracted safely from your authentication middleware
        await deleteMessageService(messageId, userId);

        return res.status(200).json({
            status: "success",
            message: "Message deleted for everyone successfully."
        });
    } catch (error) {
       next(error)
    }
};
