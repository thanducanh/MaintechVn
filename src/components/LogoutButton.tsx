// src/components/LogoutButton.tsx
"use client";

import { LogOut } from "lucide-react";
import { logoutAction } from "@/actions/auth";
import { useRouter } from "next/navigation";

export default function LogoutButton() {
    const router = useRouter();

    const handleLogout = async () => {
        // Gọi hàm xóa thẻ từ ở Server
        await logoutAction(); 
        // Xóa xong thì đuổi thẳng về trang Đăng nhập
        router.push("/login"); 
    };

    return (
        <button 
            onClick={handleLogout} 
            className="flex w-full items-center gap-3 px-4 py-3 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-400/10 transition-colors"
        >
            <LogOut size={20} />
            <span className="font-medium text-sm">Đăng xuất</span>
        </button>
    );
}