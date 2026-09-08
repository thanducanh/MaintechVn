// src/components/SessionGuard.tsx
"use client";

import { useEffect } from "react";
import { logoutAction } from "@/actions/auth"; // Đảm bảo Anh có hàm logout này

export default function SessionGuard() {
    useEffect(() => {
        // Hàm này sẽ chạy khi Anh đóng Tab hoặc đóng Trình duyệt
        const handleUnload = () => {
            // Dùng navigator.sendBeacon để ép gửi lệnh Logout về Server 
            // kể cả khi Tab đã đóng
            fetch("/api/auth/logout", { method: "POST", keepalive: true });
        };

        window.addEventListener("beforeunload", handleUnload);
        
        return () => {
            window.removeEventListener("beforeunload", handleUnload);
        };
    }, []);

    return null; // Linh kiện này không hiển thị gì cả
}