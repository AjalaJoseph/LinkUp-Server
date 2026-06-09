import express from 'express'
import { verifyToken } from '../middleware/auth.js'
import { getUserControlller } from '../controllers/getUserController.js'
export const userRouter = express.Router()
userRouter.get('/me', verifyToken, getUserControlller)    