// src/actions/settings.ts
"use server";

import prisma from "@/lib/prisma";
import { revalidatePath, revalidateTag } from "next/cache";
import { unstable_cache } from "next/cache";
import { formatSystemMessage, sendTelegramMessage } from "@/lib/telegram";
import { hasRole } from "@/lib/auth";


async function checkPermission() {
    return await hasRole("ADMIN", "GIAM_DOC");
}

// --- QUÃ¡ÂºÂ¢N LÃƒÂ LOGO ---
// Cache logo vÃ¡Â»â€ºi tag Ã„â€˜Ã¡Â»Æ’ cÃƒÂ³ thÃ¡Â»Æ’ invalidate khi cÃ¡ÂºÂ­p nhÃ¡ÂºÂ­t
export const getSiteLogoAction = unstable_cache(
    async () => {
        try {
            const logo = await prisma.siteImage.findUnique({ where: { key: "SITE_LOGO" } });
            return logo?.imageUrl || null;
        } catch (error) {
            return null;
        }
    },
    ["site-logo"],
    { tags: ["site-logo"], revalidate: 3600 } // Cache 1 giÃ¡Â»Â, invalidate khi logo thay Ã„â€˜Ã¡Â»â€¢i
);

export async function saveSiteLogoAction(base64Image: string) {
    if (!(await checkPermission())) return { error: "BÃ¡ÂºÂ¡n khÃƒÂ´ng cÃƒÂ³ quyÃ¡Â»Ân!" };
    try {
        await prisma.siteImage.upsert({
            where: { key: "SITE_LOGO" },
            update: { imageUrl: base64Image, updatedAt: new Date() },
            create: { key: "SITE_LOGO", name: "Logo Header", imageUrl: base64Image }
        });
        revalidateTag("site-logo", {}); // Invalidate cache logo
        revalidatePath("/", "layout"); 

        const { getSession } = await import("@/lib/auth");
        const session = await getSession();
        

        return { success: true };
    } catch (error) {
        return { error: "KhÃƒÂ´ng thÃ¡Â»Æ’ lÃ†Â°u Logo vÃƒÂ o CÃ†Â¡ sÃ¡Â»Å¸ dÃ¡Â»Â¯ liÃ¡Â»â€¡u." };
    }
}

export async function deleteSiteLogoAction() {
    if (!(await checkPermission())) return { error: "BÃ¡ÂºÂ¡n khÃƒÂ´ng cÃƒÂ³ quyÃ¡Â»Ân!" };
    try {
        await prisma.siteImage.deleteMany({ where: { key: "SITE_LOGO" } });
        revalidateTag("site-logo", {}); // Invalidate cache logo
        revalidatePath("/", "layout");
        return { success: true };
    } catch (error) { return { error: "LÃ¡Â»â€”i xÃƒÂ³a Logo." }; }
}

// --- QUÃ¡ÂºÂ¢N LÃƒ  THÃƒâ€NG TIN CÃƒâ€NG TY ---
export const getCompanyInfoAction = unstable_cache(
    async () => {
        try { 
            const setting = await prisma.siteSetting.findUnique({ where: { key: "COMPANY_INFO" } });
            if (setting) return JSON.parse(setting.value);
            return null;
        } catch (error) { return null; }
    },
    ["company-info"],
    { tags: ["company-info"], revalidate: 3600 }
);

export async function upsertCompanyInfoAction(data: any) {
    if (!(await checkPermission())) return { error: "BÃ¡ÂºÂ¡n khÃƒÂ´ng cÃƒÂ³ quyÃ¡Â» n!" };
    try {
        await prisma.siteSetting.upsert({
            where: { key: "COMPANY_INFO" },
            update: { value: JSON.stringify(data) },
            create: { key: "COMPANY_INFO", value: JSON.stringify(data) }
        });
        revalidatePath("/", "layout"); // Invalidate cache
        revalidatePath("/", "layout"); 
        return { success: true };
    } catch (error) { return { error: "LÃ¡Â»â€”i lÃ†Â°u thÃƒÂ´ng tin cÃƒÂ´ng ty." }; }
}

export async function clearCompanyInfoAction() {
    if (!(await checkPermission())) return { error: "BÃ¡ÂºÂ¡n khÃƒÂ´ng cÃƒÂ³ quyÃ¡Â» n!" };
    try {
        await prisma.siteSetting.deleteMany({ where: { key: "COMPANY_INFO" } });
        revalidatePath("/", "layout"); // Invalidate cache
        revalidatePath("/", "layout");
        return { success: true };
    } catch (error) { return { error: "LÃ¡Â»â€”i lÃƒÂ m sÃ¡ÂºÂ¡ch dÃ¡Â»Â¯ liÃ¡Â»â€¡u." }; }
}
export async function getBannersAction() {
    const data = await prisma.siteSetting.findMany({
        where: { key: { startsWith: 'BANNER_' } }
    });
    const banners: Record<string, string> = {};
    data.forEach(item => { banners[item.key] = item.value; });
    return banners;
}

export async function saveBannerAction(key: string, base64Image: string) {
    if (!(await checkPermission())) return { error: "BÃ¡ÂºÂ¡n khÃƒÂ´ng cÃƒÂ³ quyÃ¡Â»Ân!" };
    try {
        await prisma.siteSetting.upsert({
            where: { key },
            update: { value: base64Image },
            create: { key, value: base64Image }
        });
        return { success: true };
    } catch (error: any) {
        return { error: "LÃ¡Â»â€”i khi lÃ†Â°u Ã¡ÂºÂ£nh" };
    }
}

export async function deleteBannerAction(key: string) {
    try {
        await prisma.siteSetting.delete({ where: { key } });
        return { success: true };
    } catch (error) {
        return { success: true }; 
    }
}

// --- KIÃ¡Â»â€šM TRA KÃ¡ÂºÂ¾T NÃ¡Â»ÂI TELEGRAM ---
export async function testTelegramAction() {
    try {
        const msg = formatSystemMessage("KIÃ¡Â»â€šM TRA KÃ¡ÂºÂ¾T NÃ¡Â»ÂI", [
            "HÃ¡Â»â€¡ thÃ¡Â»â€˜ng thÃƒÂ´ng bÃƒÂ¡o Maintech Ã„â€˜ÃƒÂ£ sÃ¡ÂºÂµn sÃƒÂ ng!",
            "CÃ¡ÂºÂ¥u hÃƒÂ¬nh Token vÃƒÂ  Chat ID hoÃƒÂ n toÃƒÂ n chÃƒÂ­nh xÃƒÂ¡c.",
            `HÃƒÂ nh Ã„â€˜Ã¡Â»â„¢ng: NhÃ¡ÂºÂ¥n nÃƒÂºt Test tÃ¡Â»Â« trang CÃ¡ÂºÂ¥u hÃƒÂ¬nh`
        ]);
        const res = await sendTelegramMessage(msg);
        if (res) return { success: true };
        return { error: "KhÃƒÂ´ng thÃ¡Â»Æ’ gÃ¡Â»Â­i tin nhÃ¡ÂºÂ¯n. Vui lÃƒÂ²ng kiÃ¡Â»Æ’m tra Token vÃƒÂ  Chat ID trong file .env" };
    } catch (error: any) {
        return { error: error.message };
    }
}

