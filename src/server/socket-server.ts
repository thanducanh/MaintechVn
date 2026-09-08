import { Server as NetServer } from "http";
import { Server as SocketIOServer } from "socket.io";
import os from "os";

export function initSocket(server: NetServer) {
    const io = new SocketIOServer(server, {
        path: "/api/socket/io",
        addTrailingSlash: false,
        cors: {
            origin: "*",
            methods: ["GET", "POST"],
        },
    });

    // Memory cache for presence
    const onlineUsers = new Map<string, { sockets: Set<string>; lastSeenAt: string | null }>();
    const socketToUser = new Map<string, string>();

    io.on("connection", (socket) => {
        console.log("🟢 Socket connected:", socket.id);

        // 1. User Presence & Notifications Room
        socket.on("join_user", (data) => {
            if (data?.userId) {
                const userIdStr = String(data.userId);
                socket.join(`user:${userIdStr}`);
                
                if (data.role) {
                    socket.join(`role:${data.role}`);
                }
                
                // Track presence
                socketToUser.set(socket.id, userIdStr);
                let userPresence = onlineUsers.get(userIdStr);
                if (!userPresence) {
                    userPresence = { sockets: new Set(), lastSeenAt: null };
                    onlineUsers.set(userIdStr, userPresence);
                }
                const wasOffline = userPresence.sockets.size === 0;
                userPresence.sockets.add(socket.id);
                
                if (wasOffline) {
                    io.emit("presence:update", { userId: data.userId, isOnline: true, lastSeenAt: null });
                }

                console.log(`👤 User ${userIdStr} joined their personal & role rooms`);
            }
        });

        // 2. Chat Conversation Room
        socket.on("join_conversation", (conversationId) => {
            if (conversationId) {
                socket.join(`conversation:${conversationId}`);
                console.log(`💬 Socket ${socket.id} joined conversation:${conversationId}`);
            }
        });

        socket.on("leave_conversation", (conversationId) => {
            if (conversationId) {
                socket.leave(`conversation:${conversationId}`);
            }
        });

        // 3. Message Broadcasting
        socket.on("send_message", (data) => {
            // data should be the full message object returned from DB
            if (data?.conversationId) {
                // Broadcast to conversation room (excluding sender's current socket tab, but to their other tabs)
                socket.to(`conversation:${data.conversationId}`).emit("message:new", data);
            }

            // Also trigger generic notification if there are specific receivers
            if (data?.participants && Array.isArray(data.participants)) {
                data.participants.forEach((participantId: number | string) => {
                    if (participantId !== data.senderId) {
                        socket.to(`user:${participantId}`).emit("notification", {
                            type: "CHAT_MESSAGE",
                            message: data
                        });
                    }
                });
            } else if (data?.receiverId) {
                socket.to(`user:${data.receiverId}`).emit("notification", {
                    type: "CHAT_MESSAGE",
                    message: data
                });
            }
        });

        // 4. Typing Indicator
        socket.on("typing:start", (data) => {
            if (data?.conversationId) {
                socket.to(`conversation:${data.conversationId}`).emit("typing:start", data);
            }
        });

        socket.on("typing:stop", (data) => {
            if (data?.conversationId) {
                socket.to(`conversation:${data.conversationId}`).emit("typing:stop", data);
            }
        });

        // Message statuses
        socket.on("message:delivered", (data) => {
            if (data?.conversationId) {
                socket.to(`conversation:${data.conversationId}`).emit("message:delivered", data);
            }
        });

        socket.on("message:read", (data) => {
            if (data?.conversationId) {
                socket.to(`conversation:${data.conversationId}`).emit("message:read", data);
            }
        });

        // Conversation list update hint
        socket.on("conversation:updated", (data) => {
            if (data?.participantIds && Array.isArray(data.participantIds)) {
                data.participantIds.forEach((pid: any) => {
                    socket.to(`user:${pid}`).emit("conversation:updated", data);
                });
            }
        });

        // 5. General System Notifications
        socket.on("send_system_notification", (data) => {
            if (data.targetUserId) {
                socket.to(`user:${data.targetUserId}`).emit("notification", data);
            } 
            if (data.targetRoles && Array.isArray(data.targetRoles)) {
                data.targetRoles.forEach((role: string) => {
                    socket.to(`role:${role}`).emit("notification", data);
                });
            }
        });

        socket.on("disconnect", () => {
            console.log("🔴 Socket disconnected:", socket.id);
            const userIdStr = socketToUser.get(socket.id);
            if (userIdStr) {
                const userPresence = onlineUsers.get(userIdStr);
                if (userPresence) {
                    userPresence.sockets.delete(socket.id);
                    if (userPresence.sockets.size === 0) {
                        userPresence.lastSeenAt = new Date().toISOString();
                        // Also could update DB here asynchronously
                        io.emit("presence:update", { 
                            userId: Number(userIdStr), 
                            isOnline: false, 
                            lastSeenAt: userPresence.lastSeenAt 
                        });
                    }
                }
                socketToUser.delete(socket.id);
            }
        });

        // 6. Admin Monitoring Room
        socket.on("join_monitoring", () => {
            // You can add permission check here if needed
            socket.join("admin:monitoring");
            console.log(`📊 Socket ${socket.id} joined admin:monitoring`);
        });
        
        socket.on("leave_monitoring", () => {
            socket.leave("admin:monitoring");
        });
    });

    // 7. Server Health Heartbeat (Every 15s)
    setInterval(() => {
        try {
            const memUsage = process.memoryUsage();
            const freeMem = os.freemem();
            const totalMem = os.totalmem();
            // Optional: simple CPU % calculation (can be complex in node, so we use loadavg as fallback, though it returns 0 on Windows)
            const loadavg = os.loadavg(); 

            io.to("admin:monitoring").emit("server_health", {
                activeConnections: io.engine.clientsCount,
                uptime: process.uptime(),
                memory: {
                    heapUsed: memUsage.heapUsed,
                    heapTotal: memUsage.heapTotal,
                    freeMem,
                    totalMem
                },
                cpuLoadAvg: loadavg,
                platform: os.platform()
            });
        } catch (e) {
            // Ignore error so Windows dev environment doesn't crash
        }
    }, 15000);

    return io;
}
