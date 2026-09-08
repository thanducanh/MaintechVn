// 📍 File: src/lib/auth.ts
// Helper dùng trong Server Components / Server Actions để lấy user hiện tại

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { verifySession, SESSION_COOKIE } from "@/lib/session";

// Lấy session payload từ JWT (không query DB)
export async function getSession() {
    const cookieStore = await cookies();
    const token = cookieStore.get(SESSION_COOKIE)?.value;
    if (!token) return null;
    return verifySession(token);
}

// Lấy user đầy đủ từ DB (dùng khi cần thông tin mới nhất)
export async function getCurrentUser() {
    const session = await getSession();
    if (!session) return null;
    return prisma.adminUser.findUnique({ where: { id: session.userId } });
}

// Dùng trong page.tsx — tự redirect nếu chưa đăng nhập
export async function requireAuth() {
    const session = await getSession();
    if (!session) redirect("/login");
    return session;
}

// Dùng trong page.tsx — tự redirect nếu không đủ quyền
export async function requireRole(...roles: string[]) {
    const session = await requireAuth();
    const userRole = session.role?.toUpperCase();
    const isAdmin = userRole === "ADMIN" || userRole === "SUPERADMIN";
    if (!isAdmin && !roles.includes(userRole)) redirect("/admin");
    return session;
}

// Dùng trong Server Actions — trả về true/false thay vì redirect
export async function hasRole(...roles: string[]) {
    const session = await getSession();
    if (!session) return false;
    const userRole = session.role?.toUpperCase();
    const isAdmin = userRole === "ADMIN" || userRole === "SUPERADMIN";
    if (isAdmin) return true;
    return roles.includes(userRole);
}
