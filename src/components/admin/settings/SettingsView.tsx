"use client";

import { useState } from "react";
import { User, ShieldCheck, Settings, Bell } from "lucide-react";
import { cn } from "@/lib/utils";
import ProfileTab from "./ProfileTab";
import AccountTab from "./AccountTab";
import InterfaceTab from "./InterfaceTab";
import NotificationsTab from "./NotificationsTab";

import { useAdminSettings } from "@/context/AdminSettingsContext";

interface SettingsViewProps {
    user: any;
}

export default function SettingsView({ user }: SettingsViewProps) {
    const { t } = useAdminSettings();
    const [activeTab, setActiveTab] = useState("profile");

    const navItems = [
        { id: "profile", label: t?.profile?.tabs?.personalInfo || t?.profile?.personalInfo || "ThÃ´ng tin cÃ¡ nhÃ¢n", icon: User },
        { id: "notifications", label: t?.profile?.tabs?.notifications || t?.profile?.notifications || "ThÃ´ng bÃ¡o", icon: Bell },
        { id: "account", label: t?.profile?.tabs?.accountSecurity || t?.profile?.accountSecurity || "TÃ i khoáº£n & Báº£o máº­t", icon: ShieldCheck },
        { id: "appearance", label: t?.profile?.tabs?.settings || t?.profile?.settings || "CÃ i Ä‘áº·t", icon: Settings },
    ];

    return (
        <div className="mx-auto w-full max-w-[1180px] animate-in fade-in duration-500">
            {/* 
                FORCED FIXED GRID SYSTEM 
                Sidebar: 260px
                Gap: 40px (gap-10)
                Content: 760px
                Total: 1060px + margin
            */}
            <div className="grid grid-cols-1 lg:grid-cols-[260px_760px] gap-10 items-start justify-start">
                
                {/* Sidebar */}
                <aside className="w-full lg:w-[260px] shrink-0 lg:sticky lg:top-[100px]">
                    <nav className="flex flex-col gap-1">
                        {navItems.map((item) => (
                            <button
                                key={item.id}
                                onClick={() => setActiveTab(item.id)}
                                className={cn(
                                    "relative flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-all group overflow-hidden border-none outline-none ring-0",
                                    activeTab === item.id
                                        ? "bg-slate-100 dark:bg-slate-800 text-slate-950 dark:text-white font-semibold"
                                        : "text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800/40 hover:text-slate-900 dark:hover:text-white font-medium"
                                )}
                            >
                                {activeTab === item.id && (
                                    <div className="absolute left-0 top-2 bottom-2 w-1 bg-red-600 rounded-full" />
                                )}
                                <item.icon 
                                    size={18} 
                                    className={cn(
                                        "transition-colors shrink-0",
                                        activeTab === item.id ? "text-red-600" : "text-slate-400 group-hover:text-slate-600"
                                    )} 
                                />
                                <span className="truncate">{item.label}</span>
                            </button>
                        ))}
                    </nav>
                </aside>

                {/* Content Section */}
                <div className="flex-1 w-full max-w-full pb-20 overflow-hidden">
                    <div className="w-full">
                        {activeTab === "profile" && <ProfileTab user={user} />}
                        {activeTab === "account" && <AccountTab user={user} />}
                        {activeTab === "appearance" && <InterfaceTab />}
                        {activeTab === "notifications" && <NotificationsTab user={user} />}
                    </div>
                </div>

            </div>
        </div>
    );
}

