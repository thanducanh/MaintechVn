// 📍 File: src/actions/auth.ts
"use server";

import prisma from "@/lib/prisma";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import nodemailer from "nodemailer";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { signSession, verifySession, SESSION_COOKIE } from "@/lib/session";

// Lấy session hiện tại từ cookie (dùng trong server actions)
export async function getSessionAction() {
    const cookieStore = await cookies();
    const token = cookieStore.get(SESSION_COOKIE)?.value;
    if (!token) return null;
    return verifySession(token);
}

export async function loginAction(formData: FormData) {
    const username = (formData.get("username") as string)?.toLowerCase().trim();
    const password = formData.get("password") as string;
    const rememberMe = formData.get("rememberMe") === "true";

    if (!username || !password) return { success: false, message: "Vui lòng nhập đầy đủ!" };

    try {
        const user = await prisma.adminUser.findUnique({ where: { username } });
        if (!user) return { success: false, message: "Tài khoản không tồn tại!" };

        // 🔒 Hệ thống chỉ dùng cho 1 tài khoản admin duy nhất quản trị website.
        // Đặt biến môi trường ADMIN_USERNAME trên Vercel để chỉ tài khoản này được đăng nhập.
        const allowedUsername = (process.env.ADMIN_USERNAME || "").toLowerCase().trim();
        if (allowedUsername && username !== allowedUsername) {
            return { success: false, message: "Tài khoản này không được cấp quyền truy cập hệ thống!" };
        }

        const isMatch = await bcrypt.compare(password, user.passwordHash);
        if (!isMatch) return { success: false, message: "Sai tài khoản hoặc mật khẩu!" };

        const token = await signSession(
            { userId: user.id, username: user.username, role: user.role, name: user.displayName },
            rememberMe
        );

        const cookieStore = await cookies();
        cookieStore.set(SESSION_COOKIE, token, {
            httpOnly: true,
            secure:   process.env.NODE_ENV === "production",
            sameSite: "strict",
            path:     "/",
            maxAge:   rememberMe ? 30 * 24 * 60 * 60 : 8 * 60 * 60,
        });

        return { success: true };
    } catch (error) {
        return { success: false, message: "Lỗi hệ thống đăng nhập!" };
    }
}

export async function forgotPasswordAction(username: string) {
    if (!username) return { success: false, message: "Vui lòng nhập tài khoản!" };
    try {
        const user = await prisma.adminUser.findUnique({ where: { username: username.toLowerCase().trim() } });
        if (!user) return { success: false, message: "Tài khoản không tồn tại!" };

        // Sinh mật khẩu tạm ngẫu nhiên 8 ký tự thay vì hardcode "123456"
        const tempPassword = Math.random().toString(36).slice(-8).toUpperCase();
        const hashed = await bcrypt.hash(tempPassword, 12);
        await prisma.adminUser.update({ where: { id: user.id }, data: { passwordHash: hashed } });

        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
        });

        await transporter.sendMail({
            from: `"Hệ thống Maintech VN" <${process.env.EMAIL_USER}>`,
            to:   `${process.env.ADMIN_EMAIL}, ${process.env.DIRECTOR_EMAIL}`,
            subject: `⚠️ RESET MẬT KHẨU: ${user.displayName.toUpperCase()}`,
            html: `<div style="font-family:sans-serif;padding:20px;border:2px solid #e60000;border-radius:15px">
                    <h2 style="color:#e60000">CẢNH BÁO BẢO MẬT</h2>
                    <p>Hệ thống vừa reset mật khẩu cho <b>${user.displayName}</b> (${user.username}).</p>
                    <p>Mật khẩu tạm thời: <b style="font-size:18px;letter-spacing:2px">${tempPassword}</b></p>
                    <p style="color:#666;font-size:12px">Yêu cầu nhân viên đổi mật khẩu ngay sau khi đăng nhập.</p>
                   </div>`,
        }).catch(e => console.error("Mail Error:", e));

        return { success: true, message: "Đã reset mật khẩu. Thông báo đã gửi cho Ban Giám Đốc!" };
    } catch (error: any) {
        return { success: false, message: "Lỗi: " + error.message };
    }
}

export async function changePasswordAction(newPassword: string) {
    try {
        const session = await getSessionAction();
        if (!session) return { success: false, message: "Vui lòng đăng nhập lại!" };
        if (!newPassword || newPassword.length < 6) {
            return { success: false, message: "Mật khẩu mới phải có ít nhất 6 ký tự!" };
        }

        const hashed = await bcrypt.hash(newPassword, 12);
        await prisma.adminUser.update({
            where: { id: session.userId },
            data: { passwordHash: hashed },
        });

        return { success: true };
    } catch (error: any) {
        return { success: false, message: "Lỗi: " + error.message };
    }
}

export async function logoutAction() {
    const cookieStore = await cookies();
    cookieStore.set(SESSION_COOKIE, "", {
        httpOnly: true,
        secure:   process.env.NODE_ENV === "production",
        sameSite: "strict",
        path:     "/",
        maxAge:   0,
    });
    revalidatePath("/", "layout");
    redirect("/login");
}