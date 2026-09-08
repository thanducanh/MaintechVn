// 📍 File: src/actions/partners.ts
"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import fs from "fs/promises";
import path from "path";

// 🚀 Lớp bảo vệ: Check quyền truy cập
async function checkPermission() {
    const { hasRole } = await import("@/lib/auth");
    return await hasRole("ADMIN", "GIAM_DOC", "QUAN_LY");
}

// 🚀 XỬ LÝ ĐỐI TÁC (UPSERT - TẠO HOẶC CẬP NHẬT)
export async function upsertPartnerAction(formData: FormData) {
    if (!(await checkPermission())) return { success: false, error: "Bạn không có quyền!" };

    try {
        const idStr = formData.get("id")?.toString();
        const title_vi = formData.get("title_vi")?.toString() || "Đối tác";
        let imageUrl = formData.get("imageUrl")?.toString() || ""; // Đổi tên từ imageUrl
        const image_file = formData.get("image_file") as File | null;

        // Xử lý ảnh mới nếu có upload
        if (image_file && image_file.size > 0) {
            // Xóa ảnh cũ nếu tồn tại
            if (imageUrl && imageUrl.startsWith('/uploads/')) {
                const oldPath = path.join(process.cwd(), "public", imageUrl);
                try { await fs.unlink(oldPath); } catch (e) {}
            }
            
            const buffer = Buffer.from(await image_file.arrayBuffer());
            const fileName = `${Date.now()}_partner_${image_file.name.replace(/[^a-zA-Z0-9.\-_]/g, '')}`;
            const uploadDir = path.join(process.cwd(), "public/uploads/partners"); // Gom vào folder riêng cho gọn
            await fs.mkdir(uploadDir, { recursive: true });
            await fs.writeFile(path.join(uploadDir, fileName), buffer);
            imageUrl = `/uploads/partners/${fileName}`;
        }

        // ĐÓNG GÓI DỮ LIỆU KHỚP VỚI SCHEMA MỚI
        const safeSlug = `${title_vi.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "partner"}-${Date.now()}`;
        const dataToSave: any = { 
            title: title_vi,
            slug: safeSlug,
            imageUrl: imageUrl, // Đã đổi tên cột
            category: "DOI_TAC",
            status: formData.get("status")?.toString() || "HIỂN THỊ",
            content: formData.get("summary")?.toString() || null,
            order: parseInt(formData.get("order")?.toString() || "0") || 0
        };

        if (idStr && idStr !== "undefined") {
            const parsedId = parseInt(idStr);
            await (prisma as any).service.update({ 
                where: { id: parsedId }, 
                data: dataToSave 
            });
        } else {
            await (prisma as any).service.create({ data: dataToSave });
        }
        
        revalidatePath("/admin/cms/about");
        revalidatePath("/about");
        return { success: true };
    } catch (error: any) {
        console.error("Lỗi đối tác:", error);
        return { success: false, error: "Lỗi Database: " + error.message };
    }
}

// 🚀 XÓA ĐỐI TÁC
export async function deletePartnerAction(id: any) {
    if (!(await checkPermission())) return { success: false, error: "Bạn không có quyền!" };
    try {
        const parsedId = parseInt(id.toString());
        // Lấy thông tin để xóa ảnh vật lý
        const partner = await (prisma as any).service.findUnique({ where: { id: parsedId } });
        
        const currentImageUrl = (partner as any)?.imageUrl;
        if (currentImageUrl && currentImageUrl.startsWith('/uploads/')) {
            const oldPath = path.join(process.cwd(), "public", currentImageUrl);
            try { await fs.unlink(oldPath); } catch (e) {}
        }
        
        await (prisma as any).service.delete({ where: { id: parsedId } });
        
        revalidatePath("/admin/cms/about");
        revalidatePath("/about");
        return { success: true };
    } catch (error: any) { 
        return { success: false, error: "Lỗi xóa: " + error.message }; 
    }
}
