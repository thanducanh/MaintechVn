// ðŸ“ File: src/actions/product.ts
"use server";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import fs from "fs/promises";
import path from "path";
import { cookies } from "next/headers";
import { uploadService } from "@/lib/upload-service";
import { getCurrentUser } from "@/lib/auth";

async function checkPermission() {
    const cookieStore = await cookies();
    const token = cookieStore.get('maintech_session')?.value;
    if (!token) return false;
    try {
        const { verifySession } = await import("@/lib/session");
        const session = await verifySession(token);
        const role = session?.role?.toUpperCase();
        return role === "ADMIN" || role === "GIAM_DOC" || role === "QUAN_LY";
    } catch { return false; }
}

export async function updateProduct(formData: FormData) {
    if (!(await checkPermission())) return { success: false, error: "KhÃ´ng cÃ³ quyá»n!" };
    try {
        const idStr = formData.get("id")?.toString();
        const name = formData.get("name") as string;
        const name_en = formData.get("name_en") as string;
        const summary = (formData.get("summary") as string) || "";
        const summary_en = (formData.get("summary_en") as string) || "";
        const description = (formData.get("description") as string) || "ChÆ°a cÃ³ thÃ´ng sá»‘ chi tiáº¿t";
        const description_en = (formData.get("description_en") as string) || "";
        const supplier = (formData.get("supplier") as string) || "";
        const price = (formData.get("price") as string) || "";
        const category = (formData.get("category") as string) || "Sáº¢N PHáº¨M KHÃC";
        const status = (formData.get("status") as string) || "PUBLISHED";

        const imageDeleted = formData.get("imageDeleted") === "true";

        // 1. LÆ¯U áº¢NH CHÃNH
        let imageUrl: string | undefined = undefined;
        const imageFile = formData.get("image_file") as File | null;
        if (imageFile && imageFile.size > 0) {
            const currentUser = await getCurrentUser();
            imageUrl = await uploadService.uploadFile(imageFile, "products", "CMS_PRODUCT", currentUser?.id);
        } else if (imageDeleted) {
            imageUrl = ""; // XÃ³a áº£nh
        }

        // 2. ðŸš€ LÆ¯U NHIá»€U áº¢NH PHá»¤ (GALLERY)
        const galleryJson = formData.get("gallery_json") as string;
        let finalGallery: string[] = [];

        if (galleryJson) {
            try {
                finalGallery = JSON.parse(galleryJson);
            } catch {
                finalGallery = [];
            }
        } else {
            const galleryFiles = formData.getAll("gallery_files") as File[];
            for (const file of galleryFiles) {
                if (file && file.size > 0) {
                    const currentUser = await getCurrentUser();
                    const url = await uploadService.uploadFile(file, "products/gallery", "CMS_PRODUCT_GALLERY", currentUser?.id);
                    finalGallery.push(url);
                }
            }
        }

        const data: any = { 
            title_vi: name, 
            title_en: name_en,
            summary, 
            summary_en,
            desc_vi: description, 
            desc_en: description_en,
            supplier, price, category, status 
        };
        
        if (imageUrl) data.imageUrl = imageUrl;
        if (galleryJson || finalGallery.length > 0) {
            data.gallery = JSON.stringify(finalGallery);
        }

        const parsedId = (idStr && idStr !== "undefined") ? parseInt(idStr) : null;
        let product;
        if (parsedId) {
            product = await prisma.service.update({ where: { id: parsedId }, data });
        } else {
            product = await prisma.service.create({ data });
        }

        

        revalidatePath("/admin/cms/products");
        revalidatePath("/products"); 
        return { success: true };
    } catch (error: any) { 
        console.error("Lá»–I LÆ¯U Sáº¢N PHáº¨M:", error); 
        return { success: false, error: error.message }; 
    }
}

export async function uploadProductGalleryAction(formData: FormData) {
    if (!(await checkPermission())) return { error: "Báº¡n khÃ´ng cÃ³ quyá»n!" };
    try {
        const file = formData.get("file") as File;
        if (!file || file.size === 0) return { error: "KhÃ´ng tÃ¬m tháº¥y file!" };
        const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
        if (!validTypes.includes(file.type)) return { error: "áº¢nh khÃ´ng há»£p lá»‡!" };
        if (file.size > 10 * 1024 * 1024) return { error: "KÃ­ch thÆ°á»›c tá»‘i Ä‘a 10MB!" };

        const currentUser = await getCurrentUser();
        const relativePath = await uploadService.uploadFile(file, "products/gallery", "CMS_PRODUCT_GALLERY", currentUser?.id);

        return { success: true, url: relativePath };
    } catch (error: any) {
        console.error("Lá»—i táº£i áº£nh gallery:", error);
        return { error: error.message };
    }
}

export async function toggleProductStatus(id: number, currentStatus: string) {
    if (!(await checkPermission())) return { success: false, error: "KhÃ´ng cÃ³ quyá»n!" };
    try {
        const newStatus = currentStatus === "PUBLISHED" ? "DRAFT" : "PUBLISHED";
        const updated = await prisma.service.update({ where: { id }, data: { status: newStatus } });
        revalidatePath("/admin/cms/products");
        revalidatePath("/products");

        

        return { success: true, newStatus };
    } catch (error) { return { success: false }; }
}

export async function deleteProduct(id: number) {
    if (!(await checkPermission())) return { success: false, error: "KhÃ´ng cÃ³ quyá»n!" };
    try {
        const product = await prisma.service.findUnique({ where: { id } });
        const productName = product?.title || "Sáº£n pháº©m";
        
        if (product?.imageUrl) {
            try { await uploadService.deleteFile(product.imageUrl); } catch(e) {}
        }
        if ((product as any)?.gallery) {
            try {
                const gal = JSON.parse((product as any).gallery);
                for (const g of gal) {
                    await uploadService.deleteFile(g).catch(e => {});
                }
            } catch(e) {}
        }

        await prisma.service.delete({ where: { id } });
        revalidatePath("/admin/cms/products");
        revalidatePath("/products");

        

        return { success: true };
    } catch (error) { return { success: false }; }
}

// ðŸš€ THÃŠM Má»šI: HÃ€M KÃ‰O DATA Äá»˜C Láº¬P CHO TRANG WEB Sáº¢N PHáº¨M KHÃCH HÃ€NG
export async function getDisplayProductsAction() {
    try {
        const products = await prisma.service.findMany({
            where: {
                status: { in: ["PUBLISHED", "HIá»‚N THá»Š", "HOáº T Äá»˜NG"] },
                OR: [
                    { category: { contains: "THIET_BI_NANG_HA" } },
                    { category: { contains: "THIET_BI_FB" } },
                    { category: { contains: "THIET_BI_NGANH_CANG" } },
                    { category: { contains: "THIET_BI_CAU" } },
                    { category: { contains: "LINH_KIEN_PHU_KIEN" } },
                    { category: { in: ["Sáº¢N PHáº¨M NÃ‚NG Háº ", "MÃY MÃ“C XÃ‚Y Dá»°NG", "PHá»¤ TÃ™NG Váº¬T TÆ¯", "Sáº¢N PHáº¨M KHÃC", "Sáº¢N PHáº¨M", "Cáº¨U TRá»¤C & PALANG"] } }
                ]
            },
            orderBy: { createdAt: "desc" }
        });
        return products;
    } catch (error) {
        console.error("Lá»—i láº¥y sáº£n pháº©m:", error);
        return [];
    }
}

// ðŸš€ THÃŠM Má»šI: Cáº¤U HÃŒNH TRANG Sáº¢N PHáº¨M
export async function saveProductPageConfigAction(config: any) {
    if (!(await checkPermission())) return { success: false, error: "KhÃ´ng cÃ³ quyá»n!" };
    try {
        await prisma.siteSetting.upsert({
            where: { key: "PRODUCTS_PAGE_CONFIG" },
            update: { value: JSON.stringify(config) },
            create: { key: "PRODUCTS_PAGE_CONFIG", value: JSON.stringify(config) }
        });
        revalidatePath("/admin/cms/products");
        revalidatePath("/products");
        return { success: true };
    } catch (error: any) {
        console.error("Lá»—i lÆ°u cáº¥u hÃ¬nh sáº£n pháº©m:", error);
        return { success: false, error: error.message };
    }
}

export async function getProductPageConfigAction() {
    try {
        const setting = await prisma.siteSetting.findUnique({
            where: { key: "PRODUCTS_PAGE_CONFIG" }
        });
        if (!setting) return null;
        return JSON.parse(setting.value);
    } catch (error) {
        console.error("Lá»—i láº¥y cáº¥u hÃ¬nh sáº£n pháº©m:", error);
        return null;
    }
}

export async function uploadProductBannerAction(formData: FormData) {
    if (!(await checkPermission())) return { error: "Báº¡n khÃ´ng cÃ³ quyá»n!" };
    try {
        const file = formData.get("file") as File;
        if (!file || file.size === 0) return { error: "KhÃ´ng tÃ¬m tháº¥y file!" };
        const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
        if (!validTypes.includes(file.type)) return { error: "áº¢nh khÃ´ng há»£p lá»‡!" };
        if (file.size > 5 * 1024 * 1024) return { error: "KÃ­ch thÆ°á»›c tá»‘i Ä‘a 5MB!" };

        const currentUser = await getCurrentUser();
        const relativePath = await uploadService.uploadFile(file, "banners", "CMS_BANNER", currentUser?.id);

        return { success: true, url: relativePath };
    } catch (error: any) {
        console.error("Lá»—i táº£i áº£nh sáº£n pháº©m:", error);
        return { error: error.message };
    }
}


