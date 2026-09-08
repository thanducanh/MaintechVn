// 📍 File: src/app/admin/profile/page.tsx
import prisma from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { LayoutDashboard } from "lucide-react";
import Link from "next/link";
import { Separator } from "@/components/ui/separator";
import ProfileHeader from "@/components/admin/settings/ProfileHeader";
import SettingsView from "@/components/admin/settings/SettingsView";

export default async function ProfilePage() {
    const session = await requireAuth();
    
    const user: any = await prisma.adminUser.findUnique({ 
        where: { id: session.userId }
    });
    
    if (!user) redirect("/login");

    return (
        <div className="flex flex-col animate-in fade-in duration-500 overflow-x-hidden">
            <ProfileHeader />

            <div className="max-w-[1200px] w-full mx-auto px-1 pb-10">
                <SettingsView user={user} />
            </div>
        </div>
    );
}
