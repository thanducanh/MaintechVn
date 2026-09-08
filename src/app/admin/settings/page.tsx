// 📍 File: src/app/admin/settings/page.tsx
import prisma from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { LayoutDashboard } from "lucide-react";
import Link from "next/link";
import { Separator } from "@/components/ui/separator";
import SettingsView from "@/components/admin/settings/SettingsView";

export default async function SettingsPage() {
    const session = await requireAuth();
    
    const user: any = await prisma.adminUser.findUnique({ 
        where: { id: session.userId },
    });
    
    if (!user) redirect("/login");

    return (
        <div className="min-h-screen bg-background -m-4 md:-m-6 lg:-m-8 p-4 md:p-6 lg:p-8">
            <div className="max-w-[1200px] mx-auto space-y-8 animate-in fade-in duration-500 pb-20">
                
                {/* PAGE HEADER */}
                {/* PAGE HEADER */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 px-1">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-sm transition-colors">
                            <LayoutDashboard className="h-5 w-5" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight text-slate-950">
                                Cài đặt hệ thống
                            </h1>
                            <p className="mt-0.5 text-sm text-slate-500">
                                Cấu hình cá nhân và tùy chỉnh trải nghiệm làm việc của bạn.
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Link 
                            href="/admin" 
                            className="p-2 -ml-2 text-muted-foreground hover:text-foreground transition-colors"
                            title="Quay lại Dashboard"
                        >
                            <LayoutDashboard size={20} />
                        </Link>
                    </div>
                </div>

                <Separator className="bg-slate-100 dark:bg-slate-800" />

                {/* 🚀 DÙNG SETTINGS VIEW RIÊNG BIỆT */}
                <SettingsView user={user} />
                
            </div>
        </div>
    );
}