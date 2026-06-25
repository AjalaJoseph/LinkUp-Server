import { createMessageModel,
    checkConversation,
    getAllConversation,
    getConversationMessage,
    incomingMessage,
    checkMessageModel,
    deleteMessage,
 } from "../models/messageModel.js";
//  create message service 
export const createMessageService = async (conversationId, senderId, text) =>{
    const conversationExist = await checkConversation(conversationId)
    if (!conversationExist) {
        throw Object.assign(new Error("Chat conversation room not found"), {statusCode:404});
    }

    if (conversationExist.userAId !== senderId && conversationExist.userBId !== senderId) {
        throw Object.assign(new Error("Unauthorized: You are not a participant in this conversation channel"), {statusCode:403});
    }

    const insertMessage = await createMessageModel(conversationId,senderId,text)
    return insertMessage
}
// get receiver id from conversationn table
export const getReceiverId = async (conversationId, senderId)=>{
    const conversation = await checkConversation(conversationId)
    if (!conversationExist) {
        throw Object.assign(new Error("Chat conversation room not found"), {statusCode:404});
    }
    const receiverId =senderId === conversation.userAId ? conversation.userBId : conversation.userAId;
    return receiverId
}
//  get all conversation services

export const getAllConversationService = async (userId, limit, cursor) =>{
    const converse = await getAllConversation(userId, limit, cursor)
    return converse
}

//  get message service 
export const getConversationMessageService = async (conversationId, userId) =>{
    const conversationExist = await checkConversation(conversationId)
    if (!conversationExist) {
        throw Object.assign(new Error("NOT FOUND"), {statusCode:404});
    }

     if (conversationExist.userAId !== userId && conversationExist.userBId !== userId) {
        throw Object.assign(new Error("UNAUTHORIZED"), {statusCode:403});
    }
    const getMessage = await getConversationMessage(conversationId, userId)
    return getMessage
}

//  get latest message or message polling service 
export const getLatestMessageService = async (conversationId, userId) =>{
    const conversationExist = await checkConversation(conversationId)
    if (!conversationExist) {
        throw Object.assign(new Error("NOT FOUND"), {statusCode:404});
    }

     if (conversationExist.userAId !== userId && conversationExist.userBId !== userId) {
        throw Object.assign(new Error("UNAUTHORIZED"), {statusCode:403});
    }
    const getMessage = await incomingMessage(conversationId, userId)
    return getMessage
}

//  delete message service 
export const deleteMessageService = async (messageId, userId)=> {
    const message = await checkMessageModel(messageId)
    if (!message) {
         throw Object.assign(new Error("NOT FOUND"), {statusCode:404});
    }
     if (message.senderId !== userId) {
            throw Object.assign(new Error("UNAUTHORIZED"), {statusCode:403});
        }
        const conversationId = message.conversationId
        const text = message.text
        console.log(message)
        const clearMessage = await deleteMessage(messageId, conversationId, text)
        return clearMessage
}