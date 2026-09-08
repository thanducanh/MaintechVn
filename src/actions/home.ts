// src/actions/home.ts
"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import fs from "fs/promises";
import path from "path";
import { uploadService } from "@/lib/upload-service";
import { getCurrentUser } from "@/lib/auth";

async function checkPermission() {
    const { hasRole } = await import("@/lib/auth");
    return await hasRole("ADMIN", "GIAM_DOC", "QUAN_LY");
}

export async function getHomeConfigAction() {
    try {
        const homeConfig = await prisma.article.findFirst({
            where: { category: "TRANG_CHU" },
            orderBy: { updatedAt: "desc" }
        });
        return homeConfig || null;
    } catch (error) {
        console.error("Failed to load homepage config:", error);
        return null;
    }
}

export async function saveHomeConfigAction(formData: FormData) {
    const hasPermission = await checkPermission();
    if (!hasPermission) return { success: false, error: "Bạn không có quyền!" };

    try {
        const slug = "trang-chu";

        // Find existing articles with category TRANG_CHU to update or heal duplicates
        const existingArticles = await prisma.article.findMany({
            where: { category: "TRANG_CHU" },
            orderBy: { updatedAt: "desc" }
        });

        let existing = existingArticles[0] || null;

        // DB Self-healing: Delete duplicates and keep only the latest one
        if (existingArticles.length > 1) {
            const idsToDelete = existingArticles.slice(1).map(a => a.id);
            await prisma.article.deleteMany({
                where: { id: { in: idsToDelete } }
            });
        }

        // Helper to resolve form fields
        const getFormString = (name: string, fallback: string = "") => {
            const val = formData.get(name);
            return val !== null ? val.toString() : fallback;
        };

        const getFormBool = (name: string, fallback: boolean = false) => {
            const val = formData.get(name);
            if (val === null) return fallback;
            return val === "true" || val === "on";
        };

        const getFormNumber = (name: string, fallback: number = 0) => {
            const val = formData.get(name);
            if (val === null) return fallback;
            const parsed = parseFloat(val.toString());
            return isNaN(parsed) ? fallback : parsed;
        };

        const getFormJsonArray = (name: string, fallback: any[] = []) => {
            const val = formData.get(name);
            if (val === null) return fallback;
            try {
                return JSON.parse(val.toString());
            } catch (e) {
                return fallback;
            }
        };

        // File upload helper
        const handleLocalUpload = async (fileKey: string, pathKey: string) => {
            const file = formData.get(fileKey) as File | null;
            let existingPath = "";
            if (formData.has(pathKey)) {
                existingPath = formData.get(pathKey)?.toString() || "";
            } else {
                existingPath = existing ? (existing as any)[pathKey] || "" : "";
            }

            // Defensively prevent temporary blob URLs from being stored
            if (existingPath.startsWith("blob:") || existingPath.includes("blob:")) {
                existingPath = existing ? (existing as any)[pathKey] || "" : "";
            }

            if (file && typeof file.size === "number" && file.size > 0 && typeof file.arrayBuffer === "function") {
                if (existingPath && existingPath.startsWith('/uploads/')) {
                    try { await uploadService.deleteFile(existingPath); } catch (e) {}
                }
                const currentUser = await getCurrentUser();
                return await uploadService.uploadFile(file, "home", "CMS_HOME", currentUser?.id);
            }
            return existingPath;
        };

        let existingHeroBg = "";
        let existingHeroVideo = "";
        let existingHeroSlider: string[] = [];
        let existingHistoryVideo = "";
        try {
            if (existing && existing.content) {
                const parsed = JSON.parse(existing.content);
                existingHeroBg = parsed.hero?.backgroundImage || "";
                existingHeroVideo = parsed.hero?.videoUrl || "";
                existingHeroSlider = Array.isArray(parsed.hero?.sliderImages) ? parsed.hero.sliderImages.slice(0, 5) : [];
                existingHistoryVideo = parsed.history?.videoUrl || parsed.history?.videoSource || "";
            }
        } catch (e) {}

        const handleHeroBgUpload = async () => {
            const file = formData.get("hero_bg_file") as File | null;
            let existingPath = formData.get("hero_background_image")?.toString() || existingHeroBg || "";
            
            // Defensively prevent temporary blob URLs from being stored
            if (existingPath.startsWith("blob:") || existingPath.includes("blob:")) {
                existingPath = existingHeroBg;
            }

            // Check if explicitly deleted
            const isDeleted = formData.get("hero_bg_deleted") === "true";
            if (isDeleted) {
                if (existingPath && existingPath.startsWith('/uploads/')) {
                    try { await uploadService.deleteFile(existingPath); } catch (e) {}
                }
                return "";
            }

            if (file && typeof file.size === "number" && file.size > 0 && typeof file.arrayBuffer === "function") {
                if (existingPath && existingPath.startsWith('/uploads/')) {
                    try { await uploadService.deleteFile(existingPath); } catch (e) {}
                }
                const currentUser = await getCurrentUser();
                return await uploadService.uploadFile(file, "home", "CMS_HOME", currentUser?.id);
            }
            return existingPath;
        };

        const handleHeroVideoUpload = async () => {
            const file = formData.get("hero_video_file") as File | null;
            let existingPath = formData.get("hero_video_url")?.toString() || existingHeroVideo || "";
            
            // Defensively prevent temporary blob URLs from being stored
            if (existingPath.startsWith("blob:") || existingPath.includes("blob:")) {
                existingPath = existingHeroVideo;
            }

            // Check if explicitly deleted
            const isDeleted = formData.get("hero_video_deleted") === "true";
            if (isDeleted) {
                if (existingPath && existingPath.startsWith('/uploads/')) {
                    try { await uploadService.deleteFile(existingPath); } catch (e) {}
                }
                return "";
            }

            if (file && typeof file.size === "number" && file.size > 0 && typeof file.arrayBuffer === "function") {
                if (existingPath && existingPath.startsWith('/uploads/')) {
                    try { await uploadService.deleteFile(existingPath); } catch (e) {}
                }
                const currentUser = await getCurrentUser();
                return await uploadService.uploadFile(file, "home", "CMS_HOME", currentUser?.id);
            }
            return existingPath;
        };

        const finalHeroBgPath = await handleHeroBgUpload();
        const finalHeroVideoPath = await handleHeroVideoUpload();
        const sliderFiles = formData.getAll("hero_slider_files").filter((value): value is File => value instanceof File && value.size > 0);
        const sliderExistingRaw = formData.get("hero_slider_existing")?.toString() || "";
        let finalHeroSlider = sliderExistingRaw ? JSON.parse(sliderExistingRaw) : existingHeroSlider;
        if (!Array.isArray(finalHeroSlider)) finalHeroSlider = existingHeroSlider;
        if (sliderFiles.length) {
            const currentUser = await getCurrentUser();
            const uploaded = await Promise.all(sliderFiles.slice(0, 5).map((file) => uploadService.uploadFile(file, "home", "CMS_HOME", currentUser?.id)));
            finalHeroSlider = [...finalHeroSlider, ...uploaded].slice(0, 5);
        }
        const finalImagePath = await handleLocalUpload("image_file", "imageUrl");
        const finalHeaderLogoPath = await handleLocalUpload("header_logo_file", "header_logo_url");
        const historyVideoPath = await handleLocalUpload("history_video_file", "history_video_url");
        const finalHistoryVideoPath = historyVideoPath && !historyVideoPath.startsWith("blob:") ? historyVideoPath : existingHistoryVideo;
        const historyMediaRemoved = formData.get("history_media_removed") === "true";
        const historyImagePath = historyMediaRemoved ? "" : getFormString("history_image");
        const historyVideo = historyMediaRemoved ? "" : (formData.get("history_video_file") instanceof File ? finalHistoryVideoPath : (historyImagePath ? "" : finalHistoryVideoPath));
        const historyBackgroundRemoved = formData.get("history_background_removed") === "true";

        // Construct JSON content object
        const contentObj = {
            topbar: {
                email: getFormString("topbar_email", "sales@maintech.vn"),
                hotline: getFormString("topbar_hotline"),
                address: getFormString("topbar_address", "TP. Hồ Chí Minh"),
                twitter: getFormString("topbar_twitter"),
                whatsapp: getFormString("topbar_whatsapp"),
                zalo: getFormString("topbar_zalo")
                ,navLinks: (() => { try { const value = JSON.parse(getFormString("topbar_nav_links", "[]")); return Array.isArray(value) ? value.slice(0, 8) : []; } catch { return []; } })()
            },
            header: {
                logoUrl: finalHeaderLogoPath,
                brandName: getFormString("header_brand_name", "maintech vietnam."),
                fontFamily: getFormString("header_font_family", "sans")
            },
            hero: {
                active: getFormBool("hero_active", true),
                badge_vi: getFormString("hero_badge_vi"),
                badge_en: getFormString("hero_badge_en"),
                title1_vi: getFormString("hero_title1_vi"),
                title1_en: getFormString("hero_title1_en"),
                title2_vi: getFormString("hero_title2_vi"),
                title2_en: getFormString("hero_title2_en"),
                desc_vi: getFormString("hero_desc_vi"),
                desc_en: getFormString("hero_desc_en"),
                btn1_text_vi: getFormString("hero_btn1_text_vi"),
                btn1_text_en: getFormString("hero_btn1_text_en"),
                btn1_link: getFormString("hero_btn1_link"),
                btn2_text_vi: getFormString("hero_btn2_text_vi"),
                btn2_text_en: getFormString("hero_btn2_text_en"),
                btn2_link: getFormString("hero_btn2_link"),
                backgroundImage: finalHeroBgPath,
                videoUrl: finalHeroVideoPath,
                sliderImages: finalHeroSlider,
                overlayOpacity: getFormNumber("hero_overlay_opacity", 0.4)
            },
            intro: {
                active: getFormBool("intro_active", true),
                main_image: getFormString("intro_main_image"),
                badge_image: getFormString("intro_badge_image"),
                director_name: getFormString("intro_director_name", "Savannah Nguyen"),
                director_name_en: getFormString("intro_director_name_en", "Savannah Nguyen"),
                director_role: getFormString("intro_director_role", "CEO & Founder of Manit"),
                director_role_en: getFormString("intro_director_role_en", "CEO & Founder of Manit"),
                signature_text: getFormString("intro_signature_text", "Savannah Nguyen"),
                badge_vi: getFormString("intro_badge_vi"),
                badge_en: getFormString("intro_badge_en"),
                title_vi: getFormString("intro_title_vi"),
                title_en: getFormString("intro_title_en"),
                subtitle_vi: getFormString("intro_subtitle_vi"),
                subtitle_en: getFormString("intro_subtitle_en"),
                lead_vi: getFormString("intro_lead_vi"),
                lead_en: getFormString("intro_lead_en"),
                desc_vi: getFormString("intro_desc_vi"),
                desc_en: getFormString("intro_desc_en"),
                exp_value: getFormString("intro_exp_value"),
                exp_label_vi: getFormString("intro_exp_label_vi"),
                exp_label_en: getFormString("intro_exp_label_en"),
                proj_value: getFormString("intro_proj_value"),
                proj_label_vi: getFormString("intro_proj_label_vi"),
                proj_label_en: getFormString("intro_proj_label_en"),
                badges_vi: getFormJsonArray("intro_badges_vi"),
                badges_en: getFormJsonArray("intro_badges_en")
            },
            services: {
                badge_vi: getFormString("services_badge_vi"),
                badge_en: getFormString("services_badge_en"),
                title_vi: getFormString("services_title_vi"),
                title_en: getFormString("services_title_en"),
                desc_vi: getFormString("services_desc_vi"),
                desc_en: getFormString("services_desc_en"),
                cards: getFormJsonArray("services_cards")
            },
            history: {
                badge_vi: getFormString("history_badge_vi"),
                badge_en: getFormString("history_badge_en"),
                title_vi: getFormString("history_title_vi"),
                title_en: getFormString("history_title_en"),
                desc_vi: getFormString("history_desc_vi"),
                desc_en: getFormString("history_desc_en"),
                button_vi: getFormString("history_button_vi"),
                button_en: getFormString("history_button_en"),
                button_link: getFormString("history_button_link"),
                image: historyImagePath,
                posterUrl: historyImagePath,
                videoUrl: historyVideo,
                backgroundImage: historyBackgroundRemoved ? "" : getFormString("history_background_image"),
                overlayOpacity: getFormNumber("history_overlay_opacity", 85)
            },
            team: {
                badge_vi: getFormString("team_badge_vi"),
                badge_en: getFormString("team_badge_en"),
                title_vi: getFormString("team_title_vi"),
                title_en: getFormString("team_title_en"),
                members: getFormJsonArray("team_members")
            },
            process: {
                steps: (() => { try { const value = JSON.parse(getFormString("process_steps", "[]")); return Array.isArray(value) ? value : []; } catch { return []; } })()
            },
            footer: {
                slogan_vi: getFormString("footer_slogan_vi"), slogan_en: getFormString("footer_slogan_en"),
                facebook: getFormString("footer_facebook"), linkedin: getFormString("footer_linkedin"), youtube: getFormString("footer_youtube"), twitter: getFormString("footer_twitter"), whatsapp: getFormString("footer_whatsapp"), zalo: getFormString("footer_zalo"),
                nav_title_vi: getFormString("footer_nav_title_vi", "Điều hướng"), nav_title_en: getFormString("footer_nav_title_en", "Navigation"),
                office: getFormString("footer_office"), factory: getFormString("footer_factory"), phone: getFormString("footer_phone"), email: getFormString("footer_email"),
                copyright_year: getFormString("footer_copyright_year", "2026"), tax_id: getFormString("footer_tax_id"), representative_vi: getFormString("footer_representative_vi"), representative_en: getFormString("footer_representative_en")
            },
            products: {
                active: getFormBool("products_active", true),
                badge_vi: getFormString("products_badge_vi"),
                badge_en: getFormString("products_badge_en"),
                title_vi: getFormString("products_title_vi"),
                title_en: getFormString("products_title_en"),
                desc_vi: getFormString("products_desc_vi"),
                desc_en: getFormString("products_desc_en"),
                limit: getFormNumber("products_limit", 4),
                selected_ids: getFormJsonArray("products_selected_ids")
            },
            news: {
                active: getFormBool("news_active", true),
                badge_vi: getFormString("news_badge_vi"),
                badge_en: getFormString("news_badge_en"),
                title_vi: getFormString("news_title_vi"),
                title_en: getFormString("news_title_en"),
                limit: getFormNumber("news_limit", 3),
                selected_ids: getFormJsonArray("news_selected_ids")
            },
            partners: {
                active: getFormBool("partners_active", true),
                badge_vi: getFormString("partners_badge_vi"),
                badge_en: getFormString("partners_badge_en"),
                desc_vi: getFormString("partners_desc_vi"),
                desc_en: getFormString("partners_desc_en")
            },
            cta: {
                active: getFormBool("cta_active", true),
                badge_vi: getFormString("cta_badge_vi"),
                badge_en: getFormString("cta_badge_en"),
                title_vi: getFormString("cta_title_vi"),
                title_en: getFormString("cta_title_en"),
                desc_vi: getFormString("cta_desc_vi"),
                desc_en: getFormString("cta_desc_en"),
                btn1_text_vi: getFormString("cta_btn1_text_vi"),
                btn1_text_en: getFormString("cta_btn1_text_en"),
                btn1_link: getFormString("cta_btn1_link"),
                btn2_text_vi: getFormString("cta_btn2_text_vi"),
                btn2_text_en: getFormString("cta_btn2_text_en"),
                btn2_link: getFormString("cta_btn2_link"),
                trust_items_vi: getFormJsonArray("cta_trust_items_vi"),
                trust_items_en: getFormJsonArray("cta_trust_items_en")
            }
        }; // Construct JSON content object ends

        const dataPayload: any = {
            title: "Trang chủ",
            category: "TRANG_CHU",
            status: "XUẤT BẢN",
            content: JSON.stringify(contentObj),
            imageUrl: finalImagePath
        };

        await prisma.article.upsert({
            where: { slug },
            update: { ...dataPayload, updatedAt: new Date() },
            create: { ...dataPayload, slug },
        });

        revalidatePath("/");
        revalidatePath("/admin/cms/home");

        return { success: true, heroBgPath: finalHeroBgPath, heroVideoPath: finalHeroVideoPath, imagePath: finalImagePath };
    } catch (error: any) {
        console.error("Failed to save homepage config:", error);
        return { success: false, error: "Lỗi hệ thống: " + error.message };
    }
}

export const getHomepageConfigAction = getHomeConfigAction;
export const updateHomepageConfigAction = saveHomeConfigAction;
