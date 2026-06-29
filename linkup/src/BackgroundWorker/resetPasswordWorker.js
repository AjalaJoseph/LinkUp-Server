import { Worker} from "bullmq"
import { redis } from "../config/redis.js"
import { sendResetPasswordOtp } from "../BackgroundJobs/sendResetPasswordOTp.js"
import { logger } from "../utils/logger.js"
export const worker = new Worker ('reset-password', async (job) =>{
      const { email, otpCode } = job.data;
    logger.info(`🔨 Background worker picked up job [${job.id}] for: ${email}`);
    try {
        await sendResetPasswordOtp(email, otpCode)
    }catch(error){
        logger.error(`❌ sendResetPasswordOtp method threw an internal error inside job [${job.id}]: ${error.message}`)
           throw error; 
    }
},
{
    connection:redis,
    concurrency:10
})
worker.on('completed', (job) => {
    logger.info(`🎉 Queue job [${job.id}] completely processed and memory slots wiped from Valkey RAM.`);
});

worker.on('failed', (job, err) => {
    logger.error(`❌ Background Job [${job?.email}] processing failure: ${err.message}`);
});