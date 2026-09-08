// 📍 File: src/app/api/auth/logout/route.ts
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { SESSION_COOKIE } from "@/lib/session";

export async function POST() {
    const cookieStore = await cookies();
    // Xóa cookie với đúng các thuộc tính đã set lúc tạo
    cookieStore.set(SESSION_COOKIE, "", {
        httpOnly: true,
        secure:   process.env.NODE_ENV === "production",
        sameSite: "strict",
        path:     "/",
        maxAge:   0, // Hết hạn ngay lập tức
    });
    return NextResponse.json({ success: true });
}