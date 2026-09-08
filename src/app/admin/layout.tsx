import { requireAuth } from "@/lib/auth";
import AdminInnerLayout from "./AdminInnerLayout";
import { HeartbeatTracker } from "@/components/common/HeartbeatTracker";
import { redirect } from "next/navigation";

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const currentUser = await requireAuth();
    if (!currentUser) redirect("/login");

    return (
        <AdminInnerLayout currentUser={currentUser}>
            <HeartbeatTracker type="ADMIN_PANEL" />
            {children}
        </AdminInnerLayout>
    );
}

