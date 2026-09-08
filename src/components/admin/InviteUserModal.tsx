"use client";

import { useState } from "react";
import { Mail, X, ShieldCheck, MessageSquare, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import ModalPortal from "@/components/ModalPortal";
import { motion, AnimatePresence } from "framer-motion";

export default function InviteUserModal() {
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        // Logic will be added later
        setTimeout(() => {
            setIsLoading(false);
            setIsOpen(false);
            alert("Tính năng gửi email sẽ được kết nối sau. UI đã được ghi nhận.");
        }, 1000);
    };

    return (
        <>
            <Button onClick={() => setIsOpen(true)} variant="outline">
                Tạo lời mời <Mail className="h-4 w-4" />
            </Button>

            <AnimatePresence>
                {isOpen && (
                    <ModalPortal>
                        <div className="fixed inset-0 z-[9999] bg-slate-900/60 backdrop-blur-[2px] flex items-center justify-center p-4">
                            <motion.div 
                                initial={{ opacity: 0, scale: 0.95 }} 
                                animate={{ opacity: 1, scale: 1 }} 
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="bg-white dark:bg-slate-900 w-full max-w-md shadow-2xl rounded-xl border border-border overflow-hidden"
                            >
                                <div className="px-6 py-4 border-b border-border flex items-center justify-between">
                                    <div className="space-y-0.5">
                                        <h2 className="text-base font-bold tracking-tight">Mời tài khoản</h2>
                                        <p className="text-[11px] text-muted-foreground">Gửi lời mời đăng nhập hệ thống cho nhân sự.</p>
                                    </div>
                                    <button onClick={() => setIsOpen(false)} className="text-muted-foreground hover:text-foreground transition-colors">
                                        <X size={18} />
                                    </button>
                                </div>

                                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-semibold text-foreground/70">Địa chỉ Email</label>
                                        <div className="relative">
                                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
                                            <input 
                                                required 
                                                type="email"
                                                placeholder="nhanvien@maintech.vn" 
                                                className="w-full h-9 pl-9 pr-3 bg-muted/30 border border-input rounded-md text-sm outline-none focus:ring-1 focus:ring-primary transition-all" 
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-xs font-semibold text-foreground/70">Quyền hệ thống</label>
                                        <div className="relative">
                                            <ShieldCheck className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
                                            <select className="w-full h-9 pl-9 pr-3 bg-muted/30 border border-input rounded-md text-sm outline-none cursor-pointer focus:ring-1 focus:ring-primary">
                                                <option value="NHAN_VIEN">Nhân viên thường</option>
                                                <option value="ADMIN">Quản trị viên</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-xs font-semibold text-foreground/70">Ghi chú (Tùy chọn)</label>
                                        <div className="relative">
                                            <MessageSquare className="absolute left-3 top-3 size-3.5 text-muted-foreground" />
                                            <textarea 
                                                rows={3}
                                                placeholder="Lời nhắn kèm theo lời mời..." 
                                                className="w-full pl-9 pr-3 py-2 bg-muted/30 border border-input rounded-md text-sm outline-none focus:ring-1 focus:ring-primary transition-all resize-none" 
                                            />
                                        </div>
                                    </div>

                                    <div className="pt-2 flex items-center justify-end gap-3">
                                        <Button type="button" variant="ghost" onClick={() => setIsOpen(false)} className="h-9 px-4 text-xs font-semibold">Hủy</Button>
                                        <Button type="submit" disabled={isLoading} className="h-9 px-6 bg-primary text-white text-xs font-bold uppercase tracking-wider">
                                            {isLoading ? <Loader2 className="animate-spin mr-2" size={14} /> : null}
                                            Gửi lời mời
                                        </Button>
                                    </div>
                                </form>
                            </motion.div>
                        </div>
                    </ModalPortal>
                )}
            </AnimatePresence>
        </>
    );
}
