import express from 'express'
import { verifyToken } from '../middleware/auth.js'
import { uploadImageGuard } from '../middleware/imageMiddleware.js'
import { postValidator } from '../validator/postValidator.js'
import { postcontroller,
    getUserPostController,
    getPersonalizedFeedController,
    closePostController,
    deletePostController
 } from '../controllers/post.js'
export const postRouter = express.Router()
postRouter.post('/upload-post', verifyToken, uploadImageGuard, postValidator, postcontroller)
postRouter.get('/my-post', verifyToken, getUserPostController)
postRouter.get('/all-post',verifyToken, getPersonalizedFeedController)
postRouter.patch('/:postId/close', verifyToken, closePostController)
postRouter.delete('/:postId/remove-post', verifyToken, deletePostController)