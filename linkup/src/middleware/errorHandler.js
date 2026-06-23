import { logger } from "../utils/logger.js";

// Express recognizes this as an error handler because it has EXACTLY 4 arguments
export const globalErrorHandler = (err, req, res, next) => {
      const statusCode = err.statusCode || 500;
    // 1. Send the error to your Winston logger (which automatically pipes it to Sentry)
    if(statusCode === 500){
         logger.error({
        message: err.message || "An unexpected application error occurred.",
        error: err, // Captures the exact stack trace line numbers for Sentry
        body: req.body,
        params: req.params,
        query: req.query,
        meta: {
            url: req.originalUrl,
            method: req.method,
            ip: req.ip,
            userId: req.user?.id || "Unauthenticated"
        }
    });
    }
    // 3. Send a clean, uniform JSON response back to the client
    return res.status(statusCode).json({
        status: statusCode >= 500 ? "error" : "fail",
        message: statusCode >= 500 ? "Internal server error. Please try again later." : err.message
    });
};
