import express from 'express'
import { registerController, loginController, updateProfitController } from '../controllers/authController.js'
import { registerValidator, validateRegisterInput, loginValidator, validateLoginInput, updateProfileValidator } from '../validator/authValidator.js'
import { verifyToken } from '../middleware/auth.js'
export const router = express.Router()
router.post('/register', registerValidator, validateRegisterInput, registerController)
router.post('/login', loginValidator,validateLoginInput,loginController)
router.patch('/update-profile',verifyToken, updateProfileValidator, updateProfitController)