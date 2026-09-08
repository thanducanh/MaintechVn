"use client";

import Link from "next/link";
import { LayoutDashboard } from "lucide-react";
import { useAdminSettings } from "@/context/AdminSettingsContext";

export default function ProfileHeader() {
    const { t } = useAdminSettings();

    return (
        <div className="sticky top-0 z-30 px-1 py-4 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-slate-100 dark:border-slate-800/50 mb-8 transition-all">
            <div className="flex flex-col gap-1 max-w-[1200px] mx-auto">
                <div className="flex items-center gap-4">
                    <Link 
                        href="/admin" 
                        className="p-2 -ml-2 text-muted-foreground hover:text-foreground transition-colors"
                        title={t.common.back + " " + t.sidebar.dashboard}
                    >
                        <LayoutDashboard size={20} />
                    </Link>
                    <h1 className="text-2xl font-bold tracking-normal text-slate-900 dark:text-white">
                        {t.profile.pageTitle}
                    </h1>
                </div>
                <p className="text-xs text-muted-foreground ml-10 leading-none">
                    {t.profile.pageSubtitle}
                </p>
            </div>
        </div>
    );
}

