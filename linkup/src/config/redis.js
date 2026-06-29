import Redis from "ioredis";
import dotenv from 'dotenv'
dotenv.config()
export const redis = new Redis({ 
    host:process.env.redis_host,
     port:process.env.redis_port,
      maxRetriesPerRequest: null,
      // connectTimeout: 5000,
      // password:process.env.redis_password,
      // tls:{
      //   rejectUnauthorized:false
      // }
    })