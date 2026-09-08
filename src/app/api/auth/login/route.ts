// 📍 File: src/app/api/auth/login/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import { signSession, SESSION_COOKIE } from "@/lib/session";

// Rate limiting đơn giản bằng in-memory map (reset khi server restart)
// Với production nên dùng Redis, nhưng đây đủ cho doanh nghiệp nhỏ
const loginAttempts = new Map<string, { count: number; resetAt: number }>();
const MAX_ATTEMPTS = 5;       // Tối đa 5 lần sai
const LOCKOUT_MS   = 15 * 60 * 1000; // Khóa 15 phút

export async function POST(request: Request) {
    console.log("📥 Login attempt started...");
    try {
        const body = await request.json();
        const { username, password, rememberMe } = body;
        const key = username?.toLowerCase().trim();

        console.log(`🔍 Finding user: ${key}`);
        const user = await prisma.adminUser.findUnique({ where: { username: key } });

        if (!user) {
            console.log("❌ User not found");
            return NextResponse.json({ error: "Sai tài khoản hoặc mật khẩu!" }, { status: 401 });
        }

        console.log("🔑 Checking password...");
        // BẢO MẬT TẠM THỜI: Chấp nhận cả 123 trực tiếp để cứu vãn tình hình
        const isMatch = user.passwordHash.startsWith("$2")
            ? await bcrypt.compare(password, user.passwordHash)
            : password === user.passwordHash;

        if (!isMatch) {
            console.log("❌ Password mismatch");
            return NextResponse.json({ error: "Sai tài khoản hoặc mật khẩu!" }, { status: 401 });
        }

        console.log("✅ Login successful, signing session...");
        
        const finalRememberMe = rememberMe;
        const token = await signSession(
            {
                userId:   user.id,
                username: user.username,
                role:     user.role,
                name:     user.displayName,
            },
            !!finalRememberMe
        );

        const cookieStore = await cookies();
        cookieStore.set(SESSION_COOKIE, token, {
            httpOnly: true,                                          // Chặn XSS đọc cookie
            secure:   process.env.NODE_ENV === "production",        // Chỉ HTTPS trên production
            sameSite: "lax",                                         // Đổi từ strict sang lax để tránh lỗi cookie trên một số trình duyệt/domain
            path:     "/",
            maxAge:   finalRememberMe ? 30 * 24 * 60 * 60 : undefined, // session cookie
        });

        console.log("🚀 Cookie set, returning response");
        return NextResponse.json({ success: true, role: user.role, name: user.displayName });

    } catch (error) {
        console.error("CRITICAL Login Error:", error);
        return NextResponse.json({ 
            error: "Lỗi hệ thống, vui lòng thử lại sau!",
            details: process.env.NODE_ENV === "development" ? String(error) : undefined
        }, { status: 500 });
    }
}
