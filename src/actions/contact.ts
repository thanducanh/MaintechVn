// src/actions/contact.ts
"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import fs from "fs/promises";
import path from "path";
import { uploadService } from "@/lib/upload-service";
import { getCurrentUser } from "@/lib/auth";

// =================================================================
// PHẦN 1: DÀNH CHO KHÁCH HÀNG (Lưu form Gửi Yêu Cầu Tư Vấn ngoài web)
// =================================================================
export async function submitContactForm(formData: FormData) {
    try {
        const rawData = {
            name: (formData.get("name") as string) || "",
            email: (formData.get("email") as string) || "",
            phone: (formData.get("phone") as string) || "",
            service_interest: (formData.get("service_interest") as string) || "TƯ VẤN CHUNG",
            message: (formData.get("message") as string) || "",
        };

        const result = await prisma.inquiry.create({ data: rawData });
        
        // Có thể revalidate path nếu có trang danh sách inquiry trong admin
        revalidatePath("/admin/cms/inquiries"); 
        
        return { success: true, id: result.id };
    } catch (error: any) {
        console.error("Lỗi gửi form liên hệ:", error);
        return { success: false, message: error.message || "Không thể gửi yêu cầu lúc này. Vui lòng thử lại sau." };
    }
}

// 🚀 Chốt bảo mật: Kiểm tra quyền truy cập CMS
async function checkPermission() {
    const { hasRole } = await import("@/lib/auth");
    return await hasRole("ADMIN", "GIAM_DOC", "QUAN_LY");
}

// 🚀 2. HÀM LƯU CẤU HÌNH LIÊN HỆ (Lưu vào SiteSetting key CONTACT_CONFIG)
export async function updateContactConfigAction(config: any) {
    if (!(await checkPermission())) {
        return { error: "Bạn không có quyền thay đổi cấu hình Liên hệ!" };
    }

    try {
        await prisma.siteSetting.upsert({
            where: { key: "CONTACT_CONFIG" },
            update: { value: JSON.stringify(config) },
            create: { 
                key: "CONTACT_CONFIG", 
                value: JSON.stringify(config) 
            }
        });

        revalidatePath("/admin/cms/contact");
        revalidatePath("/contact");
        revalidatePath("/");
        return { success: true };
    } catch (error) {
        console.error("Lỗi cập nhật cấu hình Liên hệ:", error);
        return { error: "Lỗi lưu cấu hình vào Database!" };
    }
}

// 🚀 3. HÀM LẤY CẤU HÌNH LIÊN HỆ
export async function getContactConfigAction() {
    try {
        const setting = await prisma.siteSetting.findUnique({
            where: { key: "CONTACT_CONFIG" }
        });
        
        if (!setting) return null;
        return JSON.parse(setting.value);
    } catch (error) {
        console.error("Lỗi lấy cấu hình Liên hệ:", error);
        return null;
    }
}

// 🚀 4. LEGACY ACTIONS (Duy trì tạm thời để tránh lỗi build)
export async function saveContactAction(formData: FormData) {
    return { error: "Action này đã bị thay thế bởi updateContactConfigAction." };
}

export async function getContactAction() {
    return await getContactConfigAction();
}

// 🚀 5b. GHI NHẬN 1 LƯỢT KHÁCH BẤM GỌI ĐIỆN (từ nút/link tel: trên website)
export async function trackCallClickAction(page?: string) {
    try {
        const { headers } = await import("next/headers");
        const headerList = await headers();
        const ip = headerList.get("x-forwarded-for")?.split(",")[0] || headerList.get("x-real-ip") || "Local";
        const country = headerList.get("x-vercel-ip-country") || "Unknown";
        const city = headerList.get("x-vercel-ip-city") || "Unknown";

        await prisma.callClickLog.create({
            data: { ipAddress: ip, country, city, page: page || "/" },
        });
        return { success: true };
    } catch (error) {
        return { success: false };
    }
}

// 👉 5c. LẤY DANH SÁCH + ĐẾM SỐ LIÊN HỆ (form) VÀ SỐ LƯỢT BẤM GỌI (dùng cho trang admin)
export async function getInquiryAndCallStatsAction(page: number = 1, limit: number = 20) {
    try {
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);
        const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

        const skip = (page - 1) * limit;

        const [inquiries, totalInquiries, todayInquiries, weekInquiries, totalCalls, todayCalls, weekCalls] = await Promise.all([
            prisma.inquiry.findMany({ orderBy: { createdAt: "desc" }, skip, take: limit }),
            prisma.inquiry.count(),
            prisma.inquiry.count({ where: { createdAt: { gte: todayStart } } }),
            prisma.inquiry.count({ where: { createdAt: { gte: sevenDaysAgo } } }),
            prisma.callClickLog.count(),
            prisma.callClickLog.count({ where: { createdAt: { gte: todayStart } } }),
            prisma.callClickLog.count({ where: { createdAt: { gte: sevenDaysAgo } } }),
        ]);

        return {
            success: true,
            data: {
                inquiries,
                pagination: { total: totalInquiries, page, limit, totalPages: Math.ceil(totalInquiries / limit) },
                inquiryStats: { total: totalInquiries, today: todayInquiries, last7Days: weekInquiries },
                callStats: { total: totalCalls, today: todayCalls, last7Days: weekCalls },
            },
        };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

// 👉 5c2. TẢI THÊM TRANG LIÊN HỆ (Pagination)
export async function getInquiriesPageAction(page: number, limit: number = 20) {
    try {
        const skip = (page - 1) * limit;
        const [inquiries, total] = await Promise.all([
            prisma.inquiry.findMany({ orderBy: { createdAt: "desc" }, skip, take: limit }),
            prisma.inquiry.count()
        ]);
        return { success: true, inquiries, totalPages: Math.ceil(total / limit) };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

// 👉 5d. CẬP NHẬT TRẠNG THÁI 1 LIÊN HỆ (Mới / Đã liên hệ / Đã đóng)
export async function updateInquiryStatusAction(id: number, status: string) {
    if (!(await checkPermission())) {
        return { error: "Bạn không có quyền!" };
    }
    try {
        await prisma.inquiry.update({ where: { id }, data: { status } });
        revalidatePath("/admin/cms/inquiries");
        return { success: true };
    } catch (error: any) {
        return { error: error.message };
    }
}

// 🚀 5. HÀM TẢI ẢNH BÀI VIẾT BANNER TRANG LIÊN HỆ
export async function uploadContactBannerAction(formData: FormData) {
    if (!(await checkPermission())) {
        return { error: "Bạn không có quyền upload ảnh!" };
    }

    try {
        const file = formData.get("file") as File;
        if (!file || file.size === 0) {
            return { error: "Không tìm thấy file ảnh!" };
        }

        // Kiểm tra định dạng ảnh hợp lệ
        const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
        if (!validTypes.includes(file.type)) {
            return { error: "Định dạng file không hợp lệ! Chỉ chấp nhận JPG, JPEG, PNG, WEBP." };
        }

        // Kiểm tra dung lượng (max 5MB)
        const maxSize = 5 * 1024 * 1024;
        if (file.size > maxSize) {
            return { error: "Dung lượng ảnh quá lớn! Giới hạn tối đa là 5MB." };
        }

        const currentUser = await getCurrentUser();
        const relativePath = await uploadService.uploadFile(file, "banners", "CMS_BANNER", currentUser?.id);

        return { success: true, url: relativePath };
    } catch (error: any) {
        console.error("Lỗi upload contact banner:", error);
        return { error: "Lỗi lưu file: " + error.message };
    }
}

// 👉 6. XÓA LIÊN HỆ
export async function deleteInquiryAction(id: number) {
    if (!(await checkPermission())) {
        return { error: "Bạn không có quyền xoá liên hệ!" };
    }
    try {
        await prisma.inquiry.delete({ where: { id } });
        revalidatePath("/admin/cms/inquiries");
        return { success: true };
    } catch (error: any) {
        return { error: error.message };
    }
}