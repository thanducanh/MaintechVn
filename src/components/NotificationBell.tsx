// src/components/NotificationBell.tsx
"use client";

import { useState, useRef, useEffect } from "react";
import { Bell, Zap, CheckCircle2, History, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation"; 
import { markAllAsReadAction, markAsReadAction } from "@/actions/notifications";
import { toast } from "sonner";

export default function NotificationBell({ unreadCount = 0, notifications = [] }: any) {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const router = useRouter();

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) setIsOpen(false);
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleNotificationClick = async (id: number, type: string) => {
        setIsOpen(false);
        await markAsReadAction(id);
        
        // Điều hướng dựa trên loại thông báo nếu cần, mặc định về admin/users
        const target = "/admin";
        router.push(target);
        router.refresh(); // Ép làm mới
    };

    const handleMarkAllRead = async () => {
        await markAllAsReadAction();
        router.refresh();
        toast.success("Đã làm sạch nhật ký!");
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button onClick={() => setIsOpen(!isOpen)} className={`p-2.5 rounded-2xl relative ${isOpen ? 'bg-red-50 text-premium-red drop-shadow-md' : 'text-gray-400 hover:text-premium-red drop-shadow-md'}`}>
                <Bell size={22} />
                {unreadCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 bg-premium-red text-white text-[9px] font-black w-4 h-4 flex items-center justify-center rounded-full border-2 border-white animate-bounce">{unreadCount}</span>
                )}
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-5 w-[420px] bg-white rounded-[2rem] shadow-[0_25px_60px_rgba(0,0,0,0.18)] border border-gray-100 z-[100] overflow-hidden">
                    <div className="px-8 py-6 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
                        <div className="flex items-center gap-2"><History size={16} className="text-premium-red drop-shadow-md" /><span className="text-[11px] font-black uppercase tracking-widest text-gray-800">Nhật ký hoạt động</span></div>
                        <Zap size={14} className="text-yellow-500 animate-pulse" />
                    </div>

                    <div className="max-h-[450px] overflow-y-auto">
                        {notifications.length > 0 ? (
                            notifications.map((item: any) => (
                                <div key={item.id} onClick={() => handleNotificationClick(item.id, item.type)} className="px-8 py-5 border-b border-gray-50 hover:bg-red-50/40 transition-all flex gap-4 items-center group cursor-pointer">
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${item.isRead ? 'bg-gray-100 text-gray-400' : 'bg-red-50 text-premium-red drop-shadow-md group-hover:bg-premium-red group-hover:text-white'}`}><CheckCircle2 size={18} /></div>
                                    <div className="flex-1 text-left">
                                        <p className={`text-sm leading-snug mb-1 ${item.isRead ? 'font-semibold text-gray-500' : 'font-black text-gray-800'}`}>{item.message}</p>
                                        <div className="flex items-center gap-2">
                                            <span className="text-[10px] text-gray-400 font-bold uppercase">{new Date(item.createdAt).toLocaleTimeString('vi-VN')}</span>
                                            {!item.isRead && <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded bg-red-100 text-premium-red drop-shadow-md">Mới</span>}
                                        </div>
                                    </div>
                                    <ArrowRight size={18} className="text-gray-300 group-hover:text-premium-red drop-shadow-md group-hover:translate-x-1 transition-all" />
                                </div>
                            ))
                        ) : (
                            <div className="py-20 text-center text-gray-300 text-xs font-bold uppercase">Hệ thống chưa có tin mới</div>
                        )}
                    </div>

                    {/* NÚT ĐÁNH DẤU TẤT CẢ (Luôn hiện nếu có thông báo) */}
                    {notifications.length > 0 && (
                        <button onClick={handleMarkAllRead} className="w-full py-5 text-[10px] font-black text-premium-red drop-shadow-md uppercase tracking-[0.25em] hover:bg-premium-red hover:text-white transition-all border-t border-gray-50 bg-white">
                            Đánh dấu xem tất cả
                        </button>
                    )}
                </div>
            )}
        </div>
    );
}