// 📍 File: src/actions/site-image.ts
"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import fs from "fs/promises"; // Chuyển sang dùng promises để chạy nhanh hơn
import path from "path";

// ==========================================
// 1. HÀM TẢI ẢNH LÊN (UPLOAD)
// ==========================================
export async function createSiteImage(formData: FormData) {
    try {
        const file = formData.get("file") as File;
        const location = formData.get("location") as string; // Tên folder: dich-vu, trang-chu...
        const name = formData.get("name") as string;
        const key = (formData.get("key") as string).toUpperCase().replace(/\s+/g, '_');

        if (!file || file.size === 0) {
            return { success: false, message: "Vui lòng chọn file ảnh!" };
        }

        // Chuyển file thành Buffer
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Định nghĩa đường dẫn lưu file
        const fileName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '')}`;
        const relativePath = `/images/${location}/${fileName}`;
        const uploadDir = path.join(process.cwd(), "public", "images", location);
        const absolutePath = path.join(uploadDir, fileName);

        // Đảm bảo thư mục tồn tại trước khi ghi file
        await fs.mkdir(uploadDir, { recursive: true });
        
        // Ghi file (Bất đồng bộ)
        await fs.writeFile(absolutePath, buffer);

        // Lưu vào Database - Dùng 'as any' để bypass lỗi TypeScript nãy giờ
        await (prisma as any).siteImage.create({
            data: {
                key,
                name,
                location, 
                imageUrl: relativePath 
            }
        });

        revalidatePath("/admin/cms/images");
        return { success: true };
    } catch (error: any) {
        console.error("Lỗi upload:", error);
        return { success: false, message: "Lỗi upload: " + error.message };
    }
}

// ==========================================
// 2. XÓA HÌNH ẢNH
// ==========================================
export async function deleteSiteImage(id: number) {
    try {
        const img = await (prisma as any).siteImage.findUnique({ where: { id } });
        if (img) {
            // Xóa file vật lý
            const absolutePath = path.join(process.cwd(), "public", img.imageUrl);
            try {
                await fs.unlink(absolutePath);
            } catch (e) {
                console.log("File không tồn tại trên ổ cứng, chỉ xóa trong DB.");
            }
            
            // Xóa trong DB
            await (prisma as any).siteImage.delete({ where: { id } });
        }
        revalidatePath("/admin/cms/images");
        return { success: true };
    } catch (error: any) {
        return { success: false, message: error.message };
    }
}

// ==========================================
// 3. CẬP NHẬT THÔNG TIN ẢNH
// ==========================================
export async function updateSiteImageInfo(id: number, name: string) {
    try {
        await (prisma as any).siteImage.update({
            where: { id },
            data: { name }
        });
        revalidatePath("/admin/cms/images");
        return { success: true };
    } catch (error: any) {
        return { success: false, message: "Lỗi cập nhật." };
    }
}