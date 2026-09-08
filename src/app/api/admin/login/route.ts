import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json();

    if (typeof username !== "string" || typeof password !== "string" || !username.trim() || !password) {
      return NextResponse.json({ error: "Vui lòng nhập tên đăng nhập và mật khẩu." }, { status: 400 });
    }

    if (username.trim().toLowerCase() !== "nguyendinhthanh") {
      return NextResponse.json({ error: "Tài khoản quản trị không hợp lệ." }, { status: 401 });
    }

    const admin = await prisma.adminUser.findUnique({ where: { username: "nguyendinhthanh" } });
    if (!admin) return NextResponse.json({ error: "Thông tin đăng nhập không chính xác." }, { status: 401 });

    const isPasswordValid = admin.passwordHash.startsWith("$2")
      ? await bcrypt.compare(password, admin.passwordHash)
      : password === admin.passwordHash;

    if (!isPasswordValid) return NextResponse.json({ error: "Thông tin đăng nhập không chính xác." }, { status: 401 });

    const response = NextResponse.json({ success: true, message: "Đăng nhập thành công." });
    response.cookies.set("admin_session", `${admin.id}:${admin.role}`, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });
    return response;
  } catch (error) {
    console.error("Admin login failed", error);
    return NextResponse.json({ error: "Không thể xử lý đăng nhập lúc này." }, { status: 500 });
  }
}
