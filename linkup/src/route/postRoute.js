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
 import { idempotencyKey } from '../middleware/idempotency.js'
export const postRouter = express.Router()
postRouter.post('/upload-post', verifyToken,idempotencyKey, uploadImageGuard, postValidator, postcontroller)
postRouter.get('/my-posts', verifyToken, getUserPostController)
postRouter.get('/all-posts',verifyToken, getPersonalizedFeedController)
postRouter.get('/my-applicants', verifyToken, getAllMyApplicantController)
postRouter.patch('/:postId/close', verifyToken,idempotencyKey, closePostController)
postRouter.delete('/:postId/remove-post', verifyToken, deletePostController)
postRouter.post('/:postId/apply', verifyToken,idempotencyKey, postResponseController)
postRouter.post('/:postId/responses', verifyToken, getPostResponseController)
postRouter.patch('/responses/:responseId/review', verifyToken,idempotencyKey, reviewApplicantController);
postRouter.get('/search-post', verifyToken, searchForPostController)


