import dotenv from 'dotenv'
import http from "http"
import { initSocketEngine } from './src/config/socketEngine.js'
import { app } from './app.js'
import { logger} from "../linkup/src/utils/logger.js"
import { worker } from './src/BackgroundWorker/resetPasswordWorker.js'
dotenv.config
const PORT = process.env.PORT || 5000
const server = http.createServer(app)
initSocketEngine(server)
server.listen(PORT, ()=>{
    logger.info(`Server successfully listening on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode.`);
    console.log(`server running in http://localhost:${PORT}`)
})