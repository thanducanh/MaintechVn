"use server";

import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function updateAdminProfile(input: {
  displayName: string;
  username: string;
  email?: string;
  phone?: string;
  address?: string;
  avatar?: string | null;
}) {
  try {
    const session = await requireAuth();
    const userId = Number(session.userId);
    if (!Number.isInteger(userId)) return { success: false, message: "Phiên đăng nhập không hợp lệ." };
    const displayName = input.displayName.trim();
    const username = input.username.trim().toLowerCase();
    const avatar = input.avatar === undefined || input.avatar === null ? input.avatar : input.avatar.trim();
    if (!displayName || !username) return { success: false, message: "Vui lòng nhập họ tên và tên đăng nhập." };
    if (avatar && !avatar.startsWith("data:image/") && !avatar.startsWith("http")) {
      return { success: false, message: "Định dạng avatar không hợp lệ." };
    }
    if (avatar && avatar.length > 3_000_000) {
      return { success: false, message: "Ảnh đại diện quá lớn. Vui lòng chọn ảnh dưới 2MB." };
    }

    const duplicate = await prisma.adminUser.findFirst({ where: { username, NOT: { id: userId } } });
    if (duplicate) return { success: false, message: "Tên đăng nhập đã được sử dụng." };

    await prisma.adminUser.update({
      where: { id: userId },
      data: {
        displayName,
        username,
        ...(input.email !== undefined ? { email: input.email.trim() || null } : {}),
        ...(input.phone !== undefined ? { phone: input.phone.trim() || null } : {}),
        ...(input.address !== undefined ? { address: input.address.trim() || null } : {}),
        ...(avatar !== undefined ? { avatar } : {}),
      },
    });
    revalidatePath("/admin/profile");
    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown profile update error";
    console.error("Profile update error:", error);
    return { success: false, message };
  }
}

export async function changeAdminPassword(input: { currentPassword: string; newPassword: string }) {
  const session = await requireAuth();
  if (!input.currentPassword || input.newPassword.length < 6) return { success: false, message: "Mật khẩu mới phải có ít nhất 6 ký tự." };
  const admin = await prisma.adminUser.findUnique({ where: { id: session.userId } });
  if (!admin || !(await bcrypt.compare(input.currentPassword, admin.passwordHash))) {
    return { success: false, message: "Mật khẩu hiện tại không đúng." };
  }
  await prisma.adminUser.update({ where: { id: session.userId }, data: { passwordHash: await bcrypt.hash(input.newPassword, 12) } });
  return { success: true };
}
