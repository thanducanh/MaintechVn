// 📍 File: src/actions/about.ts
"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { uploadService } from "@/lib/upload-service";
import { getCurrentUser } from "@/lib/auth";

async function checkPermission() {
    const { hasRole } = await import("@/lib/auth");
    return await hasRole("ADMIN", "GIAM_DOC", "QUAN_LY");
}

export async function upsertAboutAction(formData: FormData) {
    const hasPermission = await checkPermission();
    if (!hasPermission) return { success: false, error: "Bạn không có quyền!" };

    try {
        const slug = "gioi-thieu-maintech";
        
        // Fetch all GIOI_THIEU articles to detect duplicates
        const existingArticles = await prisma.article.findMany({
            where: { category: "GIOI_THIEU" },
            orderBy: { updatedAt: 'desc' }
        });

        let existing = existingArticles[0] || null;

        // DB Self-healing: Delete duplicates and keep only the latest one
        if (existingArticles.length > 1) {
            const idsToDelete = existingArticles.slice(1).map(a => a.id);
            await prisma.article.deleteMany({
                where: { id: { in: idsToDelete } }
            });
        }

        // Parse the stored JSON before any helper reads from it.
        let existingContent: any = {};
        if (existing?.content) {
            try {
                existingContent = JSON.parse(existing.content);
            } catch (e) {
                console.error("Failed to parse existing content JSON:", e);
            }
        }

        // Helper to get text fields safely (avoid overwrite if not sent)
        const getDbField = (name: string, fallback: string) => {
            const values = formData.getAll(name);
            const val = values.length ? values[values.length - 1] : null;
            if (val === null) {
                return existingContent[name] !== undefined
                    ? existingContent[name]
                    : existing ? (existing as any)[name] ?? fallback : fallback;
            }
            return val.toString();
        };

        const title = getDbField("title", "");
        const title_en = getDbField("title_en", "");
        const hero_subtitle = getDbField("hero_subtitle", "");
        const intro_lead = getDbField("intro_lead", "");
        const intro_lead_en = getDbField("intro_lead_en", "");
        const intro_box = getDbField("intro_box", "");
        const intro_box_en = getDbField("intro_box_en", "");
        const intro_footer = getDbField("intro_footer", "");
        const intro_footer_en = getDbField("intro_footer_en", "");
        const intro_content_1 = getDbField("intro_content_1", "");
        const intro_content_2 = getDbField("intro_content_2", "");
        let intro_content_1_en = "";
        let intro_content_2_en = "";
        const vision = getDbField("vision", "");
        const vision_en = getDbField("vision_en", "");
        const mission = getDbField("mission", "");
        const mission_en = getDbField("mission_en", "");

        // Helpers to resolve JSON content fields
        const getJsonField = (name: string, fallback: any) => {
            const values = formData.getAll(name);
            const val = values.length ? values[values.length - 1] : null;
            if (val === null) {
                return existingContent[name] !== undefined ? existingContent[name] : fallback;
            }
            return val.toString();
        };
        intro_content_1_en = getJsonField("intro_content_1_en", "");
        intro_content_2_en = getJsonField("intro_content_2_en", "");

        const getJsonNumberField = (name: string, fallback: number) => {
            const val = formData.get(name);
            if (val === null) {
                return existingContent[name] !== undefined ? existingContent[name] : fallback;
            }
            return parseFloat(val.toString());
        };

        const getJsonBoolField = (name: string, fallback: boolean) => {
            const val = formData.get(name);
            if (val === null) {
                return existingContent[name] !== undefined ? existingContent[name] : fallback;
            }
            return val === "true" || val === "on";
        };

        // Đóng gói thông tin pháp lý và các phần mở rộng của Banner & CTA
        const tax_id = getJsonField("tax_id", "");
        const representative_name = getJsonField("representative_name", "");
        const representative_title = getJsonField("representative_title", "");
        const core_values = getJsonField("core_values", "");
        const core_values_en = getJsonField("core_values_en", "");
        const legal_desc = getJsonField("legal_desc", "");
        const legal_desc_en = getJsonField("legal_desc_en", "");
        const intro_badge = getJsonField("intro_badge", "");
        const intro_badge_en = getJsonField("intro_badge_en", "");
        const intro_highlight = getJsonField("intro_highlight", "");
        const intro_highlight_en = getJsonField("intro_highlight_en", "");
        const representative_name_en = getJsonField("representative_name_en", "");
        const representative_title_en = getJsonField("representative_title_en", "");
        const established_year = getJsonField("established_year", "2020");
        const established_year_en = getJsonField("established_year_en", established_year);
        const core_business = getJsonField("core_business", "Dịch vụ kỹ thuật công nghiệp");
        const core_business_en = getJsonField("core_business_en", "Industrial Technical Services");
        const compliance_title = getJsonField("compliance_title", "Tuân thủ & Trách nhiệm");
        const compliance_title_en = getJsonField("compliance_title_en", "Compliance & Responsibility");
        const compliance_desc = getJsonField("compliance_desc", "");
        const compliance_desc_en = getJsonField("compliance_desc_en", "");
        const compliance_hotline = getJsonField("compliance_hotline", "tel:0918458399");
        const section_badge_color = getJsonField("section_badge_color", "#0f172a");
        const legal_badge = getJsonField("legal_badge", "");
        const legal_badge_en = getJsonField("legal_badge_en", "");
        const legal_title = getJsonField("legal_title", "");
        const legal_title_en = getJsonField("legal_title_en", "");
        const legal_badge_visible = getJsonBoolField("legal_badge_visible", true);
        const existingStaffHeader = existingContent.staff_header && typeof existingContent.staff_header === "object" ? existingContent.staff_header : {};
        const staff_header = {
            badge_vi: getJsonField("staff_badge_vi", existingStaffHeader.badge_vi || "ĐỘI NGŨ CHUYÊN GIA"),
            badge_en: getJsonField("staff_badge_en", existingStaffHeader.badge_en || "EXPERT TEAM"),
            badge_color: getJsonField("staff_badge_color", "#C8102E"),
            badge_size: getJsonField("staff_badge_size", "12px"),
            title_vi: getJsonField("staff_title_vi", existingStaffHeader.title_vi || "NĂNG LỰC NHÂN SỰ"),
            title_en: getJsonField("staff_title_en", existingStaffHeader.title_en || "OUR EXPERT TEAM"),
            title_color: getJsonField("staff_title_color", existingStaffHeader.title_color || "#0B1221"),
            title_size: getJsonField("staff_title_size", "56px")
        };
        const stat_years = getJsonNumberField("stat_years", 15);
        const stat_projects = getJsonNumberField("stat_projects", 500);
        const legacyStaff = existingContent.staff_members ?? existingContent.staffMembers ?? existingContent.staff ?? existingContent.team_members ?? existingContent.team?.members ?? [];
        const staff_members_raw = getJsonField("staff_members", JSON.stringify(legacyStaff));
        let staff_members: any[] = [];
        try { staff_members = JSON.parse(staff_members_raw || "[]"); } catch { staff_members = existingContent.staff_members || []; }
        if (staff_members.length === 0 && Array.isArray(legacyStaff) && legacyStaff.length > 0) staff_members = legacyStaff;
        staff_members = Array.isArray(staff_members) ? staff_members.map((member: any) => ({
            name: member?.name || member?.name_vi || "",
            name_en: member?.name_en || "",
            position: { vi: member?.role_vi || member?.position_vi || member?.position?.vi || member?.position || "", en: member?.role_en || member?.position_en || member?.position?.en || member?.position || "" },
            image: member?.image || "",
            certificates: Array.isArray(member?.certificates) ? member.certificates : (Array.isArray(member?.credentials) ? member.credentials : [])
        })) : [];

        // Banner fields
        const banner_badge = getJsonField("banner_badge", "");
        const banner_badge_en = getJsonField("banner_badge_en", "");
        const banner_title = getJsonField("banner_title", "");
        const banner_title_en = getJsonField("banner_title_en", "");
        const banner_desc = getJsonField("banner_desc", "");
        const banner_desc_en = getJsonField("banner_desc_en", "");
        const banner_opacity = getJsonNumberField("banner_opacity", 0.6);

        // CTA fields
        const cta_active = getJsonBoolField("cta_active", true);
        const cta_badge = getJsonField("cta_badge", "");
        const cta_badge_en = getJsonField("cta_badge_en", "");
        const cta_title = getJsonField("cta_title", "");
        const cta_title_en = getJsonField("cta_title_en", "");
        const cta_title_line1 = getJsonField("cta_title_line1", cta_title);
        const cta_title_line1_en = getJsonField("cta_title_line1_en", cta_title_en);
        const cta_title_line1_color = getJsonField("cta_title_line1_color", "#0f172a");
        const cta_title_line1_size = getJsonField("cta_title_line1_size", "48px");
        const cta_title_line2 = getJsonField("cta_title_line2", "");
        const cta_title_line2_en = getJsonField("cta_title_line2_en", "");
        const cta_title_line2_color = getJsonField("cta_title_line2_color", "#C8102E");
        const cta_title_line2_size = getJsonField("cta_title_line2_size", "48px");
        const cta_desc = getJsonField("cta_desc", "");
        const cta_desc_en = getJsonField("cta_desc_en", "");
        const cta_btn_text = getJsonField("cta_btn_text", "");
        const cta_btn_text_en = getJsonField("cta_btn_text_en", "");
        const cta_btn_link = getJsonField("cta_btn_link", "");
        // Use only About-specific workflow fields; homepage `process` is a separate dataset.
        const aboutWorkflowHeader = existingContent.about_workflow_header && typeof existingContent.about_workflow_header === "object" ? existingContent.about_workflow_header : {};
        const process_json = getJsonField("process_json", existingContent.about_workflow_steps ? JSON.stringify({ steps: existingContent.about_workflow_steps }) : "{}");
        const process_badge = getJsonField("process_badge", aboutWorkflowHeader.badge_vi || "QUY TRÌNH CHUYÊN NGHIỆP");
        const process_badge_en = getJsonField("process_badge_en", aboutWorkflowHeader.badge_en || "PROFESSIONAL PROCESS");
        const process_title = getJsonField("process_title", aboutWorkflowHeader.title_vi || "QUY TRÌNH LÀM VIỆC CHUYÊN NGHIỆP");
        const process_title_en = getJsonField("process_title_en", aboutWorkflowHeader.title_en || "PROFESSIONAL WORK PROCESS");
        const process_title_line1 = getJsonField("process_title_line1", aboutWorkflowHeader.title_line1_vi || "QUY TRÌNH LÀM VIỆC");
        const process_title_line1_en = getJsonField("process_title_line1_en", aboutWorkflowHeader.title_line1_en || "WORK PROCESS");
        const process_title_line2 = getJsonField("process_title_line2", aboutWorkflowHeader.title_line2_vi || "CHUYÊN NGHIỆP");
        const process_title_line2_en = getJsonField("process_title_line2_en", aboutWorkflowHeader.title_line2_en || "PROFESSIONAL");
        const process_desc = getJsonField("process_desc", aboutWorkflowHeader.desc_vi || "Chúng tôi tuân thủ quy trình chuẩn quốc tế để mang lại sự hài lòng và an toàn tuyệt đối cho khách hàng.");
        const process_desc_en = getJsonField("process_desc_en", aboutWorkflowHeader.desc_en || "We follow international standards to deliver safety and complete customer satisfaction.");
        const handleLocalUpload = async (fileKey: string, pathKey: string) => {
            const file = formData.get(fileKey) as File | null;
            let storedContent: any = {};
            try { storedContent = existing?.content ? JSON.parse(existing.content) : {}; } catch {}
            const submittedPath = formData.get(pathKey)?.toString().trim() || "";
            const storedPath = pathKey === "hero_bg_path"
                ? storedContent.hero_bg_path || (existing as any)?.hero_bg_path || ""
                : existing?.imageUrl || "";
            const existingPath = submittedPath || storedPath;

            if (file && file.size > 0) {
                if (existingPath && existingPath.startsWith('/uploads/')) {
                    await uploadService.deleteFile(existingPath).catch(() => {});
                }
                const currentUser = await getCurrentUser();
                const userId = currentUser?.id;
                return await uploadService.uploadFile(file, "about", "CMS_ABOUT", userId);
            }
            return existingPath;
        };

        const finalImagePath = await handleLocalUpload("image_file", "imageUrl");
        const finalHeroBgPath = await handleLocalUpload("hero_bg_file", "hero_bg_path");

        const contentJson = JSON.stringify({
            title_en, hero_subtitle, hero_bg_path: finalHeroBgPath, intro_lead, intro_lead_en, intro_box, intro_box_en, intro_footer, intro_footer_en,
            vision, vision_en, mission, mission_en,
            tax_id, representative_name, representative_title, representative_name_en, representative_title_en, established_year, established_year_en, core_business, core_business_en, compliance_title, compliance_title_en, compliance_desc, compliance_desc_en, compliance_hotline, section_badge_color, legal_badge, legal_badge_en, legal_badge_visible, legal_title, legal_title_en, core_values, core_values_en, legal_desc, legal_desc_en,
            intro_badge, intro_badge_en, intro_highlight, intro_highlight_en, intro_content_1, intro_content_1_en, intro_content_2, intro_content_2_en, stat_years, stat_projects,
            banner_badge, banner_badge_en, banner_title, banner_title_en, banner_desc, banner_desc_en, banner_opacity,
            cta_active, cta_badge, cta_badge_en, cta_title, cta_title_en, cta_title_line1, cta_title_line1_en, cta_title_line1_color, cta_title_line1_size, cta_title_line2, cta_title_line2_en, cta_title_line2_color, cta_title_line2_size, cta_desc, cta_desc_en, cta_btn_text, cta_btn_text_en, cta_btn_link, about_workflow_header: { badge_vi: process_badge, badge_en: process_badge_en, title_vi: process_title, title_en: process_title_en, title_line1_vi: process_title_line1, title_line1_en: process_title_line1_en, title_line2_vi: process_title_line2, title_line2_en: process_title_line2_en, desc_vi: process_desc, desc_en: process_desc_en }, about_workflow_steps: (() => { try { return JSON.parse(process_json || "{}").steps || []; } catch { return []; } })(),
            staff_members, staff_header
        });

        const dataPayload: any = {
            title,
            content: contentJson,
            imageUrl: finalImagePath,
            category: "GIOI_THIEU", status: "XUẤT BẢN",
        };

        if (existing) {
            await prisma.article.update({
                where: { id: existing.id },
                data: { ...dataPayload, updatedAt: new Date() } as any,
            });
        } else {
            await prisma.article.create({
                data: { ...dataPayload, slug } as any,
            });
        }

        revalidatePath("/about");
        revalidatePath("/admin/cms/about");
        revalidatePath("/", "layout");
        
        return { success: true, imageUrl: finalImagePath, heroBgPath: finalHeroBgPath };
    } catch (error: any) {
        console.error("API Save Error (About CMS):", error?.stack || error);
        return { success: false, error: "Lỗi hệ thống: " + (error?.message || "Unknown server error") };
    }
}
