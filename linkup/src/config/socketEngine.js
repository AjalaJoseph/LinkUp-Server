import { Server } from 'socket.io';
import { createAdapter } from '@socket.io/redis-adapter';
import { logger } from "../utils/logger.js";
import { redis } from "../config/redis.js"; 

let io = null;

export const initSocketEngine = (server) => {
    logger.info("Initializing Real-Time Socket.io Switchboard...");
    
    const pubClient = redis;
    const subClient = pubClient.duplicate();
    
    io = new Server(server, {
        cors: {
            origin: "*",
            methods: ["GET", "POST", "PATCH", "PUT", "DELETE"],
            credentials: true
        },
        pingTimeout: 60000,  
        pingInterval: 25000, 
    });
    
    io.adapter(createAdapter(pubClient, subClient));
    logger.info("🚀 Redis Pub/Sub Real-Time Cluster Adapter Active.");
    io.on('connection', (socket) => {
        const userId = socket.handshake.query.userId;
        console.log(userId)
        if (!userId) {
            logger.warn(`Rejected socket attempt [${socket.id}]: Missing userId query parameter.`);
            return socket.disconnect(true);
        }
        logger.info(`📱 Mobile user connected: User ${userId} is live on socket thread [${socket.id}]`);

        // 🧠 PRIVATE ROOM STRATEGY: Join a virtual channel mapped directly to their user CUID
        socket.join(userId);

        // Allow joining a specific conversational thread channel room
        socket.on('join_conversation_channel', (conversationId) => {
            socket.join(conversationId);
            logger.info(`User ${userId} entered active conversation room: ${conversationId}`);
        });

        socket.on('disconnect', () => {
            logger.info(`🔌 Mobile user disconnected: User ${userId} closed socket thread [${socket.id}]`);
        });
    });
    // console.log(me)
    return io;
};

// 💡 Export helper utility to let controllers grab the socket instance on the fly
export const getSocketIOInstance = () => {
    if (!io) {
        throw new Error("Socket.io engine has not been initialized yet!");
    }
    return io;
};
