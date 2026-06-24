import { redis } from "../config/redis.js";
import { logger } from "../utils/logger.js";
export const idempotencyKey = async (req, res, next) =>{
    const key = req.headers['idempotency-key']
    if(!key){
        return res.status(409).JSON({
            status:"fail",
            message:"Idempotency-key is required "
        })
    }

    const redisLockKey = `idempotency:${key}`;
    const LOCK_TIME_SECONDS = 180; 
     try {
        // NX: Set key only if it doesn't exist. EX: Set expiration time.
        const acquiredLock = await redis.set(redisLockKey, 'PROCESSING', 'NX', 'EX', LOCK_TIME_SECONDS);
        if (!acquiredLock) {
            const existingLockData = await redis.get(redisLockKey);
            if(existingLockData === 'PROCESSING'){
                logger.warn(`Duplicate request blocked by Idempotency Key: ${key}`);
            
            return res.status(409).json({
                status: "fail",
                message: "This request is already being processed or has completed. Duplicate blocked."
            });
            }

            if(existingLockData){
                const cachedResponse = JSON.parse(existingLockData);
                logger.info(`Serving cached response for idempotency key: ${key}`);
                 return res.status(cachedResponse.statusCode).json(cachedResponse.body);
            }
            
        }

        // Intercept the server's success response to cache it
        const originalJson = res.json;
        res.json = function (body) {
            if (res.statusCode === 200 || res.statusCode === 201) {
                // Cache the successful response body so spammed retries get the same result
                redis.set(redisLockKey, JSON.stringify({ statusCode: res.statusCode, body }), 'EX', LOCK_TIME_SECONDS);
            } else {
                redis.del(redisLockKey);
            }
            return originalJson.call(this, body);
        };

        next();
    } catch (error) {
        next(error); // Caught naturally by Express 5 and sent to your globalErrorHandler
    }
}