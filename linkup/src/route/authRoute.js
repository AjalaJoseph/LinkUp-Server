import express from 'express'
import { 
    registerController,
     loginController, 
     updateProfitController, 
     uploadProfileImageController, 
     logoutController,
    changePasswordController } from '../controllers/authController.js'
import { 
    registerValidator,
     validateRegisterInput, 
     loginValidator, 
     validateLoginInput, 
     updateProfileValidator,
    changePasswordValidator } from '../validator/authValidator.js'
import { authRateLimiter } from '../middleware/rateLimit.js'
import { verifyToken } from '../middleware/auth.js'
import { uploadImageGuard } from '../middleware/imageMiddleware.js'
export const router = express.Router()
router.post('/register', registerValidator, validateRegisterInput, registerController)
router.post('/login', authRateLimiter, loginValidator,validateLoginInput,loginController)
router.post('/logout', verifyToken, logoutController )
router.patch('/update-profile',verifyToken, updateProfileValidator, updateProfitController)
router.post('/upload-profile-image', verifyToken,uploadImageGuard,uploadProfileImageController)
router.patch('/change-password',authRateLimiter, verifyToken, changePasswordValidator, changePasswordController)