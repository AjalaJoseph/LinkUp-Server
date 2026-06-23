import dotenv from 'dotenv'
import { app } from './app.js'
import { logger} from "../linkup/src/utils/logger.js"
dotenv.config
const PORT = process.env.PORT || 5000
app.listen(PORT, ()=>{
    logger.info(`Server successfully listening on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode.`);
    console.log(`server running in http://localhost:${PORT}`)
})