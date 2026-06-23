import { redis } from "../config/redis.js";
import { rateLimit } from 'express-rate-limit';
import { logger } from "../utils/logger.js";
import { RedisStore } from 'rate-limit-redis';

export const authRateLimiter = rateLimit({
    store: new RedisStore({
        sendCommand: (...args) => redis.call(...args),
        prefix: 'rl-auth:',
    }),
    windowMs: 60 * 1000, // ⏱️ Timeframe boundary: 1 minute
    limit: 10,            // 🔒 Strict threshold: Max 5 login/signup attempts per minute
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    handler: (req, res) => {
        logger.warn(`Auth brute-force limit hit by IP: ${req.ip}`);
        return res.status(429).json({
            status: "fail",
            message: "Too many authentication attempts. Please wait 1 minute before trying again."
        });
    }
});