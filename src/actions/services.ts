// ðŸ“ File: src/actions/services.ts
"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import fs from "fs/promises";
import path from "path";

// 1. KIá»‚M TRA QUYá»€N TRUY Cáº¬P
async function checkPermission() {
    const { hasRole } = await import("@/lib/auth");
    return await hasRole("ADMIN", "GIAM_DOC", "QUAN_LY");
}

// 2. ðŸš€ UPSERT Dá»ŠCH Vá»¤ / CHá»¨NG CHá»ˆ (FIX: imageUrl & order)
export async function upsertServiceAction(formData: FormData) {
    if (!(await checkPermission())) return { success: false, error: "Báº¡n khÃ´ng cÃ³ quyá»n!" };

    const idStr = formData.get("id")?.toString();
    let imageUrl = formData.get("imageUrl")?.toString() || ""; // Äá»•i tÃªn tá»« imageUrl
    const image_file = formData.get("image_file") as File | null;

    try {
        // Xá»­ lÃ½ lÆ°u áº£nh
        if (image_file && image_file.size > 0) {
            // XÃ³a áº£nh cÅ© náº¿u cÃ³
            if (imageUrl && imageUrl.startsWith('/uploads/')) {
                const oldPath = path.join(process.cwd(), "public", imageUrl);
                try { await fs.unlink(oldPath); } catch (e) {}
            }

            const buffer = Buffer.from(await image_file.arrayBuffer());
            const fileName = `${Date.now()}_${image_file.name.replace(/[^a-zA-Z0-9.\-_]/g, '')}`;
            const uploadDir = path.join(process.cwd(), "public/uploads/services");
            await fs.mkdir(uploadDir, { recursive: true });
            await fs.writeFile(path.join(uploadDir, fileName), buffer);
            imageUrl = `/uploads/services/${fileName}`;
        }

        const title = formData.get("title_vi")?.toString() || "KhÃ´ng cÃ³ tiÃªu Ä‘á»";
        const titleEn = formData.get("title_en")?.toString() || "";
        const contentVi = formData.get("desc_vi")?.toString() || formData.get("summary")?.toString() || "";
        const contentEn = formData.get("desc_en")?.toString() || "";
        // Keep bilingual service content in the existing content column so this
        // works with the current database schema without losing old Vietnamese data.
        const content = JSON.stringify({ vi: contentVi, en: contentEn, title_en: titleEn });
        const slug = title.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") + "-" + Date.now();
        const dataToSave: any = {
            title,
            slug,
            content,
            category: formData.get("category")?.toString() || "CHUNG_CHI",
            imageUrl: imageUrl || "", 
            status: formData.get("status")?.toString() || "HIá»‚N THá»Š",
            isActive: (formData.get("status")?.toString() || "HIá»‚N THá»Š") !== "áº¨N",
            order: formData.has("order") ? (parseInt(formData.get("order")?.toString() || "0") || 0) : undefined
        };

        let serviceId;
        if (idStr && idStr !== "undefined" && idStr !== "null") {
            const parsedId = parseInt(idStr);
            serviceId = parsedId;
            delete dataToSave.slug;
            await (prisma as any).service.update({ 
                where: { id: parsedId }, 
                data: dataToSave 
            });
        } else {
            // Dá»‹ch vá»¥ má»›i luÃ´n Ä‘á»©ng sau dá»‹ch vá»¥ hiá»‡n cÃ³, khÃ´ng nháº£y lÃªn vá»‹ trÃ­ sá»‘ 1.
            const lastService = await (prisma as any).service.findFirst({
                where: { category: { notIn: ["CHUNG_CHI", "CHUNG_CHI_LOAI", "DOL_TAC", "DOI_TAC"] } },
                orderBy: { order: "desc" },
                select: { order: true }
            });
            dataToSave.order = Math.max(Number(lastService?.order || 0) + 1, 1);
            const newService = await (prisma as any).service.create({ data: dataToSave });
            serviceId = newService.id;
        }

        
        
        revalidatePath("/admin/cms/services");
        revalidatePath("/services");
        revalidatePath("/admin/cms/about");
        revalidatePath("/about");
        revalidatePath("/", "layout");
        
        return { success: true };
    } catch (error: any) {
        console.error("Lá»—i Prisma:", error);
        return { success: false, error: "Lá»—i Database: " + error.message };
    }
}

// 3. XÃ“A Dá»ŠCH Vá»¤ / CHá»¨NG CHá»ˆ
export async function deleteServiceAction(id: any) {
    if (!(await checkPermission())) return { success: false, error: "Báº¡n khÃ´ng cÃ³ quyá»n!" };
    try {
        const parsedId = parseInt(id.toString());
        const item = await (prisma as any).service.findUnique({ where: { id: parsedId } });
        
        const currentImageUrl = (item as any)?.imageUrl;
        if (currentImageUrl && currentImageUrl.startsWith('/uploads/')) {
            const oldPath = path.join(process.cwd(), "public", currentImageUrl);
            try { await fs.unlink(oldPath); } catch (e) {}
        }

        const title = (item as any)?.title || "Dá»‹ch vá»¥/Chá»©ng chá»‰";
        await (prisma as any).service.delete({ where: { id: parsedId } });
        
        

        revalidatePath("/", "layout"); 
        revalidatePath("/admin/cms/services");
        revalidatePath("/services");
        return { success: true };
    } catch (error: any) { 
        return { success: false, error: error.message }; 
    }
}

// 4. Bá»˜ Lá»ŒC HIá»‚N THá»Š (FIX: order)
export async function getDisplayServicesAction() {
    const sampleServices = [
        { id: "sample-port", slug: "thiet-ke-lap-dat-thiet-bi-cang", title_vi: "Thiết kế & lắp đặt thiết bị cảng", title_en: "Design and installation of port equipment", desc_vi: "Thiết kế, lắp đặt và nâng cấp thiết bị phục vụ cảng biển, kho bãi và trung tâm logistics.", desc_en: "Design, installation, and upgrade solutions for ports, warehouses, and logistics centers.", imageUrl: "/uploads/services/1778675193146_ThietKeLapDatThietBiCang.png", icon: "wrench", status: "HIỂN THỊ", isActive: true },
        { id: "sample-maintenance", slug: "bao-tri-sua-chua-thiet-bi-nang-ha", title_vi: "Bảo trì & sửa chữa thiết bị nâng hạ", title_en: "Lifting equipment maintenance & repair", desc_vi: "Kiểm tra, bảo trì và sửa chữa cầu trục, cổng trục, tời nâng và thiết bị nâng hạ công nghiệp.", desc_en: "Inspection, maintenance, and repair of overhead cranes, gantry cranes, hoists, and industrial lifting equipment.", imageUrl: "/uploads/services/1778675523223_BaoTriThietBiCang.png", icon: "cog", status: "HIỂN THỊ", isActive: true },
        { id: "sample-fb", slug: "thiet-bi-day-chuyen-fb", title_vi: "Thiết bị & dây chuyền F&B công nghiệp", title_en: "Industrial F&B equipment & production lines", desc_vi: "Khảo sát, lắp đặt, sửa chữa và nâng cấp thiết bị cho nhà máy sữa, thực phẩm và đồ uống.", desc_en: "Inspection, installation, repair, and upgrade of equipment for dairy, food, and beverage factories.", imageUrl: "/uploads/services/1778675445942_BaoTriThietBiNganhFB.png", icon: "factory", status: "HIỂN THỊ", isActive: true },
        { id: "sample-spare", slug: "khao-sat-thiet-ke-linh-kien-thay-the", title_vi: "Khảo sát & thiết kế linh kiện thay thế", title_en: "Site survey & replacement component design", desc_vi: "Khảo sát hiện trạng, xác định nguyên nhân hư hỏng và thiết kế linh kiện thay thế phù hợp.", desc_en: "Survey the equipment, identify failures, and design suitable replacement components.", imageUrl: "/uploads/services/1778674885685_ThietKeLapDatThietBiCang.png", icon: "gauge", status: "HIỂN THỊ", isActive: true }
    ];
    try { 
        const services = await (prisma as any).service.findMany({ 
            where: {
                isActive: true,
                status: "HIỂN THỊ",
                title: { not: "" },
                // Má»i dá»‹ch vá»¥ táº¡o trong CMS Ä‘á»u hiá»‡n trÃªn website; chá»‰ loáº¡i chá»©ng chá»‰/Ä‘á»‘i tÃ¡c.
                category: { notIn: ["CHUNG_CHI", "CHUNG_CHI_LOAI", "DOL_TAC", "DOI_TAC"] }
            },
            // Website pháº£i giá»¯ Ä‘Ãºng thá»© tá»± dá»‹ch vá»¥ Ä‘Æ°á»£c táº¡o trong CMS.
            orderBy: [ { createdAt: 'asc' }, { id: 'asc' } ] 
        });
        const normalized = services.map((service: any) => {
            let localized: any = {};
            try { localized = JSON.parse(service.content || "{}"); } catch { localized = {}; }
            const contentVi = typeof localized?.vi === "string" ? localized.vi : (service.content || "");
            const contentEn = typeof localized?.en === "string" ? localized.en : contentVi;
            const titleEn = typeof localized?.title_en === "string" ? localized.title_en : service.title;
            return ({
            ...service,
            title_vi: service.title,
            title_en: titleEn,
            desc_vi: contentVi,
            desc_en: contentEn,
            summary: contentVi,
            summary_en: contentEn
        });
        });
        const existingSlugs = new Set(normalized.map((service: any) => service.slug));
        return [...normalized, ...sampleServices.filter((service: any) => !existingSlugs.has(service.slug))];
    }
    catch (error) { return sampleServices; }
}

// 5. Cáº¬P NHáº¬T THá»¨ Tá»° (DRAG & DROP)
export async function updateServiceOrderAction(orderedIds: string[]) {
    if (!(await checkPermission())) return { success: false, error: "KhÃ´ng cÃ³ quyá»n" };
    try {
        const updates = orderedIds.map((id, index) => {
            return (prisma as any).service.update({ 
                where: { id: parseInt(id) }, 
                data: { order: index } 
            });
        });
        await prisma.$transaction(updates);
        
        revalidatePath("/", "layout");
        return { success: true };
    } catch (error) { return { success: false, error: "Lá»—i lÆ°u thá»© tá»±" }; }
}

// 6. Táº O LOáº I CHá»¨NG CHá»ˆ Má»šI
export async function createCertificateCategoryAction(titleVi: string, titleEn: string) {
    if (!(await checkPermission())) return { success: false, error: "Báº¡n khÃ´ng cÃ³ quyá»n!" };
    try {
        const count = await (prisma as any).service.count({
            where: { category: "CHUNG_CHI_LOAI" }
        });
        const newCat = await (prisma as any).service.create({
            data: {
                title_vi: titleVi,
                title_en: titleEn || null,
                desc_vi: titleVi, // Keep fallback sync
                desc_en: titleEn || null,
                category: "CHUNG_CHI_LOAI",
                status: "HIá»‚N THá»Š",
                order: count
            }
        });
        revalidatePath("/admin/cms/about");
        revalidatePath("/about");
        revalidatePath("/", "layout");
        return { success: true, category: newCat };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

// 7. Cáº¬P NHáº¬T LOáº I CHá»¨NG CHá»ˆ
export async function updateCertificateCategoryAction(id: number, titleVi: string, titleEn: string) {
    if (!(await checkPermission())) return { success: false, error: "Báº¡n khÃ´ng cÃ³ quyá»n!" };
    try {
        const oldCat = await (prisma as any).service.findUnique({
            where: { id }
        });
        if (!oldCat) return { success: false, error: "KhÃ´ng tÃ¬m tháº¥y loáº¡i chá»©ng chá»‰!" };
        
        await (prisma as any).service.update({
            where: { id },
            data: {
                title_vi: titleVi,
                title_en: titleEn || null,
                desc_vi: titleVi,
                desc_en: titleEn || null
            }
        });

        // Cáº­p nháº­t táº¥t cáº£ chá»©ng chá»‰ con cÃ³ desc_vi trÃ¹ng vá»›i tÃªn cÅ©
        await (prisma as any).service.updateMany({
            where: { category: "CHUNG_CHI", desc_vi: oldCat.title_vi },
            data: { desc_vi: titleVi }
        });

        revalidatePath("/admin/cms/about");
        revalidatePath("/about");
        revalidatePath("/", "layout");
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

// 8. XÃ“A LOáº I CHá»¨NG CHá»ˆ (VÃ€ TOÃ€N Bá»˜ CHá»¨NG CHá»ˆ BÃŠN TRONG CÃ“ Cáº¢NH BÃO)
export async function deleteCertificateCategoryAction(id: number) {
    if (!(await checkPermission())) return { success: false, error: "Báº¡n khÃ´ng cÃ³ quyá»n!" };
    try {
        const cat = await (prisma as any).service.findUnique({
            where: { id }
        });
        if (!cat) return { success: false, error: "KhÃ´ng tÃ¬m tháº¥y loáº¡i chá»©ng chá»‰!" };

        // Láº¥y táº¥t cáº£ chá»©ng chá»‰ thuá»™c phÃ¢n loáº¡i nÃ y Ä‘á»ƒ xÃ³a áº£nh file
        const certs = await (prisma as any).service.findMany({
            where: { category: "CHUNG_CHI", desc_vi: cat.title_vi }
        });

        for (const cert of certs) {
            const currentImageUrl = cert.imageUrl;
            if (currentImageUrl && currentImageUrl.startsWith('/uploads/')) {
                const oldPath = path.join(process.cwd(), "public", currentImageUrl);
                try { await fs.unlink(oldPath); } catch (e) {}
            }
        }

        // XÃ³a cÃ¡c chá»©ng chá»‰ con
        await (prisma as any).service.deleteMany({
            where: { category: "CHUNG_CHI", desc_vi: cat.title_vi }
        });

        // XÃ³a báº£n thÃ¢n loáº¡i chá»©ng chá»‰
        await (prisma as any).service.delete({
            where: { id }
        });

        revalidatePath("/admin/cms/about");
        revalidatePath("/about");
        revalidatePath("/", "layout");
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

// 9. Sáº®P Xáº¾P THá»¨ Tá»° LOáº I CHá»¨NG CHá»ˆ
export async function updateCertificateCategoryOrderAction(orderedIds: number[]) {
    if (!(await checkPermission())) return { success: false, error: "Báº¡n khÃ´ng cÃ³ quyá»n!" };
    try {
        const updates = orderedIds.map((id, index) => {
            return (prisma as any).service.update({
                where: { id },
                data: { order: index }
            });
        });
        await prisma.$transaction(updates);
        revalidatePath("/admin/cms/about");
        revalidatePath("/about");
        revalidatePath("/", "layout");
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

// 10. Cáº¬P NHáº¬T NHANH THá»¨ Tá»° CHá»¨NG CHá»ˆ ÄÆ N Láºº
export async function updateSingleCertificateOrderAction(id: number, order: number) {
    if (!(await checkPermission())) return { success: false, error: "Báº¡n khÃ´ng cÃ³ quyá»n!" };
    try {
        await (prisma as any).service.update({
            where: { id },
            data: { order }
        });
        revalidatePath("/admin/cms/about");
        revalidatePath("/about");
        revalidatePath("/", "layout");
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

// 7. ðŸš€ THAY Äá»”I NHANH TRáº NG THÃI (HIá»‚N THá»Š / áº¨N)
export async function toggleServiceStatusAction(id: string | number, currentStatus: string) {
    if (!(await checkPermission())) return { success: false, error: "Báº¡n khÃ´ng cÃ³ quyá»n!" };
    try {
        // Äáº£o ngÆ°á»£c tráº¡ng thÃ¡i
        const newStatus = currentStatus === "HIá»‚N THá»Š" ? "áº¨N" : "HIá»‚N THá»Š";
        const parsedId = typeof id === 'string' ? parseInt(id) : id;
        
        // Gá»i Prisma update tháº³ng vÃ o Database
        await (prisma as any).service.update({
            where: { id: parsedId },
            data: { status: newStatus }
        });
        
        // Clear cache Ä‘á»ƒ giao diá»‡n Admin vÃ  Website cáº­p nháº­t ngay láº­p tá»©c
        revalidatePath("/admin/cms/services");
        revalidatePath("/services");
        revalidatePath("/", "layout");
        
        return { success: true, newStatus };
    } catch (error: any) {
        return { success: false, error: "Lá»—i há»‡ thá»‘ng khi Ä‘á»•i tráº¡ng thÃ¡i: " + error.message };
    }
}

// 8. ðŸš€ LÆ¯U Cáº¤U HÃŒNH TRANG Dá»ŠCH Vá»¤ (SERVICES_PAGE_CONFIG)
export async function saveServicesPageConfigAction(config: any) {
    if (!(await checkPermission())) return { success: false, error: "Báº¡n khÃ´ng cÃ³ quyá»n!" };
    try {
        await prisma.siteSetting.upsert({
            where: { key: "SERVICES_PAGE_CONFIG" },
            update: { value: JSON.stringify(config) },
            create: {
                key: "SERVICES_PAGE_CONFIG",
                value: JSON.stringify(config)
            }
        });

        revalidatePath("/admin/cms/services");
        revalidatePath("/services");
        revalidatePath("/", "layout");
        return { success: true };
    } catch (error: any) {
        console.error("Lá»—i lÆ°u cáº¥u hÃ¬nh trang dá»‹ch vá»¥:", error);
        return { success: false, error: "Lá»—i Database: " + error.message };
    }
}

// 9. ðŸš€ Láº¤Y Cáº¤U HÃŒNH TRANG Dá»ŠCH Vá»¤
export async function getServicesPageConfigAction() {
    try {
        const setting = await prisma.siteSetting.findUnique({
            where: { key: "SERVICES_PAGE_CONFIG" }
        });
        if (!setting) return null;
        return JSON.parse(setting.value);
    } catch (error) {
        console.error("Lá»—i láº¥y cáº¥u hÃ¬nh trang dá»‹ch vá»¥:", error);
        return null;
    }
}

// 10. ðŸš€ Táº¢I áº¢NH BANNER TRANG Dá»ŠCH Vá»¤
export async function uploadServicesBannerAction(formData: FormData) {
    if (!(await checkPermission())) return { success: false, error: "Báº¡n khÃ´ng cÃ³ quyá»n!" };
    try {
        const file = formData.get("file") as File;
        if (!file || file.size === 0) {
            return { success: false, error: "KhÃ´ng tÃ¬m tháº¥y file áº£nh!" };
        }

        const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
        if (!validTypes.includes(file.type)) {
            return { success: false, error: "Äá»‹nh dáº¡ng file khÃ´ng há»£p lá»‡! Chá»‰ cháº¥p nháº­n JPG, JPEG, PNG, WEBP." };
        }

        const maxSize = 5 * 1024 * 1024;
        if (file.size > maxSize) {
            return { success: false, error: "Dung lÆ°á»£ng áº£nh quÃ¡ lá»›n! Giá»›i háº¡n tá»‘i Ä‘a lÃ  5MB." };
        }

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        const fileName = `services-banner-${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '')}`;
        const relativePath = `/uploads/banners/${fileName}`;
        const uploadDir = path.join(process.cwd(), "public", "uploads", "banners");
        const absolutePath = path.join(uploadDir, fileName);

        await fs.mkdir(uploadDir, { recursive: true });
        await fs.writeFile(absolutePath, buffer);

        return { success: true, url: relativePath };
    } catch (error: any) {
        console.error("Lá»—i upload banner dá»‹ch vá»¥:", error);
        return { success: false, error: "Lá»—i lÆ°u file: " + error.message };
    }
}

// Táº£i áº£nh riÃªng cho pháº§n chi tiáº¿t tá»«ng dá»‹ch vá»¥ trong CMS.
export async function uploadServiceDetailImageAction(formData: FormData) {
    if (!(await checkPermission())) return { success: false, error: "Báº¡n khÃ´ng cÃ³ quyá»n!" };
    try {
        const file = formData.get("file") as File;
        if (!file || file.size === 0) return { success: false, error: "KhÃ´ng tÃ¬m tháº¥y file áº£nh!" };
        const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
        if (!validTypes.includes(file.type)) return { success: false, error: "Chá»‰ cháº¥p nháº­n JPG, PNG hoáº·c WEBP." };
        if (file.size > 5 * 1024 * 1024) return { success: false, error: "Dung lÆ°á»£ng áº£nh tá»‘i Ä‘a lÃ  5MB." };

        const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, "") || "image.jpg";
        const fileName = `service-detail-${Date.now()}-${safeName}`;
        const uploadDir = path.join(process.cwd(), "public", "uploads", "services");
        await fs.mkdir(uploadDir, { recursive: true });
        await fs.writeFile(path.join(uploadDir, fileName), Buffer.from(await file.arrayBuffer()));
        return { success: true, url: `/uploads/services/${fileName}` };
    } catch (error: any) {
        console.error("Lá»—i upload áº£nh chi tiáº¿t dá»‹ch vá»¥:", error);
        return { success: false, error: "Lá»—i lÆ°u file: " + error.message };
    }
}





