// src/components/UserProfileMenu.tsx
"use client";

import { useState, useRef, useEffect } from "react";
import { LogOut, User as UserIcon, Settings, ChevronDown } from "lucide-react";
import { logoutAction } from "@/actions/auth";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function UserProfileMenu({ user }: { user: any }) {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const router = useRouter();

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleLogout = async () => {
        await logoutAction();
        router.push("/login");
    };

    if (!user) return null;

    return (
        <div className="relative" ref={dropdownRef}>
            {/* NÚT AVATAR TRÊN HEADER */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-3 p-1 pr-3 rounded-full hover:bg-gray-50 transition-all active:scale-95"
            >
                <div className="w-10 h-10 rounded-full bg-premium-red flex items-center justify-center text-white font-black text-lg shadow-lg">
                    {user.name.charAt(0).toUpperCase()}
                </div>
                <div className="hidden md:block text-left">
                    <p className="text-xs font-black text-gray-800 uppercase leading-none mb-1">{user.name}</p>
                    <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">{user.role}</p>
                </div>
                <ChevronDown size={14} className={`text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* MENU SỔ XUỐNG (Z-INDEX 100 ĐỂ KHÔNG BỊ CHE) */}
            {isOpen && (
                <div className="absolute right-0 mt-3 w-56 bg-white rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.1)] border border-gray-100 z-[100] overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="p-2">
                        {/* TRANG CÁ NHÂN */}
                        <Link 
                            href={`/admin/users/${user.id}`} 
                            onClick={() => setIsOpen(false)}
                            className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-50 hover:text-premium-red drop-shadow-md transition-all"
                        >
                            <UserIcon size={16} />
                            Trang cá nhân
                        </Link>

                        {/* THIẾT LẬP (NẾU CẦN) */}
                        <div className="h-[1px] bg-gray-50 my-1 mx-2"></div>

                        {/* ĐĂNG XUẤT */}
                        <button 
                            onClick={handleLogout}
                            className="flex w-full items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-red-500 hover:bg-red-50 transition-all"
                        >
                            <LogOut size={16} />
                            Đăng xuất hệ thống
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}