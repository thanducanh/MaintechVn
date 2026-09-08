"use client";

import { useState } from "react";
import { Bell, Search, Filter, Mail, ShieldCheck, CreditCard, Calendar, Info, Clock, CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function NotificationsTab({ user }: { user: any }) {
    const [filter, setFilter] = useState("all");
    
    // In a real app, this would be fetched from the backend.
    // Data isolation: only show notifications for the current user.
    const notifications: any[] = []; // Empty state for now

    const filters = [
        { id: "all", label: "Táº¥t cáº£" },
        { id: "company", label: "CÃ´ng ty" },
        { id: "personal", label: "CÃ¡ nhÃ¢n" },
        { id: "system", label: "Há»‡ thá»‘ng" },
    ];

    return (
        <div className="w-full space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">ThÃ´ng bÃ¡o</h3>
                    <p className="text-xs text-slate-500 mt-1">Xem cÃ¡c cáº­p nháº­t má»›i nháº¥t tá»« cÃ´ng ty vÃ  há»‡ thá»‘ng.</p>
                </div>
                <Button variant="ghost" className="text-[10px] font-bold text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-500/10">
                    ÄÃ¡nh dáº¥u táº¥t cáº£ Ä‘Ã£ Ä‘á»c
                </Button>
            </div>

            {/* Filters */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
                {filters.map((f) => (
                    <button
                        key={f.id}
                        onClick={() => setFilter(f.id)}
                        className={cn(
                            "px-4 py-2 rounded-full text-xs font-bold transition-all whitespace-nowrap border",
                            filter === f.id 
                                ? "bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-600/20" 
                                : "bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-500 hover:border-slate-300"
                        )}
                    >
                        {f.label}
                    </button>
                ))}
            </div>

            {/* Notifications List */}
            <div className="space-y-4">
                {notifications.length === 0 ? (
                    <div className="py-24 flex flex-col items-center justify-center text-center space-y-4 bg-white dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm w-full">
                        <div className="size-16 rounded-full bg-slate-50 dark:bg-slate-900 flex items-center justify-center text-slate-300">
                            <Bell size={32} />
                        </div>
                        <div className="space-y-1">
                            <h4 className="text-sm font-bold text-slate-900 dark:text-white">ChÆ°a cÃ³ thÃ´ng bÃ¡o nÃ o</h4>
                            <p className="text-xs text-slate-500 max-w-[280px]">
                                Khi cÃ³ thÃ´ng bÃ¡o má»›i vá» cÃ´ng viá»‡c, lÆ°Æ¡ng hay há»‡ thá»‘ng, chÃºng sáº½ xuáº¥t hiá»‡n táº¡i Ä‘Ã¢y.
                            </p>
                        </div>
                    </div>
                ) : (
                    // Notification cards would go here
                    null
                )}
            </div>

            {/* Info Box */}
            <div className="p-5 rounded-2xl bg-blue-50/30 dark:bg-blue-500/5 border border-blue-100/50 dark:border-blue-500/10 flex items-start gap-4">
                <Info size={18} className="text-blue-500 shrink-0 mt-0.5" />
                <div className="space-y-1">
                    <p className="text-[10px] font-bold text-blue-700 dark:text-blue-400 uppercase tracking-wider">LÆ°u Ã½ báº£o máº­t</p>
                    <p className="text-[10px] text-blue-600 dark:text-blue-400 leading-relaxed italic">
                        Dá»¯ liá»‡u thÃ´ng bÃ¡o Ä‘Æ°á»£c cÃ¡ nhÃ¢n hÃ³a hoÃ n toÃ n. Báº¡n chá»‰ nháº­n Ä‘Æ°á»£c cÃ¡c thÃ´ng bÃ¡o liÃªn quan Ä‘áº¿n tÃ i khoáº£n, cÃ´ng viá»‡c cá»§a mÃ¬nh hoáº·c cÃ¡c thÃ´ng bÃ¡o chung tá»« Ban GiÃ¡m Äá»‘c.
                    </p>
                </div>
            </div>
        </div>
    );
}

