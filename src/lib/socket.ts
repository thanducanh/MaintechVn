import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

export const getSocket = () => {
    if (!socket) {
        socket = io({
            path: "/api/socket/io",
            addTrailingSlash: false,
            autoConnect: false, // We'll connect manually
        });
    }
    return socket;
};
