// ðŸ“ File: src/app/change-password/page.tsx
import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import ChangePasswordClient from "./ChangePasswordClient";

export const dynamic = "force-dynamic";

export default async function ChangePasswordPage() {
    const currentUser = await getCurrentUser();
    if (!currentUser) redirect("/login");

    return <ChangePasswordClient forced={false} />;
}

