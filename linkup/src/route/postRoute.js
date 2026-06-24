import express from 'express'
import { verifyToken } from '../middleware/auth.js'
import { uploadImageGuard } from '../middleware/imageMiddleware.js'
import { postValidator } from '../validator/postValidator.js'
import { postcontroller,
    getUserPostController,
    getPersonalizedFeedController,
    closePostController,
    deletePostController,
    postResponseController,
    getPostResponseController,
    reviewApplicantController,
    getAllMyApplicantController,
    searchForPostController
 } from '../controllers/post.js'
export const postRouter = express.Router()
postRouter.post('/upload-post', verifyToken, uploadImageGuard, postValidator, postcontroller)
postRouter.get('/my-posts', verifyToken, getUserPostController)
postRouter.get('/all-posts',verifyToken, getPersonalizedFeedController)
postRouter.get('/my-applicants', verifyToken, getAllMyApplicantController)
postRouter.patch('/:postId/close', verifyToken, closePostController)
postRouter.delete('/:postId/remove-post', verifyToken, deletePostController)
postRouter.post('/:postId/applie', verifyToken, postResponseController)
postRouter.post('/:postId/responses', verifyToken, getPostResponseController)
postRouter.patch('/responses/:responseId/review', verifyToken, reviewApplicantController);
postRouter.get('/post-search', verifyToken, searchForPostController)


