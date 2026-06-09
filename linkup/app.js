import express from 'express'
import { router } from './src/route/authRoute.js'
import cookieParser from 'cookie-parser'
import { refreshTokenRouter } from './src/route/refreshTokenRoute.js'
import { userRouter } from './src/route/userRouter.js'
import { postRouter } from './src/route/postRoute.js'
export const app = express()
app.use(express.json())
app.use(cookieParser())
app.use('/api/auth', router)
app.use('/api',refreshTokenRouter)
app.use('/api/users', userRouter)
app.use('/api', postRouter)