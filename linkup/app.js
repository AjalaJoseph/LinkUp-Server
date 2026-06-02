import express from 'express'
import { router } from './src/route/authRoute.js'
export const app = express()
app.use(express.json())
app.use('/api/auth', router)