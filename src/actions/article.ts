// ðŸ“ File: src/actions/article.ts
"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import fs from "fs/promises";
import path from "path";
import { uploadService } from "@/lib/upload-service";
import { getCurrentUser } from "@/lib/auth";

// 1. Kiá»ƒm tra quyá»n
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

// 2. ðŸš€ HÃ€M NÃ‚NG Cáº¤P: UPSERT ARTICLE (DÃ¹ng chung cho cáº£ ThÃªm vÃ  Sá»­a)
// Fix lá»—i lá»‡ch tham sá»‘ giÃºp Frontend háº¿t váº¡ch Ä‘á» 100%
export async function updateArticle(formData: FormData) {
    if (!(await checkPermission())) return { success: false, error: "KhÃ´ng cÃ³ quyá»n!" };
    
    try {
        const idStr = formData.get("id")?.toString();
        const title = formData.get("title") as string;
        
        if (!title || !title.trim()) {
            return { success: false, error: "Thiáº¿u tiÃªu Ä‘á» bÃ i viáº¿t Tiáº¿ng Viá»‡t!" };
        }

        // Táº¡o slug tá»± Ä‘á»™ng (TrÃ¡nh lá»—i tiáº¿ng Viá»‡t vÃ  kÃ½ tá»± Ä‘áº·c biá»‡t)
        const slug = title.toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/Ä‘/g, "d")
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-+|-+$/g, "")
            + "-" + Date.now();

        const category = (formData.get("category") as string) || "TIN_TUC";
        const status = (formData.get("status") as string) || "PUBLISHED";
        const summary = (formData.get("summary") as string) || "";
        const content = (formData.get("content") as string) || "";

        // ðŸŒ Láº¥y báº£n tiáº¿ng Anh (tá»« auto-translate) - Cháº¥p nháº­n rá»—ng náº¿u chÆ°a dá»‹ch
        const title_en = (formData.get("title_en") as string) || null;
        const summary_en = (formData.get("summary_en") as string) || null;
        const content_en = (formData.get("content_en") as string) || null;

        let imageUrl = "";
        const imageFile = formData.get("image_file") as File | null;

        // Xá»­ lÃ½ áº£nh (náº¿u cÃ³ táº£i lÃªn má»›i)
        if (imageFile && imageFile.size > 0) {
            try {
                if (idStr && idStr !== "undefined" && idStr !== "null") {
                    const old = await (prisma as any).article.findUnique({ where: { id: parseInt(idStr) } });
                    if (old?.imageUrl) {
                        try { await uploadService.deleteFile(old.imageUrl); } catch {}
                    }
                }

                const currentUser = await getCurrentUser();
                imageUrl = await uploadService.uploadFile(imageFile, "articles", "CMS_ARTICLE", currentUser?.id);
            } catch (imgErr) {
                console.error("Lá»—i xá»­ lÃ½ áº£nh:", imgErr);
                // KhÃ´ng return lá»—i á»Ÿ Ä‘Ã¢y Ä‘á»ƒ váº«n lÆ°u Ä‘Æ°á»£c ná»™i dung náº¿u chá»‰ lá»—i áº£nh
            }
        }

        const dataToSave: any = {
            title,
            category,
            status,
            summary,
            content,
            title_en,
            summary_en,
            content_en,
        };

        // Chá»‰ cáº­p nháº­t slug khi táº¡o má»›i (TrÃ¡nh lÃ m há»ng SEO bÃ i cÅ© náº¿u Ä‘á»•i tiÃªu Ä‘á»)
        if (!idStr || idStr === "undefined" || idStr === "null") {
            dataToSave.slug = slug;
        }

        if (imageUrl) dataToSave.imageUrl = imageUrl;

        const parsedId = (idStr && idStr !== "undefined" && idStr !== "null") ? parseInt(idStr) : null;
        let article;
        if (parsedId) {
            article = await (prisma as any).article.update({
                where: { id: parsedId },
                data: dataToSave
            });
        } else {
            article = await (prisma as any).article.create({
                data: dataToSave
            });
        }

        

        revalidatePath("/admin/cms/articles");
        revalidatePath("/news");
        return { success: true };
    } catch (error: any) {
        console.error("CRITICAL ARTICLE ACTION ERROR:", error);
        return { success: false, error: `Lá»—i há»‡ thá»‘ng: ${error.message}` };
    }
}

// 3. XÃ³a bÃ i viáº¿t
export async function deleteArticle(id: number | string) {
    if (!(await checkPermission())) return { success: false, error: "KhÃ´ng cÃ³ quyá»n!" };
    try {
        const parsedId = typeof id === "string" ? parseInt(id) : id;
        const article = await (prisma as any).article.findUnique({ where: { id: parsedId } });
        if (article?.imageUrl) {
            try { await fs.unlink(path.join(process.cwd(), "public", article.imageUrl)); } catch {}
        }
        const title = article?.title || "BÃ i viáº¿t";
        await (prisma as any).article.delete({ where: { id: parsedId } });
        revalidatePath("/admin/cms/articles");

        

        return { success: true };
    } catch (error: any) { return { success: false, error: error.message }; }
}

// 4. Toggle tráº¡ng thÃ¡i (ÄÃ£ Ä‘á»“ng bá»™ Hoáº¡t Ä‘á»™ng/ÄÃ£ áº©n)
export async function toggleArticleStatus(id: number | string, currentStatus: string) {
    if (!(await checkPermission())) return { success: false, error: "KhÃ´ng cÃ³ quyá»n!" };
    try {
        const parsedId = typeof id === "string" ? parseInt(id) : id;
        const newStatus = currentStatus === "PUBLISHED" ? "DRAFT" : "PUBLISHED";
        const updated = await (prisma as any).article.update({ 
            where: { id: parsedId }, 
            data: { status: newStatus } 
        });
        revalidatePath("/admin/cms/articles");

        

        return { success: true, newStatus };
    } catch (error: any) { return { success: false, error: error.message }; }
}

// 5. LÆ°u cáº¥u hÃ¬nh trang Tin tá»©c & Dá»± Ã¡n
export async function saveArticlePageConfigAction(config: any) {
    if (!(await checkPermission())) return { success: false, error: "KhÃ´ng cÃ³ quyá»n!" };
    try {
        await prisma.siteSetting.upsert({
            where: { key: "ARTICLES_PAGE_CONFIG" },
            update: { value: JSON.stringify(config) },
            create: { key: "ARTICLES_PAGE_CONFIG", value: JSON.stringify(config) }
        });
        revalidatePath("/admin/cms/articles");
        revalidatePath("/news");
        return { success: true };
    } catch (error: any) {
        console.error("Lá»—i lÆ°u cáº¥u hÃ¬nh bÃ i viáº¿t:", error);
        return { success: false, error: error.message };
    }
}

// 6. Láº¥y cáº¥u hÃ¬nh trang Tin tá»©c & Dá»± Ã¡n
export async function getArticlePageConfigAction() {
    try {
        const setting = await prisma.siteSetting.findUnique({
            where: { key: "ARTICLES_PAGE_CONFIG" }
        });
        if (!setting) return null;
        return JSON.parse(setting.value);
    } catch (error) {
        console.error("Lá»—i láº¥y cáº¥u hÃ¬nh bÃ i viáº¿t:", error);
        return null;
    }
}

// 7. Táº£i áº£nh banner trang Tin tá»©c & Dá»± Ã¡n
export async function uploadArticleBannerAction(formData: FormData) {
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
        console.error("Lá»—i táº£i áº£nh bÃ i viáº¿t:", error);
        return { error: error.message };
    }
}

