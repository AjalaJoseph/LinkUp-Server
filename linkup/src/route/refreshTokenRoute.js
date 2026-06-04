import express from 'express'
import { refreshTokenController } from '../controllers/authController.js'
import { verifyRefreshToken } from '../middleware/auth.js'
export const refreshTokenRouter = express.Router()
refreshTokenRouter.post('/refreshToken',verifyRefreshToken, refreshTokenController)