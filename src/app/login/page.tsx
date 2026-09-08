// 📍 File: src/app/login/page.tsx
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { verifySession } from "@/lib/session";
import LoginClient from "./LoginClient";

export default async function LoginPage() {
    // 1. Kiểm tra session trên server
    const cookieStore = await cookies();
    const token = cookieStore.get("maintech_session")?.value;

    if (token) {
        const session = await verifySession(token);
        if (session) {
            // 🚀 Đã đăng nhập rồi -> Redirect vào trang quản trị ngay
            redirect("/admin");
        }
    }

    // 2. Chưa đăng nhập -> Hiển thị giao diện login
    return <LoginClient />;
}