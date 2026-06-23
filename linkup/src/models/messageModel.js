import { prisma } from "../config/db.js";
//  get conversation model
export const checkConversation = async (conversationId) =>{
    const conversation = await prisma.conversation.findUnique({
        where: { id: conversationId }
    });
    return conversation
}

//  create message model 
export const createMessageModel = async (conversationId, senderId,text) =>{
    return await prisma.$transaction(async(tx) =>{
        const message = await tx.message.create({
            data: {
            conversationId: conversationId,
            senderId: senderId,
            text: text
        },
        include: {
            sender: {
                select: { id: true, name: true, profileImage: true }
            }
        }
        });

        await tx.conversation.update({
            where:{
                id:conversationId
            },
            data:{
                lastMessageText:text,
                lastMessageAt: message.createdAt
            }
        });
        return message
    })
    
}

//  get all conversation model
export const getAllConversation = async (userId, limit, cursor) =>{
    const queryOptions = {
        where:{
           OR: [
                { userAId: userId },
                { userBId: userId }
            ]
        },
        include:{
            userB:{
                select:{
                    id:true,
                    name:true,
                    profileImage:true,
                }
            },
            post:{
                select:{
                    title:true
                }
            }
        },
         orderBy: [
            {
                lastMessageAt: {
                    sort: 'desc',
                    nulls: 'last' // 🚀 Keeps un-messaged/null rows cleanly at the bottom
                }
            },
            {
                createdAt: 'desc' // Secondary fallback sorting parameter
            }
        ]
    }
    if(cursor){
        queryOptions.cursor = { id: cursor };
        queryOptions.skip = 1;
    }
    const allConversation= await prisma.conversation.findMany(queryOptions);
    const hasNextPage = allConversation.length > limit;
    const paginatedPosts = hasNextPage ? allConversation.slice(0, limit) : allConversation;
    const nextCursor = hasNextPage ? paginatedPosts[paginatedPosts.length - 1].id : null;
     return {
         allConversation,
        meta: {
            nextCursor,
            hasNextPage
        }
    };
}

//  get message model 
export const getConversationMessage = async(conversationId,userId) =>{
    return await prisma.$transaction(async (tx) =>{
        await tx.message.updateMany({
            where: {
                conversationId: conversationId,
                senderId: { not: userId }, 
                isRead: false
            },
            data: { isRead: true }
        });
        
         const message = await prisma.message.findMany({
        where:{
            conversationId:conversationId,
        },
        include: {
            sender: {
                select: {
                    id: true,
                    name: true,
                    profileImage: true,
                },
            },
        },
        orderBy: {
            createdAt: "asc", 
        },
    })
    return message
    })
}

//  get latest unread mesaage
export const incomingMessage = async (conversationId, userId) =>{
    return await prisma.$transaction(async (tx) =>{
        const newMessage = await tx.message.findMany({
            where:{
                conversationId:conversationId,
                senderId:{not:userId},
                isRead:false
            },
            include:{
                sender:{
                    select:{
                        id:true,
                        name:true,
                        profileImage:true
                    }
                }
            },
            orderBy:{createdAt:"asc"}
        });
        if(newMessage.length>0){
            const messageId = newMessage.map(msg =>msg.id)
            await prisma.message.updateMany({
                where:{
                    id:{in:messageId}
                },
                data:{
                    isRead:true
                }
            })
        }
        return newMessage
    })
}

//  find message 
export const checkMessageModel = async (messageId) =>{
    return prisma.message.findUnique({
        where:{
            id:messageId
        }
    })
}
// delete message
export const deleteMessage = async(messageId, conversationId,text ) =>{
    return await prisma.message.update({
         where:{
                id:messageId
            },
            data: {
                text: "🚫 This message was deleted",
                isDelete: true
            }
    })
    // return await prisma.$transaction( async(tx) =>{
    //     const deleteMessage = await tx.message.update({
    //         where:{
    //             id:messageId
    //         },
    //         data: {
    //             text: "🚫 This message was deleted",
    //             isDelete: true
    //         }
    //     });
        //   await tx.conversation.update({
        //     where: { 
        //         id: conversationId,
        //         lastMessageText: text 
        //     },
        //     data: { 
        //         lastMessageText: "🚫 This message was deleted" 
        //     }
        // });
    // })
}