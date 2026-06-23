import express from 'express'
import { verifyToken } from '../middleware/auth.js'
import { getAlllConversationController,
    sendMessageController,
    handleGetMessages,
    handleLatestMessage,
    handleDeleteMessage
 } from '../controllers/message.js'
 import { messageValidator } from '../validator/messageValidator.js'
export const messageRouter = express.Router()
messageRouter.post('/send-message', verifyToken, messageValidator, sendMessageController)
messageRouter.get('/get-conversations', verifyToken, getAlllConversationController)
messageRouter.get("/:conversationId/get-message", verifyToken, handleGetMessages);
messageRouter.get("/:conversationId/latest-message", verifyToken, handleLatestMessage)
messageRouter.patch("/:messageId/delete-message",verifyToken, handleDeleteMessage)