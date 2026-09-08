// ðŸ“ File: src/app/admin/AdminInnerLayout.tsx
"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import Sidebar from "@/components/admin/Sidebar";
import NotificationCenter from "@/components/admin/NotificationCenter";

import { 
  SidebarProvider, 
  SidebarInset, 
  SidebarTrigger 
} from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { ThemeProvider, useTheme } from "@/context/ThemeContext";
import { LayoutProvider, useLayout } from "@/context/LayoutContext";
import { AdminSettingsProvider, useAdminSettings } from "@/context/AdminSettingsContext";
import { ThemeCustomizer } from "@/components/admin/ThemeCustomizer";
import { ThemeSwitch } from "@/components/admin/ThemeSwitch";
import { cn } from "@/lib/utils";
import { translateSystemLabel } from "@/lib/translations";
import { ExternalLink, Search, UserCircle, Menu } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

function AdminInnerLayoutContent({ 
    children, 
    currentUser 
}: { 
    children: React.ReactNode; 
    currentUser: any; 
}) {
    const pathname = usePathname();
    const { variant, layout } = useLayout();
    const { t, language } = useAdminSettings();

    useEffect(() => {
        const ping = () => {
            if (document.visibilityState === "hidden") return;
            
        };

        ping();
        const interval = setInterval(ping, 300000);

        return () => {
            clearInterval(interval);
        };
    }, [pathname, currentUser]);

    const getPageTitle = () => {
        if (pathname.includes("/admin/cms/articles")) return t.sidebar.websiteArticles;
        if (pathname.includes("/admin/cms/products")) return t.sidebar.websiteProducts;
        if (pathname.includes("/admin/cms/services")) return t.sidebar.websiteServices;
        if (pathname.includes("/admin/cms/about")) return t.sidebar.websiteAbout;
        if (pathname.includes("/admin/cms/homepage")) return t.sidebar.websiteHome;
        if (pathname.includes("/admin/cms/contact")) return t.sidebar.websiteContact;
        if (pathname.includes("/admin/cms/inquiries")) return "LiÃªn há»‡ & Cuá»™c gá»i";
        if (pathname.includes("/admin/cms")) return translateSystemLabel("website", language);
        
        if (pathname.includes("/admin/monitoring")) return "Thá»‘ng kÃª truy cáº­p";
        if (pathname.includes("/admin/profile")) return t.profile.pageTitle;
        if (pathname.includes("/admin/settings")) return t.sidebar.settings;
        
        return translateSystemLabel("dashboard", language);
    };

    return (
        <SidebarProvider defaultOpen={layout !== 'compact'}>
            <div className={cn(
                "flex min-h-screen h-auto w-full bg-gray-50 text-foreground transition-colors duration-300 dark:bg-slate-950 lg:h-screen"
            )}>
                <Sidebar currentUser={currentUser} variant={variant} />
                
                <SidebarInset className={cn(
                    "flex min-h-screen flex-col overflow-visible border-border bg-gray-50 transition-all duration-300 dark:bg-slate-950 lg:min-h-0 lg:h-full lg:overflow-hidden",
                    variant === 'inset' ? "m-2 rounded-xl" : ""
                )}>
                    {/* Modern dashboard header */}
                    <header className="sticky top-0 z-50 flex min-h-20 shrink-0 items-center justify-between gap-4 bg-slate-50/90 px-4 py-3 backdrop-blur-md dark:bg-slate-950/90 sm:px-6 lg:px-8">
                        <div className="flex min-w-0 items-center gap-3">
                            <SidebarTrigger className="h-10 w-10 shrink-0 rounded-full border border-slate-200 bg-white text-slate-600 shadow-sm transition-all hover:bg-slate-100 hover:text-slate-900 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white" />
                            <Separator orientation="vertical" className="hidden h-5 border-border sm:block" />
                            <div className="min-w-0">
                                <p className="hidden truncate text-xs font-medium text-slate-400 sm:block">Pages /</p>
                                <h2 className="truncate text-base font-bold tracking-tight text-slate-900 dark:text-white sm:text-lg">{getPageTitle()}</h2>
                            </div>
                        </div>

                        <div className="flex w-fit max-w-full shrink-0 items-center gap-1 overflow-visible rounded-full border border-slate-200 bg-white/95 p-1.5 shadow-[0_4px_20px_rgba(15,23,42,0.06)] dark:border-slate-800 dark:bg-slate-900/95 sm:gap-2 sm:px-2">
                            <label className="relative hidden sm:block">
                                <span className="sr-only">Search</span>
                                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                                <input aria-label="Search" placeholder="Search..." className="h-10 w-40 rounded-full bg-slate-50 pl-9 pr-3 text-sm text-slate-700 outline-none transition focus:bg-white focus:ring-2 focus:ring-indigo-100 dark:bg-slate-800 dark:text-slate-200 dark:focus:bg-slate-800 lg:w-56" />
                            </label>
                            <button aria-label="Search" className="flex h-10 w-10 items-center justify-center rounded-full text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 sm:hidden dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"><Search className="h-4 w-4" /></button>
                            <a href="/" target="_blank" rel="noopener noreferrer" aria-label="Má»Ÿ website chÃ­nh" title="Má»Ÿ website chÃ­nh" className="flex h-10 items-center gap-1.5 rounded-full px-3 text-xs font-semibold text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white">
                                <ExternalLink className="h-4 w-4" />
                                <span className="hidden lg:inline">Xem website</span>
                            </a>
                            <NotificationCenter />
                            <ThemeSwitch />
                            <ThemeCustomizer />
                            <div className="mx-1 hidden h-6 w-px bg-slate-200 dark:bg-slate-700 sm:block" />
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <button aria-label="Má»Ÿ menu tÃ i khoáº£n" className="flex items-center gap-3 p-1 transition hover:text-slate-900 dark:hover:text-white">
                                        <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border-2 border-white bg-indigo-100 text-indigo-700 shadow-sm dark:border-slate-700 dark:bg-indigo-950 dark:text-indigo-300">
                                            {currentUser?.avatar ? <img src={currentUser.avatar} alt="Admin avatar" className="h-full w-full object-cover" /> : <UserCircle className="h-6 w-6" />}
                                        </div>
                                <div className="hidden shrink-0 text-left leading-tight md:block">
                                            <p className="whitespace-nowrap text-xs font-bold text-slate-800 dark:text-slate-100">{currentUser?.displayName || currentUser?.username || "Admin"}</p>
                                            <p className="whitespace-nowrap text-[10px] font-medium uppercase tracking-wide text-slate-400">{currentUser?.role || "ADMIN"}</p>
                                        </div>
                                    </button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-52 rounded-2xl border-slate-200 bg-white p-1.5 shadow-lg dark:border-slate-800 dark:bg-slate-900">
                                    <DropdownMenuItem asChild className="cursor-pointer rounded-xl px-3 py-2.5 font-medium">
                                        <Link href="/admin/profile">Há»“ sÆ¡ cÃ¡ nhÃ¢n</Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator className="my-1" />
                                    <DropdownMenuItem
                                        className="cursor-pointer rounded-xl px-3 py-2.5 font-medium text-red-600 focus:bg-red-50 focus:text-red-700 dark:focus:bg-red-950/30"
                                        onClick={async () => {
                                            await fetch("/api/auth/logout", { method: "POST" });
                                            window.location.href = "/login";
                                        }}
                                    >
                                        ÄÄƒng xuáº¥t
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </header>

                    {/* MAIN CONTENT AREA */}
                    <main className={cn(
                        "w-full min-w-0 flex-1 overflow-visible bg-gray-50 p-4 transition-colors duration-300 dark:bg-slate-950 sm:p-6 lg:min-h-0 lg:overflow-y-auto lg:overflow-x-hidden lg:p-8",
                        (pathname.includes("/admin/work/progress") || pathname.includes("/admin/work/kanban") || pathname.includes("/admin/cms/homepage") || pathname.includes("/admin/cms/home") || pathname.includes("/admin/cms/contact") || pathname.includes("/admin/cms/products/create") || pathname.includes("/admin/cms/products/edit") || pathname.includes("/admin/chat")) ? "overflow-hidden" : ""
                    )}>
                        {children}
                    </main>

                    {/* Footer intentionally omitted to keep the admin workspace full height. */}
                    {false && <>
                        <div>Copyright Â© 2026 <span className="text-primary">Maintech Viet Nam</span></div>
                        
                    </>}
                </SidebarInset>
            </div>
        </SidebarProvider>
    );
}

export default function AdminInnerLayout({ 
    children, 
    currentUser 
}: { 
    children: React.ReactNode; 
    currentUser: any; 
}) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return null;
    }

    return (
        <AdminSettingsProvider>
            <ThemeProvider>
                <LayoutProvider>
                    <AdminInnerLayoutContent currentUser={currentUser}>
                        {children}
                    </AdminInnerLayoutContent>
                </LayoutProvider>
            </ThemeProvider>
        </AdminSettingsProvider>
    );
}


