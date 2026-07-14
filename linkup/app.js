import express from 'express'
import dotenv from "dotenv"
import helmet from "helmet"
import cors from "cors"
import { router } from './src/route/authRoute.js'
import cookieParser from 'cookie-parser'
import { refreshTokenRouter } from './src/route/refreshTokenRoute.js'
import { userRouter } from './src/route/userRouter.js'
import { postRouter } from './src/route/postRoute.js'
import { messageRouter } from './src/route/messageRoute.js'
import { globalErrorHandler } from './src/middleware/errorHandler.js'
dotenv.config()
export const app = express()
if (process.env.NODE_ENV === 'production' && process.env.BEHIND_PROXY === 'true') {
  app.set('trust proxy', 1);
  console.log('Trust proxy enabled for NGINX.');
}
const allowedOrigins = [
  'https://linkup-server', // Production Web Frontend
  'http://localhost:5173',            // Local Web Development Port
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Blocked by CORS security gate: Origin not allowed.'));
    }
  },
  credentials: true, // Crucial for mobile apps handling auth tokens or session headers
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization', 'idempotency-key',]
}));
app.use(helmet())
app.use(express.json())
app.use(cookieParser())

app.use('/api/auth', router)
app.use('/api',refreshTokenRouter)
app.use('/api/users', userRouter)
app.use('/api/posts', postRouter)
app.use("/api/message",messageRouter)
app.use(globalErrorHandler)
