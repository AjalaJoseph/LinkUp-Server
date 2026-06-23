import { createLogger, format, transports } from 'winston';
import Transport from 'winston-transport';
import * as Sentry from '@sentry/node';
import dotenv from "dotenv"
dotenv.config()
const { combine, timestamp, json, colorize, simple } = format;

// 1. Initialize Sentry instantly on boot

if (process.env.SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV || 'development',
    release: "linkup-backend@1.0.0", 
    tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
    debug:false
  });
}

// Your excellent sanitization logic that ONLY targets user input fields
const sanitizeSecrets = format((info) => {
  const redact = (obj) => {
    if (!obj || typeof obj !== 'object') return;
    for (let key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        if (typeof obj[key] === 'object' && obj[key] !== null) {
          redact(obj[key]);
        } else if (key.toLowerCase().includes('password') || key.toLowerCase() === 'token') {
          obj[key] = '[REDACTED]';
        }
      }
    }
  };

  if (info.body && typeof info.body === 'object') {
    info.body = JSON.parse(JSON.stringify(info.body));
    redact(info.body);
  }
  if (info.params && typeof info.params === 'object') {
    info.params = JSON.parse(JSON.stringify(info.params));
    redact(info.params);
  }
  if (info.query && typeof info.query === 'object') {
    info.query = JSON.parse(JSON.stringify(info.query));
    redact(info.query);
  }

  return info;
});

// 2. Custom Transport to pipe Winston errors into Sentry
class SentryTransport extends Transport {
  constructor(opts) {
    super(opts);
    this.level = opts.level || 'error'; 
  }

  log(info, callback) {
    setImmediate(() => this.emit('logged', info));

    // Capture exceptions for true Error objects or text logs matching the level
    if (info.level === 'error') {
      const errorObject = info.error instanceof Error ? info.error : new Error(info.message);
      
      Sentry.captureException(errorObject, {
        extra: {
          timestamp: info.timestamp,
          body: info.body || null,
          params: info.params || null,
          query: info.query || null,
          meta: info.meta || null
        }
      });
    }
    callback();
  }
}

// 3. Core Logger Initialization
export const logger = createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: combine(
    sanitizeSecrets(), // Runs first, ensuring Sentry receives clean, redacted data arrays
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    json()
  ),
  transports: [
    new transports.File({ filename: 'logs/error.log', level: 'error' }),
    new transports.File({ filename: 'logs/combined.log' }),
    
    // 🔥 New Production Sentry Pipeline Addition
    new SentryTransport({ level: 'error' })
  ],
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new transports.Console({
    format: combine(
      colorize(),
      simple()
    )
  }));
}
