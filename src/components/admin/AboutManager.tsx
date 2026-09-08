// 📍 File: src/components/admin/AboutManager.tsx
"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { 
    Monitor, Type, Target, ShieldCheck, Users, Plus, Trash2, Image as ImageIcon, 
    UploadCloud, RefreshCw, Edit3, GripVertical, Check, ArrowUp, Save, FileBadge,
    FolderOpen, Eye, EyeOff, ChevronUp, ChevronDown
} from "lucide-react";
import toast from "react-hot-toast";
import { upsertAboutAction } from "@/actions/about";
import { 
    upsertServiceAction, 
    deleteServiceAction, 
    updateServiceOrderAction, 
    createCertificateCategoryAction,
    updateCertificateCategoryAction,
    deleteCertificateCategoryAction,
    updateCertificateCategoryOrderAction,
    updateSingleCertificateOrderAction,
    toggleServiceStatusAction
} from "@/actions/services";
import { upsertPartnerAction, deletePartnerAction } from "@/actions/partners";
import { useAdminSettings } from "@/context/AdminSettingsContext";

interface AboutManagerProps {
    initialAbout: any;
    initialCertificates: any[];
    initialPartners: any[];
    initialCategories?: any[];
}

export default function AboutManager({ 
    initialAbout, 
    initialCertificates = [], 
    initialPartners = [], 
    initialCategories = [] 
}: AboutManagerProps) {
    const textValue = (value: any, lang: "vi" | "en" = "vi") => {
        if (value && typeof value === "object") return String(value[lang] ?? value.vi ?? value.en ?? "");
        return value == null ? "" : String(value);
    };
    const { t, language } = useAdminSettings();
    const router = useRouter();
    const [activeTab, setActiveTab] = useState("banner_hero");
    useEffect(() => {
        if (activeTab === "workflow" || activeTab === "quy-trinh") setActiveTab("process");
    }, [activeTab]);
    const [loading, setLoading] = useState(false);
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
    // Reusable styling tokens (consistent with ContactManager)
    const surfaceClass = "bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden p-6 space-y-6";
    const inputClass = "w-full px-4 py-2.5 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm text-slate-900 dark:text-slate-100 outline-none focus-visible:ring-2 focus-visible:ring-slate-200 dark:focus-visible:ring-slate-800 focus-visible:border-slate-350 dark:focus-visible:border-slate-700 transition-all";
    const labelClass = "text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block mb-1.5";
    const sectionTitleClass = "text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 pb-2 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2";

    // Dynamic banner and upload states
    const [imagePreview, setImagePreview] = useState(initialAbout?.imageUrl || null);
    const [heroBgPreview, setHeroBgPreview] = useState(initialAbout?.hero_bg_path || null);
    const [heroBgPath, setHeroBgPath] = useState(initialAbout?.hero_bg_path || "");
    const [imagePath, setImagePath] = useState(initialAbout?.imageUrl || "");

    // Parse initial content JSON safely
    let legalInfo: any = {
        tax_id: "3702888448",
        representative_name: "Ông Nguyễn Đình Thành",
        representative_title: "Giám đốc",
        core_values: "An toàn — Chất lượng — Uy tín — Sáng tạo",
        core_values_en: "Safety — Quality — Prestige — Creativity",
        legal_desc: "",
        legal_desc_en: "",
        banner_badge: "",
        banner_badge_en: "",
        banner_title: "",
        banner_title_en: "",
        banner_breadcrumb: "Trang chủ / Về chúng tôi",
        banner_breadcrumb_en: "Home / About",
        banner_desc: "",
        banner_desc_en: "",
        banner_opacity: 0.6,
        intro_badge: "",
        intro_badge_en: "",
        intro_highlight: "",
        intro_highlight_en: "",
        representative_name_en: "",
        representative_title_en: "",
        established_year: "2020",
        core_business: "Dịch vụ kỹ thuật công nghiệp",
        core_business_en: "Industrial Technical Services",
        compliance_title: "Tuân thủ & Trách nhiệm",
        compliance_title_en: "Compliance & Responsibility",
        compliance_desc: "",
        compliance_desc_en: "",
        compliance_hotline: "tel:0918458399",
        section_badge_color: "#0f172a",
        legal_badge: "PHÁP LÝ & NĂNG LỰC",
        legal_badge_en: "LEGAL & CAPABILITY",
        legal_badge_visible: true,
        staff_header: { badge_vi: "ĐỘI NGŨ CHUYÊN GIA", badge_en: "EXPERT TEAM", badge_color: "#C8102E", badge_size: "12px", title_vi: "NĂNG LỰC NHÂN SỰ", title_en: "OUR EXPERT TEAM", title_color: "#0B1221", title_size: "56px" },
        stat_years: 10,
        stat_projects: 500,
        cta_active: true,
        cta_badge: "",
        cta_badge_en: "",
        cta_title: "",
        cta_title_en: "",
        cta_desc: "",
        cta_desc_en: "",
        cta_btn_text: "",
        cta_btn_text_en: "",
        cta_btn_link: ""
        , staff_members: "[]"
    };
    try {
        if (initialAbout?.content) {
            legalInfo = { ...legalInfo, ...JSON.parse(initialAbout.content) };
        }
    } catch (e) {
        console.error("Failed to parse initialAbout content:", e);
    }
    legalInfo.staff_header = {
        ...(legalInfo.staff_header || {}),
        badge_vi: textValue(legalInfo.staff_header?.badge_vi, "vi"),
        badge_en: textValue(legalInfo.staff_header?.badge_en, "en"),
        title_vi: textValue(legalInfo.staff_header?.title_vi, "vi"),
        title_en: textValue(legalInfo.staff_header?.title_en, "en")
    };
    // Normalize the About-only workflow namespace for this manager. Do not read
    // `legalInfo.process`, which belongs to the homepage configuration.
    legalInfo.process = {
        ...(legalInfo.about_workflow_header || {}),
        steps: Array.isArray(legalInfo.about_workflow_steps) ? legalInfo.about_workflow_steps : []
    };
    const defaultProcess = { title_vi: "Quy trình làm việc chuyên nghiệp", title_en: "Professional Work Process", desc_vi: "Chúng tôi tuân thủ quy trình chuẩn quốc tế.", desc_en: "We follow an international standard process.", steps: [
        { step: "01", title_vi: "Khảo sát & Tư vấn", title_en: "Survey & Consultation", desc_vi: "Tiếp nhận và phân tích nhu cầu.", desc_en: "Receive and analyze requirements.", image: "" },
        { step: "02", title_vi: "Thiết kế kỹ thuật", title_en: "Technical Design", desc_vi: "Xây dựng giải pháp phù hợp.", desc_en: "Develop the right solution.", image: "" },
        { step: "03", title_vi: "Thi công & Lắp đặt", title_en: "Construction & Installation", desc_vi: "Triển khai theo tiêu chuẩn kỹ thuật.", desc_en: "Implement according to technical standards.", image: "" },
        { step: "04", title_vi: "Kiểm định & Bàn giao", title_en: "Inspection & Handover", desc_vi: "Kiểm tra, nghiệm thu và bàn giao.", desc_en: "Inspect, commission and hand over.", image: "" }
    ] };
    const [workflowSteps, setWorkflowSteps] = useState<any[]>(() => {
        // About workflow must never inherit the homepage/process object.
        const saved = Array.isArray(legalInfo.about_workflow_steps) ? legalInfo.about_workflow_steps : [];
        return Array.isArray(saved) && saved.length ? saved : defaultProcess.steps;
    });

    // Reactive fields for Live Banner Preview
    const [bannerTitle, setBannerTitle] = useState(legalInfo.banner_title || "");
    const [bannerDesc, setBannerDesc] = useState(legalInfo.banner_desc || "");
    const [bannerOpacity, setBannerOpacity] = useState(legalInfo.banner_opacity !== undefined ? legalInfo.banner_opacity : 0.6);
    const [ctaActive, setCtaActive] = useState(legalInfo.cta_active !== false);

    const EMPTY_EN_FIELDS = {
        banner_badge_en: "",
        banner_title_en: "",
        banner_desc_en: "",
        intro_badge_en: "",
        intro_highlight_en: "",
        representative_name_en: "",
        representative_title_en: "",
        intro_lead_en: "",
        intro_box_en: "",
        intro_footer_en: "",
        intro_content_1_en: "",
        intro_content_2_en: "",
        vision_en: "",
        mission_en: "",
        core_values_en: "",
        cta_badge_en: "",
        cta_title_en: "",
        cta_desc_en: "",
        cta_btn_text_en: ""
    };

    const [enFields, setEnFields] = useState({
        banner_badge_en: legalInfo.banner_badge_en ?? "",
        banner_title_en: legalInfo.banner_title_en ?? "",
        banner_breadcrumb: legalInfo.banner_breadcrumb ?? "Trang chủ / Về chúng tôi",
        banner_breadcrumb_en: legalInfo.banner_breadcrumb_en ?? "Home / About",
        banner_desc_en: legalInfo.banner_desc_en ?? "",
        intro_badge_en: legalInfo.intro_badge_en ?? "",
        intro_highlight_en: legalInfo.intro_highlight_en ?? "",
        representative_name_en: legalInfo.representative_name_en ?? "",
        representative_title_en: legalInfo.representative_title_en ?? "",
        intro_lead_en: initialAbout?.intro_lead_en ?? "",
        intro_box_en: initialAbout?.intro_box_en ?? "",
        intro_footer_en: initialAbout?.intro_footer_en ?? "",
        intro_content_1_en: legalInfo.intro_content_1_en ?? "",
        intro_content_2_en: legalInfo.intro_content_2_en ?? "",
        vision_en: initialAbout?.vision_en ?? "",
        mission_en: initialAbout?.mission_en ?? "",
        core_values_en: legalInfo.core_values_en ?? "",
        cta_badge_en: legalInfo.cta_badge_en ?? "",
        cta_title_en: legalInfo.cta_title_en ?? "",
        cta_desc_en: legalInfo.cta_desc_en ?? "",
        cta_btn_text_en: legalInfo.cta_btn_text_en ?? ""
    });

    // Certificates and Categories state
    const [certFiles, setCertFiles] = useState<File[]>([]);
    const [editingCert, setEditingCert] = useState<any>(null);
    const [localCerts, setLocalCerts] = useState<any[]>(initialCertificates);
    const [draggedCatIndex, setDraggedCatIndex] = useState<number | null>(null);
    const [selectedCerts, setSelectedCerts] = useState<number[]>([]);
    const [certPage, setCertPage] = useState(1);

    const [categories, setCategories] = useState<any[]>(initialCategories);
    const [selectedCatId, setSelectedCatId] = useState<number | null>(initialCategories[0]?.id || null);
    const [isCertFormOpen, setIsCertFormOpen] = useState(false);
    const [staffMembers, setStaffMembers] = useState<any[]>(() => {
        try {
            const legacy = legalInfo.staff_members || legalInfo.staffMembers || legalInfo.staff || legalInfo.team_members || legalInfo.team?.members || [];
            const parsed = typeof legacy === "string" ? JSON.parse(legacy || "[]") : legacy;
            return Array.isArray(parsed) ? parsed.map((member: any) => ({
                ...member,
                name: member?.name ?? member?.name_vi ?? "",
                name_en: member?.name_en ?? "",
                role_vi: textValue(member?.role_vi ?? member?.position?.vi ?? member?.position, "vi"),
                role_en: textValue(member?.role_en ?? member?.position?.en ?? member?.position, "en"),
                image: member?.image ?? "",
                credentials: Array.isArray(member?.credentials) ? member.credentials.map((c: any) => ({ ...c, name_vi: c?.name_vi ?? "", name_en: c?.name_en ?? "", image: c?.image ?? "" })) : []
            })) : [];
        } catch { return []; }
    });
    const [selectedStaffIndex, setSelectedStaffIndex] = useState<number | null>(null);
    const previousStaffCount = useRef(staffMembers.length);
    useEffect(() => {
        if (staffMembers.length > previousStaffCount.current) setSelectedStaffIndex(staffMembers.length - 1);
        if (selectedStaffIndex !== null && selectedStaffIndex >= staffMembers.length) setSelectedStaffIndex(staffMembers.length ? staffMembers.length - 1 : null);
        previousStaffCount.current = staffMembers.length;
    }, [staffMembers.length, selectedStaffIndex]);
    const [staffBadgeColor, setStaffBadgeColor] = useState(legalInfo.staff_header?.badge_color || "#C8102E");
    const [staffTitleColor, setStaffTitleColor] = useState(legalInfo.staff_header?.title_color || "#0B1221");
    const [staffTitleVi, setStaffTitleVi] = useState(legalInfo.staff_header?.title_vi ?? "");
    const [staffTitleEn, setStaffTitleEn] = useState(legalInfo.staff_header?.title_en ?? "");

    // Strategic partners state
    const [partnerFiles, setPartnerFiles] = useState<File[]>([]);
    const [selectedPartners, setSelectedPartners] = useState<number[]>([]);
    const [partnerPage, setPartnerPage] = useState(1);

    // Scroll back to top state
    const [showScrollTop, setShowScrollTop] = useState(false);

    // Sync incoming updates with database mutations
    useEffect(() => {
        if (initialAbout) {
            setImagePreview(initialAbout.imageUrl || null);
            let storedHeroPath = initialAbout.hero_bg_path || "";
            try {
                const content = initialAbout.content ? JSON.parse(initialAbout.content) : {};
                storedHeroPath = storedHeroPath || content.hero_bg_path || "";
            } catch {
                // Keep the top-level path when legacy content is malformed.
            }
            setHeroBgPreview(storedHeroPath || null);
            setImagePath(initialAbout.imageUrl || "");
            setHeroBgPath(storedHeroPath);
            try {
                const refreshed = initialAbout.content ? JSON.parse(initialAbout.content) : {};
                if (refreshed.staff_header) {
                    setStaffTitleVi(textValue(refreshed.staff_header.title_vi, "vi"));
                    setStaffTitleEn(textValue(refreshed.staff_header.title_en, "en"));
                }
            } catch {
                // Keep the current controlled values when legacy content is malformed.
            }
        }
    }, [initialAbout]);

    useEffect(() => {
        let freshInfo = {
            banner_title: "",
            banner_desc: "",
            banner_opacity: 0.6,
            cta_active: true
        };
        try {
            if (initialAbout?.content) {
                freshInfo = { ...freshInfo, ...JSON.parse(initialAbout.content) };
            }
        } catch(e) {}
        setBannerTitle(freshInfo.banner_title || "");
        setBannerDesc(freshInfo.banner_desc || "");
        setBannerOpacity(freshInfo.banner_opacity !== undefined ? freshInfo.banner_opacity : 0.6);
        setCtaActive(freshInfo.cta_active !== false);
    }, [initialAbout]);

    useEffect(() => {
        let freshInfo: any = {};
        try {
            if (initialAbout?.content) {
                freshInfo = JSON.parse(initialAbout.content);
            }
        } catch(e) {}
        setEnFields({
            banner_badge_en: freshInfo.banner_badge_en ?? "",
            banner_title_en: freshInfo.banner_title_en ?? "",
            banner_breadcrumb: freshInfo.banner_breadcrumb ?? "Trang chủ / Về chúng tôi",
            banner_breadcrumb_en: freshInfo.banner_breadcrumb_en ?? "Home / About",
            banner_desc_en: freshInfo.banner_desc_en ?? "",
            intro_badge_en: freshInfo.intro_badge_en ?? "",
            intro_highlight_en: freshInfo.intro_highlight_en ?? "",
            representative_name_en: freshInfo.representative_name_en ?? "",
            representative_title_en: freshInfo.representative_title_en ?? "",
            intro_lead_en: initialAbout?.intro_lead_en ?? "",
            intro_box_en: initialAbout?.intro_box_en ?? "",
            intro_footer_en: initialAbout?.intro_footer_en ?? "",
            intro_content_1_en: freshInfo.intro_content_1_en ?? "",
            intro_content_2_en: freshInfo.intro_content_2_en ?? "",
            vision_en: freshInfo.vision_en ?? initialAbout?.vision_en ?? "",
            mission_en: freshInfo.mission_en ?? initialAbout?.mission_en ?? "",
            core_values_en: freshInfo.core_values_en ?? "",
            cta_badge_en: freshInfo.cta_badge_en ?? "",
            cta_title_en: freshInfo.cta_title_en ?? "",
            cta_desc_en: freshInfo.cta_desc_en ?? "",
            cta_btn_text_en: freshInfo.cta_btn_text_en ?? ""
        });
    }, [initialAbout]);

    useEffect(() => {
        setLocalCerts(initialCertificates);
    }, [initialCertificates]);

    useEffect(() => {
        setCategories(initialCategories);
        if (initialCategories.length > 0 && selectedCatId === null) {
            setSelectedCatId(initialCategories[0].id);
        }
    }, [initialCategories]);

    // Handle scroll context
    useEffect(() => {
        const handleScroll = () => {
            const contentArea = document.getElementById("about-content-area");
            if (contentArea) {
                setShowScrollTop(contentArea.scrollTop > 300);
            }
        };
        const contentArea = document.getElementById("about-content-area");
        if (contentArea) {
            contentArea.addEventListener("scroll", handleScroll);
        }
        return () => {
            if (contentArea) contentArea.removeEventListener("scroll", handleScroll);
        };
    }, []);

    const scrollToTop = () => {
        const contentArea = document.getElementById("about-content-area");
        if (contentArea) {
            contentArea.scrollTo({ top: 0, behavior: "smooth" });
        }
    };

    const handleTabChange = (tabId: string) => {
        if (hasUnsavedChanges) {
            if (!confirm("Bạn có các thay đổi chưa lưu! Rời khỏi tab này sẽ làm mất thay đổi?")) {
                return;
            }
        }
        setActiveTab(tabId);
        setHasUnsavedChanges(false);
        setEditingCert(null);
        setCertFiles([]);
        setPartnerFiles([]);
        setSelectedCerts([]);
        setSelectedPartners([]);
        setCertPage(1);
        setPartnerPage(1);
        
        // Reset scroll position on tab change
        const contentArea = document.getElementById("about-content-area");
        if (contentArea) contentArea.scrollTop = 0;
    };

    // Direct save event for dynamic properties
    const handleSaveAbout = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const toastId = toast.loading("Đang lưu thông tin...");
        setLoading(true);
        try {
            const formData = new FormData(e.currentTarget);
            if (activeTab === "cta") {
                const requiredFields = ["cta_title", "cta_desc", "cta_btn_text"];
                const missing = requiredFields.some((field) => !String(formData.get(field) ?? "").trim());
                if (missing) {
                    toast.error(language === "en" ? "Please complete the contact/CTA title, description and button." : "Vui lòng nhập đầy đủ tiêu đề, mô tả và nút liên hệ/CTA.", { id: toastId });
                    setLoading(false);
                    return;
                }
            }
            formData.set("staff_members", JSON.stringify(staffMembers));
            formData.set("staff_title_vi", staffTitleVi ?? "");
            formData.set("staff_title_en", staffTitleEn ?? "");
            formData.set("staff_badge_vi", String(legalInfo.staff_header?.badge_vi ?? ""));
            formData.set("staff_badge_en", String(legalInfo.staff_header?.badge_en ?? ""));
            formData.set("vision_en", String(enFields.vision_en ?? ""));
            formData.set("mission_en", String(enFields.mission_en ?? ""));
            formData.set("process_json", JSON.stringify({ steps: workflowSteps }));
            // CTA is always enabled on the public website.
            formData.set("cta_active", "true");

            const res = await upsertAboutAction(formData);
            if (res.success) {
                if (res.imageUrl !== undefined) {
                    setImagePath(res.imageUrl || "");
                    setImagePreview(res.imageUrl || null);
                }
                if (res.heroBgPath !== undefined) {
                    setHeroBgPath(res.heroBgPath || "");
                    setHeroBgPreview(res.heroBgPath || null);
                }
                toast.success("Đã lưu thông tin Về chúng tôi thành công!", { id: toastId });
                setHasUnsavedChanges(false);
                router.refresh();
            } else {
                toast.error("Lỗi: " + res.error, { id: toastId });
            }
        } catch (err: any) {
            toast.error("Lỗi kết nối server: " + err.message, { id: toastId });
        }
        setLoading(false);
    };

    // Categories CRUD
    const handleCreateCategory = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const form = e.currentTarget;
        const fData = new FormData(form);
        const titleVi = fData.get("title_vi")?.toString().trim() || "";
        const titleEn = fData.get("title_en")?.toString().trim() || "";
        if (!titleVi) return;

        const toastId = toast.loading("Đang tạo loại mới...");
        setLoading(true);
        try {
            const res = await createCertificateCategoryAction(titleVi, titleEn);
            if (res.success) {
                toast.success("Đã tạo loại chứng chỉ thành công!", { id: toastId });
                form.reset();
                if (res.category) {
                    setSelectedCatId(res.category.id);
                }
                router.refresh();
            } else {
                toast.error("Lỗi: " + res.error, { id: toastId });
            }
        } catch (e: any) {
            toast.error("Lỗi kết nối", { id: toastId });
        }
        setLoading(false);
    };

    const handleEditCategoryName = async (cat: any) => {
        const titleVi = window.prompt("Nhập Tên loại chứng chỉ bằng tiếng Việt:", cat.title_vi);
        if (titleVi === null) return;
        if (!titleVi.trim()) {
            toast.error("Tên tiếng Việt không được để trống!");
            return;
        }

        const titleEn = window.prompt("Nhập Tên loại chứng chỉ bằng tiếng Anh (Có thể để trống):", cat.title_en || "");
        if (titleEn === null) return;

        const toastId = toast.loading("Đang cập nhật loại chứng chỉ...");
        try {
            const res = await updateCertificateCategoryAction(cat.id, titleVi.trim(), titleEn.trim());
            if (res.success) {
                toast.success("Cập nhật loại chứng chỉ thành công!", { id: toastId });
                router.refresh();
            } else {
                toast.error("Lỗi: " + res.error, { id: toastId });
            }
        } catch (e: any) {
            toast.error("Lỗi kết nối", { id: toastId });
        }
    };

    const handleDeleteCategory = async (cat: any) => {
        const certsInCat = localCerts.filter(c => c.desc_vi === cat.title_vi);
        let confirmMsg = `Bạn có chắc chắn muốn xóa loại chứng chỉ "${cat.title_vi}" không?`;
        if (certsInCat.length > 0) {
            confirmMsg = `CẢNH BÁO: Loại chứng chỉ "${cat.title_vi}" này đang có ${certsInCat.length} chứng chỉ bên trong.\n\nNếu bạn xóa loại này, toàn bộ chứng chỉ con bên trong cũng sẽ bị XÓA hoàn toàn.\n\nBạn có thực sự chắc chắn muốn tiếp tục không?`;
        }

        if (confirm(confirmMsg)) {
            const toastId = toast.loading("Đang xóa loại chứng chỉ...");
            try {
                const res = await deleteCertificateCategoryAction(cat.id);
                if (res.success) {
                    toast.success("Đã xóa loại chứng chỉ thành công!", { id: toastId });
                    const remaining = categories.filter(c => c.id !== cat.id);
                    setSelectedCatId(remaining[0]?.id || null);
                    router.refresh();
                } else {
                    toast.error("Lỗi: " + res.error, { id: toastId });
                }
            } catch (e: any) {
                toast.error("Lỗi kết nối", { id: toastId });
            }
        }
    };

    const handleDropCategory = async (e: React.DragEvent, index: number) => {
        e.preventDefault();
        e.stopPropagation();
        
        if (draggedCatIndex === null || draggedCatIndex === index) {
            setDraggedCatIndex(null);
            return;
        }

        const newCats = [...categories];
        const draggedItem = newCats[draggedCatIndex];
        newCats.splice(draggedCatIndex, 1);
        newCats.splice(index, 0, draggedItem);

        setCategories(newCats);
        setDraggedCatIndex(null);
        
        const toastId = toast.loading("Đang lưu thứ tự phân loại...");
        try {
            const res = await updateCertificateCategoryOrderAction(newCats.map(c => c.id));
            if (res.success) {
                toast.success("Lưu thứ tự phân loại thành công!", { id: toastId });
                router.refresh();
            } else {
                toast.error("Lỗi: " + res.error, { id: toastId });
            }
        } catch (e: any) {
            toast.error("Lỗi kết nối", { id: toastId });
        }
    };

    // Certificates save action
    const handleAddCertBulk = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const form = e.currentTarget;
        const fData = new FormData(form);
        const titleVal = fData.get("title_vi")?.toString().trim() || "";
        const titleEnVal = fData.get("title_en")?.toString().trim() || "";

        const activeCatObj = categories.find(c => c.id === selectedCatId);
        if (!activeCatObj) {
            toast.error("Vui lòng chọn loại chứng chỉ trước khi thêm!");
            return;
        }

        const toastId = toast.loading(editingCert ? "Đang cập nhật..." : "Đang tải lên...");
        setLoading(true);
        try {
            if (editingCert) {
                const singleData = new FormData();
                singleData.append("id", editingCert.id.toString());
                singleData.append("title_vi", titleVal);
                singleData.append("title_en", titleEnVal);
                singleData.append("desc_vi", activeCatObj.title_vi);
                singleData.append("category", "CHUNG_CHI");
                singleData.append("order", (editingCert.order || 0).toString());
                singleData.append("status", editingCert.status || "HIỂN THỊ");
                
                if (certFiles[0]) {
                    singleData.append("image_file", certFiles[0]);
                } else {
                    singleData.append("imageUrl", editingCert.imageUrl || "");
                }

                const res = await upsertServiceAction(singleData);
                if (res?.success) {
                    toast.success("Cập nhật chứng chỉ thành công!", { id: toastId });
                    setEditingCert(null);
                    setCertFiles([]);
                    setIsCertFormOpen(false);
                    router.refresh();
                } else {
                    toast.error("Lỗi: " + res?.error, { id: toastId });
                }
            } else {
                let successCount = 0;
                let errorCount = 0;
                const existingCertsCount = localCerts.filter(c => c.desc_vi === activeCatObj.title_vi).length;

                for (let i = 0; i < certFiles.length; i++) {
                    const file = certFiles[i];
                    const singleData = new FormData();
                    singleData.append("title_vi", titleVal || file.name.split(".")[0]);
                    singleData.append("title_en", titleEnVal);
                    singleData.append("desc_vi", activeCatObj.title_vi);
                    singleData.append("category", "CHUNG_CHI");
                    singleData.append("order", (existingCertsCount + i).toString());
                    singleData.append("status", "HIỂN THỊ");
                    singleData.append("image_file", file);

                    const res = await upsertServiceAction(singleData);
                    if (res?.success) successCount++;
                    else errorCount++;
                }

                if (errorCount === 0) {
                    toast.success(`Đã tải lên thành công ${successCount} chứng chỉ!`, { id: toastId });
                } else {
                    toast.error(`Thành công ${successCount}, Thất bại ${errorCount}`, { id: toastId });
                }
                setCertFiles([]);
                form.reset();
                setIsCertFormOpen(false);
                router.refresh();
            }
        } catch (err: any) {
            toast.error("Lỗi hệ thống: " + err.message, { id: toastId });
        }
        setLoading(false);
    };

    const handleDeleteCert = async (id: number) => {
        if (confirm("Bạn có chắc chắn muốn xóa chứng chỉ này?")) {
            const toastId = toast.loading("Đang xóa chứng chỉ...");
            try {
                await deleteServiceAction(id);
                toast.success("Xóa chứng chỉ thành công!", { id: toastId });
                router.refresh();
            } catch (e) {
                toast.error("Lỗi xảy ra khi xóa", { id: toastId });
            }
        }
    };

    const handleToggleCertStatus = async (cert: any) => {
        const newStatus = cert.status === "HIỂN THỊ" ? "ẨN" : "HIỂN THỊ";
        const toastId = toast.loading("Đang cập nhật trạng thái...");
        try {
            const res = await toggleServiceStatusAction(cert.id, cert.status);
            if (res.success) {
                toast.success(`Đã chuyển trạng thái sang ${newStatus}!`, { id: toastId });
                router.refresh();
            } else {
                toast.error("Lỗi: " + res.error, { id: toastId });
            }
        } catch (e) {
            toast.error("Lỗi kết nối", { id: toastId });
        }
    };

    const handleUpdateCertOrder = async (id: number, order: number) => {
        try {
            const res = await updateSingleCertificateOrderAction(id, order);
            if (res.success) {
                setLocalCerts(prev => prev.map(c => c.id === id ? { ...c, order } : c));
            } else {
                toast.error("Lỗi cập nhật thứ tự: " + res.error);
            }
        } catch (e: any) {
            toast.error("Lỗi kết nối");
        }
    };

    // Strategic partners actions
    const handleAddPartnerBulk = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const form = e.currentTarget;
        const toastId = toast.loading("Đang tải lên logo đối tác...");
        setLoading(true);
        try {
            let successCount = 0;
            let errCount = 0;
            for (const file of partnerFiles) {
                const fData = new FormData();
                fData.append("title_vi", file.name.split(".")[0]);
                fData.append("image_file", file);
                const res = await upsertPartnerAction(fData);
                if (res?.success) successCount++;
                else errCount++;
            }

            if (errCount === 0) {
                toast.success(`Đã tải lên thành công ${successCount} đối tác!`, { id: toastId });
            } else {
                toast.error(`Tải lên thành công ${successCount}, Lỗi ${errCount}`, { id: toastId });
            }
            setPartnerFiles([]);
            form.reset();
            router.refresh();
        } catch (err) {
            toast.error("Lỗi máy chủ", { id: toastId });
        }
        setLoading(false);
    };

    const handleBulkDeletePartners = async () => {
        if (selectedPartners.length === 0) return;
        if (confirm(`Bạn có chắc chắn muốn xóa ${selectedPartners.length} đối tác đã chọn?`)) {
            const tId = toast.loading("Đang xóa đối tác...");
            setLoading(true);
            try {
                await Promise.all(selectedPartners.map(id => deletePartnerAction(id)));
                toast.success("Đã xóa đối tác thành công!", { id: tId });
                setSelectedPartners([]);
                router.refresh();
            } catch (e) {
                toast.error("Lỗi khi xóa", { id: tId });
            }
            setLoading(false);
        }
    };

    // Pagination calculations
    const activeCategoryObj = categories.find(c => c.id === selectedCatId);
    const activeCategoryName = activeCategoryObj ? activeCategoryObj.title_vi : "Chưa chọn loại";
    const displayCertsInTab = localCerts.filter(c => c.desc_vi === activeCategoryName);
    const certsPerPage = 8;
    const totalCertPages = Math.ceil(displayCertsInTab.length / certsPerPage);
    const currentDisplayCerts = displayCertsInTab.slice((certPage - 1) * certsPerPage, certPage * certsPerPage);

    const partnersPerPage = 16;
    const totalPartnerPages = Math.ceil(initialPartners.length / partnersPerPage);
    const currentDisplayPartners = initialPartners.slice((partnerPage - 1) * partnersPerPage, partnerPage * partnersPerPage);
    const hasAboutData = !!initialAbout?.id || !!initialAbout?.title_vi || !!legalInfo.banner_title;

    const isBilingualComplete = 
        enFields.banner_badge_en.trim() !== "" &&
        enFields.banner_title_en.trim() !== "" &&
        enFields.banner_desc_en.trim() !== "" &&
        enFields.intro_lead_en.trim() !== "" &&
        enFields.intro_box_en.trim() !== "" &&
        enFields.intro_footer_en.trim() !== "" &&
        enFields.vision_en.trim() !== "" &&
        enFields.mission_en.trim() !== "" &&
        enFields.core_values_en.trim() !== "" &&
        enFields.cta_title_en.trim() !== "" &&
        enFields.cta_desc_en.trim() !== "" &&
        enFields.cta_btn_text_en.trim() !== "";

    const activeCertsCount = localCerts.filter(c => c.status === "HIỂN THỊ").length;
    const activePartnersCount = initialPartners.filter(p => p.status === "HIỂN THỊ").length;

    const tabs = [
        { id: "banner_hero", name: language === "en" ? "Banner & Hero" : "Banner & Hero", icon: <Monitor className="h-4 w-4 stroke-[1.5]" /> },
        { id: "general", name: language === "en" ? "Introduction" : "Giới thiệu", icon: <Type className="h-4 w-4 stroke-[1.5]" /> },
        { id: "partners", name: language === "en" ? "Partners" : "Đối tác", icon: <ShieldCheck className="h-4 w-4 stroke-[1.5]" /> },
        { id: "vision", name: language === "en" ? "Vision & Mission & Values" : "Tầm nhìn & Sứ mệnh & Giá trị", icon: <Target className="h-4 w-4 stroke-[1.5]" /> },
        { id: "legal", name: language === "en" ? "Legal Info" : "Pháp lý", icon: <ShieldCheck className="h-4 w-4 stroke-[1.5]" /> },
        { id: "certs", name: language === "en" ? "Team Members" : "Thành viên", icon: <Users className="h-4 w-4 stroke-[1.5]" /> },
        { id: "process", name: language === "en" ? "Process" : "Quy trình", icon: <RefreshCw className="h-4 w-4 stroke-[1.5]" /> },
        { id: "cta", name: language === "en" ? "Contact" : "Liên hệ", icon: <Plus className="h-4 w-4 stroke-[1.5]" /> },
    ];

    return (
        <div className="min-h-0 h-auto lg:h-full w-full flex flex-col overflow-visible animate-in fade-in duration-500 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 p-6 md:p-8">
            
            {/* Header section - standard, flat and elegant */}
            <div className="hidden">
                <div>
                    <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
                        <span className="p-2 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                            <Monitor className="h-5 w-5 stroke-[1.5]" />
                        </span>
                        {t?.adminAbout?.title || "Quản lý Về chúng tôi"}
                    </h1>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        {t?.adminAbout?.subtitle || "Cấu hình banner, giới thiệu chung, sứ mệnh, tầm nhìn, đối tác và chứng chỉ."}
                    </p>
                </div>

                {["banner_hero", "general", "vision", "legal", "cta"].includes(activeTab) && (
                    <button
                        type="submit"
                        form="about-save-form"
                        disabled={loading}
                        className="!hidden inline-flex items-center justify-center whitespace-nowrap transition-all focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 py-2 h-10 px-5 rounded-xl bg-emerald-700 hover:bg-emerald-800 dark:bg-emerald-600 dark:hover:bg-emerald-700 text-white text-xs font-semibold shadow-sm gap-2 active:scale-98 disabled:opacity-50"
                    >
                        {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                        {loading ? (t?.adminAbout?.actions?.saving || "Đang lưu...") : (t?.adminAbout?.actions?.save || "Lưu thông tin")}
                    </button>
                )}
            </div>

            {/* Main two-column grid */}
            <div className="min-h-0 grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-8 items-start flex-1 overflow-visible">
                
                {/* Left Sidebar Menu */}
                <aside className="self-start flex flex-col space-y-4 w-full shrink-0">
                    <div className="flex flex-col space-y-1 p-2 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden shrink-0">
                        {tabs.map((tab) => {
                            const isActive = activeTab === tab.id;
                            return (
                                <button
                                    key={tab.id}
                                    type="button"
                                    onClick={() => handleTabChange(tab.id)}
                                    className={`w-full flex items-center gap-3 px-4 py-3 text-xs font-bold transition-all duration-200 rounded-xl text-left border-l-4 ${
                                        isActive
                                            ? "bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-300 border-premium-red rounded-l-none pl-3 shadow-sm"
                                            : "text-slate-500 dark:text-slate-400 hover:bg-slate-50/50 dark:hover:bg-slate-850 hover:text-slate-900 dark:hover:text-white border-transparent pl-4"
                                    }`}
                                >
                                    {tab.icon}
                                    {tab.name}
                                </button>
                            );
                        })}
                    </div>


                    { ["banner_hero", "general", "vision", "legal", "certs", "process", "cta"].includes(activeTab) && (
                        <button
                            type="submit"
                            form="about-save-form"
                            disabled={loading}
                            className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-emerald-700 px-5 text-xs font-bold text-white shadow-sm transition hover:bg-emerald-800 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-emerald-500/20 disabled:pointer-events-none disabled:opacity-50 dark:bg-emerald-600 dark:hover:bg-emerald-700"
                        >
                            {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                            {loading ? (t?.adminAbout?.actions?.saving || "Đang lưu...") : (t?.adminAbout?.actions?.save || "LƯU THÔNG TIN")}
                        </button>
                    )}
                </aside>

                {/* Right Content Area (Internally scrollable only) */}
                <div id="about-content-area" className="min-h-0 h-auto lg:h-full max-h-none lg:max-h-[calc(100vh-120px)] overflow-visible lg:overflow-y-auto overscroll-contain pr-2 scrollbar-thin pb-32 self-start w-full">
                    
                    {/* SINGLE FORM WRAPPER containing all static inputs simultaneously */}
                    <form 
                        id="about-save-form" 
                        onSubmit={handleSaveAbout} 
                        onChange={() => setHasUnsavedChanges(true)} 
                        className={`${["banner_hero", "general", "vision", "legal", "process", "cta"].includes(activeTab) ? 'block' : 'hidden'} space-y-6`}
                    >
                        
                        {/* 1. BANNER & HERO TAB */}
                        <div className={`${activeTab === 'banner_hero' ? 'block' : 'hidden'} space-y-6 [&>div:nth-child(2)]:hidden`}>
                            <div className={surfaceClass}>
                                <div className="hidden grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className={labelClass}>Breadcrumb (VI)</label>
                                        <input name="legacy_banner_breadcrumb" defaultValue={legalInfo.banner_breadcrumb ?? "Trang chủ / Về chúng tôi"} disabled placeholder="Trang chủ / Về chúng tôi" className={inputClass} />
                                    </div>
                                    <div>
                                        <label className={labelClass}>Breadcrumb (EN)</label>
                                        <input name="legacy_banner_breadcrumb_en" defaultValue={legalInfo.banner_breadcrumb_en ?? "Home / About"} disabled placeholder="Home / About" className={inputClass} />
                                    </div>
                                </div>

                                <div className="hidden grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className={labelClass}>Mã (Badge / Key) (VI)</label>
                                        <input 
                                            name="banner_badge" 
                                            defaultValue={legalInfo.banner_badge} 
                                            placeholder="Ví dụ: Về chúng tôi" 
                                            className={inputClass} 
                                        />
                                    </div>
                                    <div>
                                        <label className={labelClass}>Mã (Badge / Key) (EN)</label>
                                        <input 
                                            name="banner_badge_en" 
                                            value={enFields.banner_badge_en ?? ""} 
                                            onChange={(e) => {
                                                setEnFields(prev => ({ ...prev, banner_badge_en: e.target.value }));
                                                setHasUnsavedChanges(true);
                                            }}
                                            placeholder="Example: About Us" 
                                            className={inputClass} 
                                        />
                                    </div>
                                </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className={labelClass}>Tiêu đề (Title) (VI)</label>
                                        <input 
                                            name="banner_title" 
                                            value={bannerTitle ?? ""} 
                                            onChange={(e) => {
                                                setBannerTitle(e.target.value);
                                                setHasUnsavedChanges(true);
                                            }} 
                                            placeholder="Nhập tiêu đề trang Về chúng tôi" 
                                            className={inputClass} 
                                        />
                                    </div>
                                    <div>
                                        <label className={labelClass}>Tiêu đề (Title) (EN)</label>
                                        <input 
                                            name="banner_title_en" 
                                            value={enFields.banner_title_en ?? ""} 
                                            onChange={(e) => {
                                                setEnFields(prev => ({ ...prev, banner_title_en: e.target.value }));
                                                setHasUnsavedChanges(true);
                                            }}
                                            placeholder="Enter Title in English" 
                                            className={inputClass} 
                                        />
                                    </div>
                                </div>

                                <div className="hidden grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className={labelClass}>Breadcrumb (VI)</label>
                                        <input name="banner_breadcrumb" disabled defaultValue={legalInfo.banner_breadcrumb ?? "Trang chủ / Về chúng tôi"} placeholder="Trang chủ / Về chúng tôi" className={inputClass} />
                                    </div>
                                    <div>
                                        <label className={labelClass}>Breadcrumb (EN)</label>
                                        <input name="banner_breadcrumb_en" disabled defaultValue={legalInfo.banner_breadcrumb_en ?? "Home / About"} placeholder="Home / About" className={inputClass} />
                                    </div>
                                </div>

                                <div className="hidden grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className={labelClass}>Mô tả phụ / Description (VI)</label>
                                        <textarea 
                                            name="banner_desc" 
                                            rows={3} 
                                            value={bannerDesc ?? ""} 
                                            onChange={(e) => {
                                                setBannerDesc(e.target.value);
                                                setHasUnsavedChanges(true);
                                            }} 
                                            placeholder="Nhập mô tả phụ ngắn hiển thị trên banner..." 
                                            className={`${inputClass} resize-none`}
                                        />
                                    </div>
                                    <div>
                                        <label className={labelClass}>Description (EN)</label>
                                        <textarea 
                                            name="banner_desc_en" 
                                            rows={3} 
                                            value={enFields.banner_desc_en ?? ""} 
                                            onChange={(e) => {
                                                setEnFields(prev => ({ ...prev, banner_desc_en: e.target.value }));
                                                setHasUnsavedChanges(true);
                                            }}
                                            placeholder="Enter Description in English..." 
                                            className={`${inputClass} resize-none`}
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="relative">
                                        <label className={labelClass}>Ảnh nền</label>
                                        <label className="flex flex-col items-center justify-center h-48 border border-slate-200 dark:border-slate-805 bg-slate-50 dark:bg-slate-950 rounded-xl cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-900 border-dashed transition-all relative overflow-hidden group">
                                            {heroBgPreview ? (
                                                <>
                                                    <img src={heroBgPreview} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-all duration-350" alt="Hero Preview" />
                                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center">
                                                        <span className="text-white text-xs font-semibold flex items-center gap-1"><UploadCloud className="h-4 w-4" /> Thay đổi ảnh</span>
                                                    </div>
                                                </>
                                            ) : (
                                                <div className="flex flex-col items-center justify-center p-6 text-slate-400">
                                                    <UploadCloud className="h-8 w-8 mb-2 stroke-1" />
                                                    <span className="text-xs font-semibold text-red-650 dark:text-red-400">Tải ảnh lên</span>
                                                    <span className="text-[10px] text-slate-400 mt-1 text-center">Định dạng JPG, PNG, WEBP. Tối đa 5MB.</span>
                                                </div>
                                            )}
                                            <input 
                                                type="file" 
                                                name="hero_bg_file" 
                                                className="hidden" 
                                                onChange={(e) => { 
                                                    if (e.target.files?.[0]) { 
                                                        setHeroBgPreview(URL.createObjectURL(e.target.files[0])); 
                                                        setHasUnsavedChanges(true); 
                                                    } 
                                                }} 
                                            />
                                        </label>
                                        {heroBgPreview && (
                                            <button
                                                type="button"
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    e.stopPropagation();
                                                    setHeroBgPreview(null);
                                                    setHeroBgPath("");
                                                    setHasUnsavedChanges(true);
                                                }}
                                                className="absolute top-8 right-2 p-1.5 bg-red-650 hover:bg-red-750 text-white rounded-lg z-20 shadow-sm transition-all active:scale-95 flex items-center gap-1 text-[10px] font-bold"
                                                title="Xóa ảnh nền"
                                            >
                                                <Trash2 className="h-3.5 w-3.5" /> Xóa ảnh
                                            </button>
                                        )}
                                        <input type="hidden" name="hero_bg_path" value={heroBgPath ?? ""} />
                                    </div>

                                    {/* Premium Live Mockup Overlay Banner */}
                                    <div className="hidden space-y-4">
                                        <div className="flex justify-between items-center">
                                            <label className={labelClass}>Lớp phủ & Mockup</label>
                                            <span className="text-xs font-mono px-2.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded-md text-slate-600 dark:text-slate-400 font-bold">{Math.round((bannerOpacity ?? 0.6) * 100)}% Opacity</span>
                                        </div>
                                        
                                        <input 
                                            type="range" 
                                            name="banner_opacity" 
                                            min="0" 
                                            max="1" 
                                            step="0.05" 
                                            value={bannerOpacity ?? 0.6} 
                                            onChange={(e) => {
                                                setBannerOpacity(parseFloat(e.target.value));
                                                setHasUnsavedChanges(true);
                                            }}
                                            className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-red-600" 
                                        />

                                        <div className="relative h-[134px] rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-inner bg-slate-900 flex items-center justify-center text-center p-6 select-none">
                                            {heroBgPreview ? (
                                                <img src={heroBgPreview} className="absolute inset-0 w-full h-full object-cover" alt="Hero Background Mockup" />
                                            ) : (
                                                <div className="absolute inset-0 bg-gradient-to-tr from-slate-900 to-slate-850" />
                                            )}
                                            <div className="absolute inset-0 transition-colors duration-200" style={{ backgroundColor: `rgba(15, 23, 42, ${bannerOpacity})` }} />
                                            <div className="relative z-10 space-y-2">
                                                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[9px] font-bold tracking-wider uppercase bg-red-600 text-white animate-pulse">
                                                    LIVE PREVIEW
                                                </span>
                                                <h4 className="text-sm font-bold text-white uppercase tracking-wide line-clamp-1">{bannerTitle || "TIÊU ĐỀ BANNER"}</h4>
                                                <p className="text-[10px] text-slate-300 line-clamp-2 max-w-[280px] mx-auto">{bannerDesc || "Mô tả ngắn hiển thị trên banner trang Về chúng tôi."}</p>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className={labelClass}>Tên người đại diện (VI)</label>
                                                <input name="representative_name" defaultValue={legalInfo.representative_name ?? ""} placeholder="Nguyễn Đình Thanh" className={inputClass} />
                                            </div>
                                            <div>
                                                <label className={labelClass}>Representative Name (EN)</label>
                                                <input name="representative_name_en" value={enFields.representative_name_en ?? ""} onChange={(e) => setEnFields(prev => ({ ...prev, representative_name_en: e.target.value }))} placeholder="Nguyen Dinh Thanh" className={inputClass} />
                                            </div>
                                            <div>
                                                <label className={labelClass}>Chức vụ (VI)</label>
                                                <input name="representative_title" defaultValue={legalInfo.representative_title ?? ""} placeholder="Giám đốc" className={inputClass} />
                                            </div>
                                            <div>
                                                <label className={labelClass}>Position (EN)</label>
                                                <input name="representative_title_en" value={enFields.representative_title_en ?? ""} onChange={(e) => setEnFields(prev => ({ ...prev, representative_title_en: e.target.value }))} placeholder="CEO & Founder" className={inputClass} />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className={`${surfaceClass} hidden`}>
                                <h3 className={sectionTitleClass}>Thông tin bổ sung & cam kết tuân thủ</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <input name="established_year" defaultValue={legalInfo.established_year} placeholder="Năm thành lập" className={inputClass} />
                                    <input name="core_business" defaultValue={legalInfo.core_business} placeholder="Lĩnh vực cốt lõi (VI)" className={inputClass} />
                                    <input name="core_business_en" defaultValue={legalInfo.core_business_en} placeholder="Core business (EN)" className={inputClass} />
                                    <input name="legal_badge" defaultValue={legalInfo.legal_badge} placeholder="Mã nhãn pháp lý (VI)" className={inputClass} />
                                    <input name="legal_badge_en" defaultValue={legalInfo.legal_badge_en} placeholder="Legal badge (EN)" className={inputClass} />
                                    <label className="flex items-center gap-3 text-[11px] font-bold uppercase tracking-wider text-slate-500"><input type="checkbox" name="legal_badge_visible" defaultChecked={legalInfo.legal_badge_visible !== false} className="h-4 w-4 accent-[#C8102E]" /> Hiển thị mã nhãn pháp lý</label>
                                    <input name="compliance_hotline" defaultValue={legalInfo.compliance_hotline} placeholder="Hotline / URL pháp lý" className={inputClass} />
                                    <label className={`${labelClass} flex items-center gap-3`}>Màu nhãn section <input type="color" name="section_badge_color" defaultValue={legalInfo.section_badge_color || "#0f172a"} className="h-8 w-12 cursor-pointer rounded border-0 p-0" /></label>
                                    <input name="compliance_title" defaultValue={legalInfo.compliance_title} placeholder="Tiêu đề cam kết (VI)" className={inputClass} />
                                    <input name="compliance_title_en" defaultValue={legalInfo.compliance_title_en} placeholder="Compliance title (EN)" className={inputClass} />
                                    <textarea name="compliance_desc" defaultValue={legalInfo.compliance_desc} placeholder="Nội dung cam kết (VI)" className={`${inputClass} resize-none`} rows={4} />
                                    <textarea name="compliance_desc_en" defaultValue={legalInfo.compliance_desc_en} placeholder="Compliance description (EN)" className={`${inputClass} resize-none`} rows={4} />
                                </div>
                            </div>
                        </div>

                        {/* 2. GIỚI THIỆU TAB */}
                        <div className={`${activeTab === 'general' ? 'block' : 'hidden'} space-y-6`}>
                            <div className={surfaceClass}>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className={labelClass}>Mã nhãn / Badge (VI)</label>
                                        <input name="intro_badge" defaultValue={legalInfo.intro_badge ?? ""} placeholder="Ví dụ: Về chúng tôi" className={inputClass} />
                                    </div>
                                    <div>
                                        <label className={labelClass}>Badge (EN)</label>
                                        <input name="intro_badge_en" value={enFields.intro_badge_en ?? ""} onChange={(e) => setEnFields(prev => ({ ...prev, intro_badge_en: e.target.value }))} placeholder="Example: About us" className={inputClass} />
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                                    {/* Left text fields */}
                                    <div className="md:col-span-8 space-y-4 [&>div:nth-child(n+4):nth-child(-n+7)]:hidden">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className={labelClass}>Tiêu đề bài viết (VI)</label>
                                                <input 
                                                    name="title" 
                                                    defaultValue={initialAbout?.title} 
                                                    placeholder="Ví dụ: Giới thiệu chung" 
                                                    className={inputClass} 
                                                />
                                            </div>
                                            <div>
                                                <label className={labelClass}>Title in English (EN)</label>
                                                <input 
                                                    name="title_en" 
                                                    defaultValue={initialAbout?.title_en} 
                                                    placeholder="Example: Company Overview" 
                                                    className={inputClass} 
                                                />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div><label className={labelClass}>Nội dung 1 (VI)</label><textarea name="intro_content_1" rows={4} defaultValue={initialAbout?.intro_content_1 ?? ""} className={`${inputClass} resize-none`} /></div>
                                            <div><label className={labelClass}>Content 1 (EN)</label><textarea name="intro_content_1_en" rows={4} value={enFields.intro_content_1_en ?? ""} onChange={(e) => setEnFields(prev => ({ ...prev, intro_content_1_en: e.target.value }))} className={`${inputClass} resize-none`} /></div>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div><label className={labelClass}>Số năm kinh nghiệm</label><input type="number" min="0" name="stat_years" defaultValue={legalInfo.stat_years ?? 10} className={inputClass} /></div>
                                            <div><label className={labelClass}>Số dự án hoàn thành</label><input type="number" min="0" name="stat_projects" defaultValue={legalInfo.stat_projects ?? 500} className={inputClass} /></div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className={labelClass}>Subtitle / Highlight (VI)</label>
                                                <input name="intro_highlight" defaultValue={legalInfo.intro_highlight ?? ""} placeholder="Dòng nhấn mạnh màu đỏ" className={inputClass} />
                                            </div>
                                            <div>
                                                <label className={labelClass}>Highlight (EN)</label>
                                                <input name="intro_highlight_en" value={enFields.intro_highlight_en ?? ""} onChange={(e) => setEnFields(prev => ({ ...prev, intro_highlight_en: e.target.value }))} placeholder="Highlighted subtitle" className={inputClass} />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className={labelClass}>Đoạn mở đầu / Lead (VI)</label>
                                                <textarea 
                                                    name="intro_lead" 
                                                    rows={3} 
                                                    defaultValue={initialAbout?.intro_lead} 
                                                    placeholder="Đoạn văn mở đầu nổi bật..." 
                                                    className={`${inputClass} resize-none`}
                                                />
                                            </div>
                                            <div>
                                                <label className={labelClass}>Lead Intro (EN)</label>
                                                <textarea 
                                                    name="intro_lead_en" 
                                                    rows={3} 
                                                    value={enFields.intro_lead_en ?? ""} 
                                                    onChange={(e) => {
                                                        setEnFields(prev => ({ ...prev, intro_lead_en: e.target.value }));
                                                        setHasUnsavedChanges(true);
                                                    }}
                                                    placeholder="Highlight lead introduction in English..." 
                                                    className={`${inputClass} resize-none`}
                                                />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className={labelClass}>Khung tiêu điểm / Focus Box (VI)</label>
                                                <textarea 
                                                    name="intro_box" 
                                                    rows={4} 
                                                    defaultValue={initialAbout?.intro_box} 
                                                    placeholder="Nội dung chính nổi bật nằm trong box..." 
                                                    className={`${inputClass} resize-none`}
                                                />
                                            </div>
                                            <div>
                                                <label className={labelClass}>Focus Box (EN)</label>
                                                <textarea 
                                                    name="intro_box_en" 
                                                    rows={4} 
                                                    value={enFields.intro_box_en ?? ""} 
                                                    onChange={(e) => {
                                                        setEnFields(prev => ({ ...prev, intro_box_en: e.target.value }));
                                                        setHasUnsavedChanges(true);
                                                    }}
                                                    placeholder="Main outstanding overview content in English..." 
                                                    className={`${inputClass} resize-none`}
                                                />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className={labelClass}>Đoạn kết bài / Footer (VI)</label>
                                                <textarea 
                                                    name="intro_footer" 
                                                    rows={3} 
                                                    defaultValue={initialAbout?.intro_footer} 
                                                    placeholder="Lời kết hoặc định hướng hành trình..." 
                                                    className={`${inputClass} resize-none`}
                                                />
                                            </div>
                                            <div>
                                                <label className={labelClass}>Footer Text (EN)</label>
                                                <textarea 
                                                    name="intro_footer_en" 
                                                    rows={3} 
                                                    value={enFields.intro_footer_en ?? ""} 
                                                    onChange={(e) => {
                                                        setEnFields(prev => ({ ...prev, intro_footer_en: e.target.value }));
                                                        setHasUnsavedChanges(true);
                                                    }}
                                                    placeholder="Concluding remarks in English..." 
                                                    className={`${inputClass} resize-none`}
                                                />
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div><label className={labelClass}>Tên người đại diện (VI)</label><input name="representative_name" defaultValue={legalInfo.representative_name ?? ""} className={inputClass} /></div>
                                            <div><label className={labelClass}>Representative Name (EN)</label><input name="representative_name_en" value={enFields.representative_name_en ?? ""} onChange={(e) => setEnFields(prev => ({ ...prev, representative_name_en: e.target.value }))} className={inputClass} /></div>
                                            <div><label className={labelClass}>Chức vụ (VI)</label><input name="representative_title" defaultValue={legalInfo.representative_title ?? ""} className={inputClass} /></div>
                                            <div><label className={labelClass}>Position (EN)</label><input name="representative_title_en" value={enFields.representative_title_en ?? ""} onChange={(e) => setEnFields(prev => ({ ...prev, representative_title_en: e.target.value }))} className={inputClass} /></div>
                                        </div>
                                    </div>

                                    {/* Right Image uploader */}
                                    <div className="md:col-span-4 relative">
                                        <label className={labelClass}>Ảnh đại diện doanh nghiệp (Representative Image)</label>
                                        <label className="flex flex-col items-center justify-center h-64 border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 rounded-xl cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-900 border-dashed transition-all relative overflow-hidden group">
                                            {imagePreview ? (
                                                <>
                                                    <img src={imagePreview} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-all duration-350" alt="Overview Representative" />
                                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center">
                                                        <span className="text-white text-xs font-semibold flex items-center gap-1"><UploadCloud className="h-4 w-4" /> Thay đổi ảnh</span>
                                                    </div>
                                                </>
                                            ) : (
                                                <div className="flex flex-col items-center justify-center p-6 text-slate-400">
                                                    <UploadCloud className="h-8 w-8 mb-2 stroke-1" />
                                                    <span className="text-xs font-semibold text-red-650 dark:text-red-400">Tải ảnh lên</span>
                                                    <span className="text-[10px] text-slate-400 mt-1 text-center">Định dạng JPG, PNG, WEBP. Tối đa 5MB.</span>
                                                </div>
                                            )}
                                            <input 
                                                type="file" 
                                                name="image_file" 
                                                className="hidden" 
                                                onChange={(e) => { 
                                                    if (e.target.files?.[0]) { 
                                                        setImagePreview(URL.createObjectURL(e.target.files[0])); 
                                                        setHasUnsavedChanges(true); 
                                                    } 
                                                }} 
                                            />
                                        </label>
                                        {imagePreview && (
                                            <button
                                                type="button"
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    e.stopPropagation();
                                                    setImagePreview(null);
                                                    setImagePath("");
                                                    setHasUnsavedChanges(true);
                                                }}
                                                className="absolute top-8 right-2 p-1.5 bg-red-650 hover:bg-red-750 text-white rounded-lg z-20 shadow-sm transition-all active:scale-95 flex items-center gap-1 text-[10px] font-bold"
                                                title="Xóa ảnh đại diện"
                                            >
                                                <Trash2 className="h-3.5 w-3.5" /> Xóa ảnh
                                            </button>
                                        )}
                                        <input type="hidden" name="imageUrl" value={imagePath ?? ""} />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* 3. SỨ MỆNH & TẦM NHÌN TAB */}
                        <div className={`${activeTab === 'vision' ? 'block' : 'hidden'} space-y-6`}>
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                {/* Vision Card */}
                                <div className={surfaceClass}>
                                    <h3 className={sectionTitleClass}>
                                        <Target className="h-4 w-4 text-red-600" /> Tầm nhìn / Vision
                                    </h3>
                                    <div>
                                        <label className={labelClass}>Tầm nhìn (VI)</label>
                                        <textarea 
                                            name="vision" 
                                            className={`${inputClass} min-h-[160px] resize-none`}
                                            defaultValue={initialAbout?.vision}
                                            placeholder="Định hướng tầm nhìn doanh nghiệp..."
                                        />
                                    </div>
                                    <div>
                                        <label className={labelClass}>Vision in English (EN)</label>
                                        <textarea 
                                            name="vision_en" 
                                            className={`${inputClass} min-h-[160px] resize-none`}
                                            value={enFields.vision_en ?? ""} 
                                            onChange={(e) => {
                                                setEnFields(prev => ({ ...prev, vision_en: e.target.value }));
                                                setHasUnsavedChanges(true);
                                            }}
                                            placeholder="Enterprise vision statement in English..."
                                        />
                                    </div>
                                </div>

                                {/* Mission Card */}
                                <div className={surfaceClass}>
                                    <h3 className={sectionTitleClass}>
                                        <Target className="h-4 w-4 text-red-600" /> Sứ mệnh / Mission
                                    </h3>
                                    <div>
                                        <label className={labelClass}>Sứ mệnh (VI)</label>
                                        <textarea 
                                            name="mission" 
                                            className={`${inputClass} min-h-[160px] resize-none`}
                                            defaultValue={initialAbout?.mission}
                                            placeholder="Sứ mệnh cốt lõi của doanh nghiệp..."
                                        />
                                    </div>
                                    <div>
                                        <label className={labelClass}>Mission in English (EN)</label>
                                        <textarea 
                                            name="mission_en" 
                                            className={`${inputClass} min-h-[160px] resize-none`}
                                            value={enFields.mission_en ?? ""} 
                                            onChange={(e) => {
                                                setEnFields(prev => ({ ...prev, mission_en: e.target.value }));
                                                setHasUnsavedChanges(true);
                                            }}
                                            placeholder="Core mission in English..."
                                        />
                                    </div>
                                </div>

                                {/* Core Values Card */}
                                <div className={surfaceClass}>
                                    <h3 className={sectionTitleClass}>
                                        <Target className="h-4 w-4 text-red-600" /> Giá trị cốt lõi / Values
                                    </h3>
                                    <div>
                                        <label className={labelClass}>Giá trị cốt lõi (VI)</label>
                                        <textarea 
                                            name="core_values" 
                                            className={`${inputClass} min-h-[160px] resize-none`}
                                            defaultValue={legalInfo.core_values || "An toàn — Chất lượng — Uy tín — Sáng tạo"}
                                            placeholder="Mỗi giá trị phân cách bằng dấu gạch ngang..."
                                        />
                                    </div>
                                    <div>
                                        <label className={labelClass}>Core Values (EN)</label>
                                        <textarea 
                                            name="core_values_en" 
                                            className={`${inputClass} min-h-[160px] resize-none`}
                                            value={enFields.core_values_en ?? ""} 
                                            onChange={(e) => {
                                                setEnFields(prev => ({ ...prev, core_values_en: e.target.value }));
                                                setHasUnsavedChanges(true);
                                            }}
                                            placeholder="Each value separated by a dash..."
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* 4. PHÁP LÝ TAB */}
                        <div className={`${activeTab === 'legal' ? 'flex' : 'hidden'} flex-col space-y-6 [&>div:nth-child(2)]:hidden`}>
                            <div className={`${surfaceClass} flex flex-col`}>
                                <div className="order-3 mb-6 border-t border-gray-100 pt-6">
                                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                        <div><label className={labelClass}>NĂM THÀNH LẬP (VI)</label><input name="established_year" defaultValue={legalInfo.established_year ?? ""} placeholder="2020" className={inputClass} /></div>
                                        <div><label className={labelClass}>FOUNDED YEAR (EN)</label><input name="established_year_en" defaultValue={legalInfo.established_year_en ?? legalInfo.established_year ?? ""} placeholder="2020" className={inputClass} /></div>
                                        <div><label className={labelClass}>LĨNH VỰC CỐT LÕI (VI)</label><input name="core_business" defaultValue={legalInfo.core_business ?? ""} placeholder="Dịch vụ kỹ thuật công nghiệp" className={inputClass} /></div>
                                        <div><label className={labelClass}>CORE FIELD (EN)</label><input name="core_business_en" defaultValue={legalInfo.core_business_en ?? ""} placeholder="Industrial Technical Services" className={inputClass} /></div>
                                    </div>
                                </div>
                                <div className="mb-5 grid grid-cols-1 gap-4 border-b border-slate-200 pb-5 md:grid-cols-2">
                                    <div><label className={labelClass}>Mã nhãn / Badge (VI)</label><input name="legal_badge" defaultValue={legalInfo.legal_badge ?? ""} placeholder="PHÁP LÝ & NĂNG LỰC" className={inputClass} /></div>
                                    <div><label className={labelClass}>Badge (EN)</label><input name="legal_badge_en" defaultValue={legalInfo.legal_badge_en ?? ""} placeholder="LEGAL & CAPABILITY" className={inputClass} /></div>
                                    <div><label className={labelClass}>Tiêu đề / Title (VI)</label><input name="legal_title" defaultValue={legalInfo.legal_title ?? ""} placeholder="NIỀM TIN DỰA TRÊN SỰ MINH BẠCH" className={inputClass} /></div>
                                    <div><label className={labelClass}>Title (EN)</label><input name="legal_title_en" defaultValue={legalInfo.legal_title_en ?? ""} placeholder="TRUST BASED ON TRANSPARENCY" className={inputClass} /></div>
                                </div>
                                <h3 className={sectionTitleClass}>
                                    <ShieldCheck className="h-4 w-4 text-red-600" /> Thông tin pháp lý doanh nghiệp
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className={labelClass}>Mã số thuế</label>
                                        <input 
                                            name="tax_id" 
                                            defaultValue={legalInfo.tax_id} 
                                            placeholder="Ví dụ: 3702888448" 
                                            className={inputClass} 
                                        />
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className={labelClass}>Người đại diện pháp luật</label>
                                            <input 
                                                name="representative_name" 
                                                defaultValue={legalInfo.representative_name} 
                                                placeholder="Nguyễn Văn A" 
                                                className={inputClass} 
                                            />
                                        </div>
                                        <div>
                                            <label className={labelClass}>Chức danh</label>
                                            <input 
                                                name="representative_title" 
                                                defaultValue={legalInfo.representative_title} 
                                                placeholder="Giám đốc / Đại diện" 
                                                className={inputClass} 
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className={surfaceClass}>
                                <h3 className={sectionTitleClass}>
                                    <ShieldCheck className="h-4 w-4 text-red-600" /> Giới thiệu tư cách pháp nhân
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className={labelClass}>Mô tả pháp nhân (VI)</label>
                                        <textarea 
                                            name="legal_desc" 
                                            rows={6} 
                                            className={`${inputClass} resize-none`} 
                                            defaultValue={legalInfo.legal_desc}
                                            placeholder="Nhập thông tin đăng ký pháp nhân doanh nghiệp..."
                                        />
                                    </div>
                                    <div>
                                        <label className={labelClass}>Legal Status (EN)</label>
                                        <textarea 
                                            name="legal_desc_en" 
                                            rows={6} 
                                            className={`${inputClass} resize-none`} 
                                            defaultValue={legalInfo.legal_desc_en}
                                            placeholder="Enter registered legal entity status narrative in English..."
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* 5. KÊU GỌI HÀNH ĐỘNG (CTA) TAB */}
                        <div className={`${activeTab === 'process' ? 'block' : 'hidden'} space-y-6`}><div className={surfaceClass}><h3 className={sectionTitleClass}>Quy trình làm việc</h3><div className="grid gap-4 md:grid-cols-2"><input name="process_badge" defaultValue={legalInfo.process?.badge_vi ?? "QUY TRÌNH CHUYÊN NGHIỆP"} placeholder="Badge VI" className={inputClass} /><input name="process_badge_en" defaultValue={legalInfo.process?.badge_en ?? "PROFESSIONAL PROCESS"} placeholder="Badge EN" className={inputClass} /><input name="process_title_line1" defaultValue={legalInfo.process?.title_line1_vi ?? "QUY TRÌNH LÀM VIỆC"} placeholder="Tiêu đề dòng 1 VI" className={inputClass} /><input name="process_title_line1_en" defaultValue={legalInfo.process?.title_line1_en ?? "WORK PROCESS"} placeholder="Title line 1 EN" className={inputClass} /><input name="process_title_line2" defaultValue={legalInfo.process?.title_line2_vi ?? "CHUYÊN NGHIỆP"} placeholder="Tiêu đề dòng 2 VI" className={inputClass} /><input name="process_title_line2_en" defaultValue={legalInfo.process?.title_line2_en ?? "PROFESSIONAL"} placeholder="Title line 2 EN" className={inputClass} /><textarea name="process_desc" defaultValue={legalInfo.process?.desc_vi ?? ""} placeholder="Mô tả VI" rows={3} className={`${inputClass} resize-none`} /><textarea name="process_desc_en" defaultValue={legalInfo.process?.desc_en ?? ""} placeholder="Description EN" rows={3} className={`${inputClass} resize-none`} /></div><div className="mt-6 flex items-center justify-between"><h4 className="text-xs font-black uppercase tracking-wider text-slate-500">Workflow Steps</h4><button type="button" onClick={() => { setWorkflowSteps(prev => [...prev, { step: String(prev.length + 1).padStart(2, "0"), title_vi: "", title_en: "", desc_vi: "", desc_en: "", image: "" }]); setHasUnsavedChanges(true); }} className="rounded-lg bg-[#C8102E] px-3 py-2 text-xs font-bold text-white">+ Thêm bước</button></div><div className="mt-3 space-y-4">{workflowSteps.map((step: any, index: number) => <div key={index} className="rounded-xl border border-slate-200 p-4"><div className="grid gap-3 md:grid-cols-5"><input value={step.step ?? ""} placeholder="01" onChange={e => setWorkflowSteps(prev => prev.map((item, i) => i === index ? { ...item, step: e.target.value } : item))} className={inputClass} /><input value={step.title_vi ?? ""} placeholder="Tên bước VI" onChange={e => setWorkflowSteps(prev => prev.map((item, i) => i === index ? { ...item, title_vi: e.target.value } : item))} className={inputClass} /><input value={step.title_en ?? ""} placeholder="Step title EN" onChange={e => setWorkflowSteps(prev => prev.map((item, i) => i === index ? { ...item, title_en: e.target.value } : item))} className={inputClass} /><textarea value={step.desc_vi ?? ""} placeholder="Mô tả VI" onChange={e => setWorkflowSteps(prev => prev.map((item, i) => i === index ? { ...item, desc_vi: e.target.value } : item))} className={`${inputClass} resize-none`} rows={2} /><textarea value={step.desc_en ?? ""} placeholder="Description EN" onChange={e => setWorkflowSteps(prev => prev.map((item, i) => i === index ? { ...item, desc_en: e.target.value } : item))} className={`${inputClass} resize-none`} rows={2} /></div><button type="button" onClick={() => setWorkflowSteps(prev => prev.filter((_, i) => i !== index))} className="mt-3 text-xs font-bold text-red-600">Xóa bước</button></div>)}</div><textarea name="process_json" value={JSON.stringify({ steps: workflowSteps })} readOnly className="hidden" /></div></div>

                        <div className={`${activeTab === 'cta' ? 'block' : 'hidden'} space-y-6`}>
                            <div className={surfaceClass}>
                                <div className="flex justify-between items-center pb-4 border-b border-slate-100 dark:border-slate-800">
                                    <h3 className="hidden">
                                        <Plus className="h-4 w-4 text-red-600" /> Cấu hình Nút kêu gọi hành động (CTA)
                                    </h3>
                                    <label className="hidden">
                                        <input 
                                            type="checkbox" 
                                            checked={ctaActive} 
                                            onChange={() => {
                                                setCtaActive(!ctaActive);
                                                setHasUnsavedChanges(true);
                                            }}
                                            className="sr-only peer" 
                                        />
                                        <div className="w-11 h-6 bg-slate-200 dark:bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-350 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
                                        <span className="ml-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Kích hoạt CTA</span>
                                    </label>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className={labelClass}>Huy hiệu / Badge CTA (VI)</label>
                                        <input 
                                            name="cta_badge" 
                                            defaultValue={legalInfo.cta_badge} 
                                            placeholder="Ví dụ: Liên hệ với chúng tôi" 
                                            className={inputClass} 
                                        />
                                    </div>
                                    <div>
                                        <label className={labelClass}>Badge (EN)</label>
                                        <input 
                                            name="cta_badge_en" 
                                                    value={enFields.cta_badge_en ?? ""}
                                            onChange={(e) => {
                                                setEnFields(prev => ({ ...prev, cta_badge_en: e.target.value }));
                                                setHasUnsavedChanges(true);
                                            }}
                                            placeholder="Example: Contact Us" 
                                            className={inputClass} 
                                        />
                                    </div>
                                </div>

                                <div className="hidden grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className={labelClass}>Tiêu đề chính / Title (VI)</label>
                                        <input 
                                            name="cta_title" 
                                            defaultValue={legalInfo.cta_title} 
                                            placeholder="Sẵn sàng hợp tác cùng Maintech?" 
                                            className={inputClass} 
                                        />
                                    </div>
                                    <div>
                                        <label className={labelClass}>Title (EN)</label>
                                        <input 
                                            name="cta_title_en" 
                                                    value={enFields.cta_title_en ?? ""}
                                            onChange={(e) => {
                                                setEnFields(prev => ({ ...prev, cta_title_en: e.target.value }));
                                                setHasUnsavedChanges(true);
                                            }}
                                            placeholder="Ready to cooperate with Maintech?" 
                                            className={inputClass} 
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div><label className={labelClass}>Tiêu đề dòng 1 (VI)</label><input name="cta_title_line1" defaultValue={legalInfo.cta_title_line1 ?? legalInfo.cta_title ?? ""} className={inputClass} /></div>
                                    <div><label className={labelClass}>Title line 1 (EN)</label><input name="cta_title_line1_en" defaultValue={legalInfo.cta_title_line1_en ?? legalInfo.cta_title_en ?? ""} className={inputClass} /></div>
                                    <div className="hidden"><label className={labelClass}>Màu dòng 1</label><input name="cta_title_line1_color" value="#0f172a" readOnly className={inputClass} /></div>
                                    <div className="hidden"><label className={labelClass}>Cỡ dòng 1 (px)</label><input type="number" name="cta_title_line1_size" value="48" readOnly className={inputClass} /></div>
                                    <div><label className={labelClass}>Tiêu đề dòng 2 (VI)</label><input name="cta_title_line2" defaultValue={legalInfo.cta_title_line2 ?? ""} className={inputClass} /></div>
                                    <div><label className={labelClass}>Title line 2 (EN)</label><input name="cta_title_line2_en" defaultValue={legalInfo.cta_title_line2_en ?? ""} className={inputClass} /></div>
                                    <div className="hidden"><label className={labelClass}>Màu dòng 2</label><input name="cta_title_line2_color" value="#C8102E" readOnly className={inputClass} /></div>
                                    <div className="hidden"><label className={labelClass}>Cỡ dòng 2 (px)</label><input type="number" name="cta_title_line2_size" value="48" readOnly className={inputClass} /></div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className={labelClass}>Mô tả phụ / Description (VI)</label>
                                        <textarea 
                                            name="cta_desc" 
                                            rows={3} 
                                            className={`${inputClass} resize-none`} 
                                            defaultValue={legalInfo.cta_desc}
                                            placeholder="Liên hệ ngay để nhận giải pháp kỹ thuật tối ưu..."
                                        />
                                    </div>
                                    <div>
                                        <label className={labelClass}>Description (EN)</label>
                                        <textarea 
                                            name="cta_desc_en" 
                                            rows={3} 
                                            className={`${inputClass} resize-none`} 
                                                    value={enFields.cta_desc_en ?? ""}
                                            onChange={(e) => {
                                                setEnFields(prev => ({ ...prev, cta_desc_en: e.target.value }));
                                                setHasUnsavedChanges(true);
                                            }}
                                            placeholder="Get in touch now to receive premium engineering solutions..."
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div>
                                        <label className={labelClass}>Chữ trên Nút / Button Text (VI)</label>
                                        <input 
                                            name="cta_btn_text" 
                                            defaultValue={legalInfo.cta_btn_text} 
                                            placeholder="Liên hệ ngay" 
                                            className={inputClass} 
                                        />
                                    </div>
                                    <div>
                                        <label className={labelClass}>Button Text (EN)</label>
                                        <input 
                                            name="cta_btn_text_en" 
                                                    value={enFields.cta_btn_text_en ?? ""}
                                            onChange={(e) => {
                                                setEnFields(prev => ({ ...prev, cta_btn_text_en: e.target.value }));
                                                setHasUnsavedChanges(true);
                                            }}
                                            placeholder="Contact Now" 
                                            className={inputClass} 
                                        />
                                    </div>
                                    <div>
                                        <label className={labelClass}>Đường dẫn / Button Link</label>
                                        <input 
                                            name="cta_btn_link" 
                                            defaultValue={legalInfo.cta_btn_link || ""} 
                                            placeholder="Ví dụ: /contact" 
                                            className={inputClass} 
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </form>

                    {/* 6. CHỨNG CHỈ TAB (NON-UNMOUNTING DOM VIA HIDDEN CLASS) */}
                    <div className={activeTab === "certs" ? "space-y-6 pb-12 animate-in fade-in duration-300" : "hidden"}>
                        <section className="space-y-6">
                            <div className="flex items-center justify-between [&>div:first-child]:hidden">
                                <div><h2 className="text-lg font-black uppercase text-slate-900 dark:text-white">{language === "en" ? "Team Management" : "Quản lý Đội ngũ Nhân sự"}</h2><p className="mt-1 text-xs text-slate-500">{language === "en" ? "Manage specialists and their credentials." : "Quản lý thông tin nhân sự và bằng cấp cá nhân."}</p></div>
                            <button type="button" onClick={() => setStaffMembers(prev => [...prev, { name: "", name_en: "", role_vi: "", role_en: "", image: "", credentials: [] }])} className="inline-flex items-center gap-2 rounded-xl bg-[#C8102E] px-4 py-2 text-xs font-bold text-white"><Plus className="h-4 w-4" />{language === "en" ? "Add staff" : "Thêm nhân sự"}</button>
                            </div>
                                <div className="grid gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-950 md:grid-cols-2">
                                <div className="md:col-span-2 border-b border-slate-200 pb-1 text-[9px] font-bold uppercase tracking-wider text-slate-400 dark:border-slate-800">Nhãn (Badge)</div>
                                <div className="grid gap-2"><input name="staff_badge_vi" defaultValue={legalInfo.staff_header?.badge_vi ?? ""} placeholder="Badge VI" className={inputClass} /></div>
                                <div className="grid gap-2"><input name="staff_badge_en" defaultValue={legalInfo.staff_header?.badge_en ?? ""} placeholder="Badge EN" className={inputClass} /></div>
                                <div className="md:col-span-2 border-b border-slate-200 pb-1 pt-3 text-[9px] font-bold uppercase tracking-wider text-slate-400 dark:border-slate-800">Tiêu đề chính (Title)</div>
                                <div className="grid gap-2"><input name="staff_title_vi" value={staffTitleVi ?? ""} onChange={e => { setStaffTitleVi(e.target.value); setHasUnsavedChanges(true); }} placeholder="Tiêu đề VI" className={inputClass} /></div>
                                <div className="grid gap-2"><input name="staff_title_en" value={staffTitleEn ?? ""} onChange={e => { setStaffTitleEn(e.target.value); setHasUnsavedChanges(true); }} placeholder="Title EN" className={inputClass} /></div>
                            </div>
                            <div className="grid gap-6 lg:grid-cols-5">
                                <div className="space-y-3 lg:col-span-2" onClickCapture={(event) => { const row = (event.target as HTMLElement).closest("button"); if (row?.parentElement === event.currentTarget) setSelectedStaffIndex(Array.from(event.currentTarget.children).indexOf(row)); }}>
                                    {staffMembers.map((member, index) => <button type="button" key={index} onClick={() => document.getElementById(`staff-${index}`)?.scrollIntoView({ behavior: "smooth", block: "center" })} className="flex w-full items-center gap-3 rounded-xl border border-slate-200 bg-white p-3 text-left hover:border-[#C8102E] dark:border-slate-800 dark:bg-slate-900"><div className="h-12 w-12 overflow-hidden rounded-lg bg-slate-100">{member.image && <img src={member.image} className="h-full w-full object-cover" alt="" />}</div><span className="min-w-0 flex-1"><b className="block truncate text-sm text-slate-800 dark:text-white">{member.name || (language === "en" ? "Unnamed specialist" : "Nhân sự chưa đặt tên")}</b><small className="block truncate text-xs text-slate-500">{member.role_vi || member.role_en}</small></span></button>)}
                                </div>
                                <div className="space-y-5 lg:col-span-3">
                                    {staffMembers.length === 0 && <div className="rounded-xl border border-dashed border-slate-300 p-10 text-center text-sm text-slate-500">{language === "en" ? "Add a staff member to begin." : "Bấm Thêm nhân sự để bắt đầu."}</div>}
                                    {staffMembers.map((member, index) => selectedStaffIndex === index && <div id={`staff-${index}`} key={index} className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
                                        <div className="grid gap-3 sm:grid-cols-2"><input value={member.name ?? ""} placeholder={language === "en" ? "Staff name (VI)" : "Tên nhân viên VI"} onChange={e => setStaffMembers(prev => prev.map((m, i) => i === index ? { ...m, name: e.target.value } : m))} className={inputClass} /><input value={member.name_en ?? ""} placeholder="Tên tiếng Anh (Name EN)" onChange={e => setStaffMembers(prev => prev.map((m, i) => i === index ? { ...m, name_en: e.target.value } : m))} className={inputClass} /><input value={member.role_vi ?? ""} placeholder="Chức vụ VI" onChange={e => setStaffMembers(prev => prev.map((m, i) => i === index ? { ...m, role_vi: e.target.value } : m))} className={inputClass} /><input value={member.role_en ?? ""} placeholder="Position EN" onChange={e => setStaffMembers(prev => prev.map((m, i) => i === index ? { ...m, role_en: e.target.value } : m))} className={inputClass} /><label className="flex cursor-pointer items-center gap-2 rounded-xl border border-dashed border-slate-300 px-3 py-2 text-xs font-bold text-[#C8102E]"><UploadCloud className="h-4 w-4" />{language === "en" ? "Staff photo" : "Ảnh nhân viên"}<input type="file" accept="image/*" className="hidden" onChange={e => { const file = e.currentTarget.files?.[0]; if (!file) return; const input = e.currentTarget; const reader = new FileReader(); reader.onload = () => { setStaffMembers(prev => prev.map((m, i) => i === index ? { ...m, image: String(reader.result || "") } : m)); input.value = ""; }; reader.readAsDataURL(file); }} /></label></div>
                                        <div className="mt-5 space-y-3"><div className="flex items-center justify-between"><h3 className="text-xs font-black uppercase tracking-wider text-slate-500">{language === "en" ? "Credentials" : "Bằng cấp / chứng chỉ"}</h3><button type="button" onClick={() => setStaffMembers(prev => prev.map((m, i) => i === index ? { ...m, credentials: [...(m.credentials || []), { name_vi: "", name_en: "", image: "" }] } : m))} className="text-xs font-bold text-[#C8102E]">+ {language === "en" ? "Add credential" : "Thêm bằng cấp"}</button></div>{(member.credentials || []).map((credential: any, credentialIndex: number) => <div key={credentialIndex} className="grid gap-2 rounded-xl bg-slate-50 p-3 sm:grid-cols-3 dark:bg-slate-950"><input value={credential.name_vi || ""} placeholder="Tên bằng cấp VI" onChange={e => setStaffMembers(prev => prev.map((m, i) => i === index ? { ...m, credentials: m.credentials.map((c: any, ci: number) => ci === credentialIndex ? { ...c, name_vi: e.target.value } : c) } : m))} className={inputClass} /><input value={credential.name_en || ""} placeholder="Credential EN" onChange={e => setStaffMembers(prev => prev.map((m, i) => i === index ? { ...m, credentials: m.credentials.map((c: any, ci: number) => ci === credentialIndex ? { ...c, name_en: e.target.value } : c) } : m))} className={inputClass} /><label className="flex cursor-pointer items-center gap-2 rounded-xl border border-dashed border-slate-300 px-3 py-2 text-[10px] font-bold text-[#C8102E]"><UploadCloud className="h-4 w-4" />{credential.image ? "Đổi ảnh" : "Tải ảnh"}<input type="file" accept="image/*" className="hidden" onChange={e => { const file = e.currentTarget.files?.[0]; if (!file) return; const input = e.currentTarget; const reader = new FileReader(); reader.onload = () => { setStaffMembers(prev => prev.map((m, i) => i === index ? { ...m, credentials: m.credentials.map((c: any, ci: number) => ci === credentialIndex ? { ...c, image: String(reader.result || "") } : c) } : m)); input.value = ""; }; reader.readAsDataURL(file); }} /></label></div>)}</div>
                                        <button type="button" onClick={() => setStaffMembers(prev => prev.filter((_, i) => i !== index))} className="mt-4 text-xs font-bold text-red-600">{language === "en" ? "Remove staff" : "Xóa nhân sự"}</button>
                                    </div>)}
                                </div>
                            </div>
                        </section>
                        <div className="hidden">
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-295px)] min-h-[440px] pb-6">
                            
                            {/* Column 1: Categories Manager (Span 4) */}
                            <div className="lg:col-span-4 flex flex-col h-full bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
                                <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/20 flex items-center justify-between">
                                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-455 flex items-center gap-1.5">
                                        <FolderOpen className="h-4 w-4 text-red-600" /> Loại chứng chỉ
                                    </h3>
                                    <span className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-550 dark:text-slate-400 font-bold px-2 py-0.5 rounded-full">
                                        {categories.length}
                                    </span>
                                </div>

                                {/* Form: Add Category Quick */}
                                <form onSubmit={handleCreateCategory} className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/20 dark:bg-slate-955/10 space-y-3">
                                    <div className="grid grid-cols-1 gap-2">
                                        <input 
                                            name="title_vi" 
                                            required
                                            placeholder="Tên loại tiếng Việt (ví dụ: An toàn)" 
                                            className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg outline-none focus-visible:ring-1 focus-visible:ring-red-500 text-slate-800 dark:text-slate-100"
                                        />
                                        <input 
                                            name="title_en" 
                                            placeholder="Tên loại tiếng Anh (Không bắt buộc)" 
                                            className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg outline-none focus-visible:ring-1 focus-visible:ring-red-500 text-slate-800 dark:text-slate-100"
                                        />
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full py-2 bg-red-700 hover:bg-red-800 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1 transition-all"
                                    >
                                        <Plus className="h-3.5 w-3.5" /> Thêm loại chứng chỉ
                                    </button>
                                </form>

                                {/* Categories list (Scrollable) */}
                                <div className="flex-1 overflow-y-auto p-4 space-y-2 select-none">
                                    {categories.map((cat, idx) => {
                                        const isSelected = selectedCatId === cat.id;
                                        const certsCount = localCerts.filter(c => c.desc_vi === cat.title_vi).length;
                                        
                                        return (
                                            <div 
                                                key={cat.id} 
                                                draggable 
                                                onDragStart={(e) => { setDraggedCatIndex(idx); e.dataTransfer.effectAllowed = "move"; }} 
                                                onDrop={(e) => handleDropCategory(e, idx)} 
                                                onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
                                                onDragEnter={(e) => e.preventDefault()}
                                                onDragEnd={() => setDraggedCatIndex(null)}
                                                onClick={() => {
                                                    setSelectedCatId(cat.id);
                                                    setCertPage(1);
                                                }}
                                                className={`flex items-center justify-between border rounded-xl p-2.5 transition-all cursor-pointer ${
                                                    draggedCatIndex === idx 
                                                        ? 'opacity-40 border-dashed border-red-500 scale-95' 
                                                        : isSelected
                                                            ? 'border-red-600 dark:border-red-500 bg-red-50/10 dark:bg-red-955/10 shadow-sm ring-1 ring-red-600 dark:ring-red-500'
                                                            : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-850'
                                                }`}
                                            >
                                                <div className="flex items-center gap-2 min-w-0">
                                                    <div className="cursor-grab active:cursor-grabbing text-slate-400 dark:text-slate-655 shrink-0">
                                                        <GripVertical className="h-4 w-4" />
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="text-xs font-bold text-slate-700 dark:text-slate-350 truncate">
                                                            {cat.title_vi}
                                                        </p>
                                                        {cat.title_en && (
                                                            <p className="text-[10px] text-slate-400 dark:text-slate-500 truncate">
                                                                {cat.title_en}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-1.5 shrink-0 ml-2" onClick={e => e.stopPropagation()}>
                                                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                                                        {certsCount}
                                                    </span>
                                                    <button 
                                                        type="button" 
                                                        onClick={() => handleEditCategoryName(cat)} 
                                                        className="p-1 text-slate-400 hover:text-blue-500 dark:hover:text-blue-400 transition-colors" 
                                                        title="Đổi tên"
                                                    >
                                                        <Edit3 className="h-3.5 w-3.5" />
                                                    </button>
                                                    <button 
                                                        type="button" 
                                                        onClick={() => handleDeleteCategory(cat)} 
                                                        className="p-1 text-slate-400 hover:text-red-500 dark:hover:text-red-400 transition-colors" 
                                                        title="Xóa loại"
                                                    >
                                                        <Trash2 className="h-3.5 w-3.5" />
                                                    </button>
                                                </div>
                                            </div>
                                        );
                                    })}

                                    {categories.length === 0 && (
                                        <div className="py-8 text-center text-slate-400 dark:text-slate-600 flex flex-col items-center gap-1">
                                            <FolderOpen className="h-6 w-6 stroke-1" />
                                            <p className="text-xs font-semibold">{language === "en" ? "No categories yet" : "Chưa có loại chứng chỉ nào"}</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Column 2: Certificates List & Manager (Span 8) */}
                            <div className="lg:col-span-8 flex flex-col h-full bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
                                <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/20 flex items-center justify-between">
                                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                                        <FileBadge className="h-4 w-4 text-red-600" />
                                        <span>{language === "en" ? "Category:" : "Chứng chỉ thuộc loại:"} </span>
                                        <span className="text-red-655 dark:text-red-400 underline font-extrabold">
                                            {(language === "en" ? activeCategoryObj?.title_en : activeCategoryObj?.title_vi) || activeCategoryObj?.title_vi || (language === "en" ? "Not selected" : "Chưa chọn")}
                                        </span>
                                    </h3>
                                    {activeCategoryObj && (
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setEditingCert(null);
                                                setCertFiles([]);
                                                setIsCertFormOpen(!isCertFormOpen);
                                            }}
                                            className="px-3 py-1 bg-red-700 hover:bg-red-800 text-white rounded-lg text-[10px] font-bold flex items-center gap-1 transition-all"
                                        >
                                            {isCertFormOpen ? (language === "en" ? "Close form" : "Đóng form") : (language === "en" ? "Add Certificate" : "Thêm chứng chỉ")}
                                        </button>
                                    )}
                                </div>

                                {/* Form: Collapsible Create/Edit Certificate Form */}
                                {(isCertFormOpen || editingCert) && activeCategoryObj && (
                                    <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-955/15 animate-in slide-in-from-top-2 duration-200">
                                        <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-slate-800 mb-3">
                                            <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                                                {editingCert ? (language === "en" ? "UPDATE CERTIFICATE" : "CẬP NHẬT CHỨNG CHỈ") : (language === "en" ? "UPLOAD NEW CERTIFICATE" : "TẢI LÊN CHỨNG CHỈ MỚI")}
                                            </h4>
                                            {editingCert && (
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setEditingCert(null);
                                                        setCertFiles([]);
                                                    }}
                                                    className="text-[10px] text-red-655 hover:text-red-750 font-bold"
                                                >
                                                    {language === "en" ? "Cancel edit" : "Hủy sửa"}
                                                </button>
                                            )}
                                        </div>

                                        <form onSubmit={handleAddCertBulk} className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
                                            <div className="sm:col-span-4">
                                                <label className={labelClass}>{language === "en" ? "Vietnamese Name (Leave blank to use filename)" : "Tên Tiếng Việt (Để trống lấy tên file)"}</label>
                                                <input 
                                                    name="title_vi" 
                                                    defaultValue={editingCert?.title_vi || ""}
                                                    placeholder={language === "en" ? "Vietnamese name..." : "Tên bằng tiếng Việt..."}
                                                    className={inputClass}
                                                />
                                            </div>
                                            <div className="sm:col-span-4">
                                                <label className={labelClass}>{language === "en" ? "English Name (Optional)" : "Tên Tiếng Anh (Không bắt buộc)"}</label>
                                                <input 
                                                    name="title_en" 
                                                    defaultValue={editingCert?.title_en || ""}
                                                    placeholder="Name in English..."
                                                    className={inputClass}
                                                />
                                            </div>
                                            <div className="sm:col-span-3">
                                                <label className={labelClass}>{language === "en" ? "Choose Image file" : "Chọn File ảnh"}</label>
                                                <label className="flex items-center gap-2 px-3 py-2.5 bg-white dark:bg-slate-955 border border-slate-205 dark:border-slate-800 rounded-xl cursor-pointer hover:bg-slate-50 border-dashed overflow-hidden text-ellipsis select-none">
                                                    <UploadCloud className="h-4 w-4 text-slate-450 shrink-0" />
                                                    <span className="text-[10px] font-bold text-red-655 dark:text-red-400 truncate">
                                                        {certFiles.length > 0 ? (language === "en" ? `Selected ${certFiles.length} file(s)` : `Đã chọn ${certFiles.length} file`) : editingCert ? (language === "en" ? "Change image" : "Thay ảnh khác") : (language === "en" ? "Select file..." : "Chọn file...")}
                                                    </span>
                                                    <input 
                                                        type="file" 
                                                        multiple={!editingCert}
                                                        name="image_file"
                                                        required={!editingCert}
                                                        className="hidden"
                                                        onChange={e => {
                                                            if (e.target.files) setCertFiles(Array.from(e.target.files));
                                                        }}
                                                    />
                                                </label>
                                            </div>
                                            <div className="sm:col-span-1">
                                                <button
                                                    type="submit"
                                                    disabled={loading}
                                                    className="w-full h-10 bg-red-700 hover:bg-red-800 text-white rounded-xl flex items-center justify-center transition-all disabled:opacity-50"
                                                    title={editingCert ? (language === "en" ? "Update" : "Cập nhật") : (language === "en" ? "Upload" : "Tải lên")}
                                                >
                                                    {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4 stroke-[2.5]" />}
                                                </button>
                                            </div>
                                        </form>
                                    </div>
                                )}

                                {/* Scrollable Certificates list */}
                                <div className="flex-1 overflow-y-auto p-4 select-none">
                                    {currentDisplayCerts.length > 0 ? (
                                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                                            {currentDisplayCerts.map((cert) => {
                                                const isVisible = cert.status === "HIỂN THỊ";
                                                return (
                                                    <div 
                                                        key={cert.id} 
                                                        className="group relative border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-xl p-3 flex flex-col items-center hover:border-red-300 dark:hover:border-red-800 hover:shadow-sm transition-all"
                                                    >
                                                        {/* Top status bar & Visibility Toggler */}
                                                        <div className="absolute top-2 left-2 flex gap-1 z-10">
                                                            <button 
                                                                type="button"
                                                                onClick={() => handleToggleCertStatus(cert)}
                                                                className={`p-1 bg-white dark:bg-slate-800 border rounded-lg shadow-sm transition-colors ${
                                                                    isVisible 
                                                                        ? 'text-green-600 border-green-200 hover:bg-green-50' 
                                                                        : 'text-slate-450 border-slate-200 hover:bg-slate-100'
                                                                }`}
                                                                title={language === "en" ? (isVisible ? "DISPLAYING - Click to Hide" : "HIDDEN - Click to Show") : (isVisible ? "Đang HIỂN THỊ - Bấm để Ẩn" : "Đang ẨN - Bấm để Hiển thị")}
                                                            >
                                                                {isVisible ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
                                                            </button>
                                                        </div>

                                                        {/* Action tools right */}
                                                        <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-all z-10">
                                                            <button 
                                                                type="button" 
                                                                onClick={() => { 
                                                                    setEditingCert(cert); 
                                                                    setCertFiles([]); 
                                                                    setIsCertFormOpen(true);
                                                                }} 
                                                                className="p-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-blue-600 rounded-lg hover:bg-blue-50 shadow-sm"
                                                                title={language === "en" ? "Edit" : "Sửa"}
                                                            >
                                                                <Edit3 className="h-3.5 w-3.5" />
                                                            </button>
                                                            <button 
                                                                type="button" 
                                                                onClick={() => handleDeleteCert(cert.id)}
                                                                className="p-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-red-655 rounded-lg hover:bg-red-50 shadow-sm"
                                                                title={language === "en" ? "Delete" : "Xóa"}
                                                            >
                                                                <Trash2 className="h-3.5 w-3.5" />
                                                            </button>
                                                        </div>

                                                        {/* Thumbnail container */}
                                                        <div className="w-full aspect-[3/4] flex items-center justify-center p-2 mb-2 bg-slate-50 dark:bg-slate-955 rounded-lg overflow-hidden relative">
                                                            {cert.imageUrl ? (
                                                                <img 
                                                                    src={cert.imageUrl} 
                                                                    className={`max-h-full max-w-full object-contain mix-blend-multiply dark:mix-blend-normal transition-all ${!isVisible ? 'opacity-30 grayscale' : ''}`} 
                                                                    alt="Certificate Thumbnail" 
                                                                />
                                                            ) : (
                                                                <div className="text-slate-350 dark:text-slate-755 flex flex-col items-center">
                                                                    <ImageIcon className="h-8 w-8 stroke-1" />
                                                                    <span className="text-[9px] mt-1 font-bold">NO IMAGE</span>
                                                                </div>
                                                            )}
                                                            {!isVisible && (
                                                                <div className="absolute inset-0 bg-slate-900/5 flex items-center justify-center pointer-events-none">
                                                                    <span className="text-[9px] font-bold uppercase bg-slate-800 text-white px-2 py-0.5 rounded shadow">
                                                                        {language === "en" ? "HIDDEN" : "ĐANG ẨN"}
                                                                    </span>
                                                                </div>
                                                            )}
                                                        </div>
                                                        
                                                        <p className="text-[11px] font-bold text-slate-700 dark:text-slate-300 text-center line-clamp-2 w-full px-1 mb-2" title={cert.title_vi}>
                                                            {language === "en" ? (cert.title_en || cert.title_vi) : cert.title_vi}
                                                        </p>

                                                        {/* Direct sort numerical box */}
                                                        <div className="w-full pt-1.5 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
                                                            <span className="text-[9px] font-bold text-slate-405 uppercase">{language === "en" ? "Order:" : "Thứ tự:"}</span>
                                                            <input
                                                                type="number"
                                                                defaultValue={cert.order || 0}
                                                                onBlur={e => {
                                                                    const val = parseInt(e.target.value);
                                                                    if (!isNaN(val) && val !== cert.order) {
                                                                        handleUpdateCertOrder(cert.id, val);
                                                                    }
                                                                }}
                                                                className="w-12 text-center text-xs font-semibold py-0.5 border border-slate-205 dark:border-slate-800 bg-slate-50 dark:bg-slate-955 rounded-md focus:border-red-500 outline-none"
                                                            />
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    ) : (
                                        <div className="py-20 text-center text-slate-400 dark:text-slate-655 flex flex-col items-center justify-center gap-2">
                                            <ImageIcon className="h-8 w-8 stroke-1 animate-pulse" />
                                            <p className="text-xs font-bold">
                                                {language === "en" ? "No certificates in this category" : "Không có chứng chỉ nào thuộc loại này"}
                                            </p>
                                            <p className="text-[10px] text-slate-400">
                                                {language === "en" ? "Click 'Add Certificate' above to upload new files" : 'Bấm nút "Thêm chứng chỉ" phía trên để tải lên hình ảnh mới'}
                                            </p>
                                        </div>
                                    )}
                                </div>

                                {/* Certificates Pagination Footer */}
                                {totalCertPages > 1 && (
                                    <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center select-none bg-slate-50/50 dark:bg-slate-950/20">
                                        <span className="text-[10px] font-bold text-slate-400 dark:text-slate-550 uppercase">
                                            {language === "en" ? "Page" : "Trang"} {certPage} / {totalCertPages}
                                        </span>
                                        <div className="flex gap-1">
                                            <button 
                                                type="button" 
                                                disabled={certPage === 1} 
                                                onClick={() => setCertPage(p => Math.max(1, p - 1))} 
                                                className="px-3 py-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-50 disabled:opacity-40 transition-colors"
                                            >
                                                {language === "en" ? "Prev" : "Trước"}
                                            </button>
                                            <button 
                                                type="button" 
                                                disabled={certPage === totalCertPages} 
                                                onClick={() => setCertPage(p => Math.min(totalCertPages, p + 1))} 
                                                className="px-3 py-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-50 disabled:opacity-40 transition-colors"
                                            >
                                                {language === "en" ? "Next" : "Sau"}
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                        </div>
                    {/* 7. ĐỐI TÁC TAB (NON-UNMOUNTING DOM VIA HIDDEN CLASS) */}
                    <div className={activeTab === "partners" ? "space-y-6 animate-in fade-in duration-300" : "hidden"}>
                        <div className="space-y-6">
                            
                            {/* Upload Partner Logos Card */}
                            <div className={surfaceClass}>
                                <h3 className={sectionTitleClass}>
                                    <ShieldCheck className="h-4 w-4 text-red-600" /> Thêm đối tác hàng loạt
                                </h3>

                                <form onSubmit={handleAddPartnerBulk} className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-end pt-2">
                                    <div className="lg:col-span-9">
                                        <label className={labelClass}>Chọn các file Logo Đối tác (Có thể quét chọn nhiều PNG/JPG)</label>
                                        <label className="flex items-center gap-3 px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-900 border-dashed overflow-hidden transition-all">
                                            <UploadCloud className="h-5 w-5 text-slate-400 shrink-0" />
                                            <span className="text-[11px] font-bold text-red-650 dark:text-red-400 truncate">
                                                {partnerFiles.length > 0 ? `Đã chọn ${partnerFiles.length} logo đối tác` : "Quét chọn nhiều file logo..."}
                                            </span>
                                            <input 
                                                type="file" 
                                                multiple 
                                                required 
                                                className="hidden" 
                                                onChange={(e) => { 
                                                    if (e.target.files) setPartnerFiles(Array.from(e.target.files)); 
                                                }} 
                                            />
                                        </label>
                                    </div>
                                    <div className="lg:col-span-3">
                                        <button 
                                            type="submit" 
                                            disabled={loading || partnerFiles.length === 0} 
                                            className="w-full h-10 bg-red-700 hover:bg-red-800 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 shadow-sm hover:shadow transition-all disabled:opacity-50"
                                        >
                                            {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                                            Đăng lên
                                        </button>
                                    </div>
                                </form>
                            </div>

                            {/* Partners Grid list */}
                            <div className={surfaceClass}>
                                <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-slate-800">
                                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                                        Danh sách Logo đối tác ({initialPartners.length})
                                    </h4>
                                    {selectedPartners.length > 0 && (
                                        <button 
                                            type="button" 
                                            onClick={handleBulkDeletePartners} 
                                            disabled={loading} 
                                            className="px-3.5 py-1.5 bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-900 rounded-lg text-[10px] font-bold flex items-center gap-1 hover:bg-red-100 dark:hover:bg-red-950/40 shadow-sm"
                                        >
                                            <Trash2 className="h-3 w-3" /> Xóa {selectedPartners.length} logo đã chọn
                                        </button>
                                    )}
                                </div>

                                {initialPartners.length > 0 ? (
                                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4 pt-4 select-none">
                                        {currentDisplayPartners.map((partner) => {
                                            const isSelected = selectedPartners.includes(partner.id);
                                            return (
                                                <div 
                                                    key={partner.id} 
                                                    onClick={() => setSelectedPartners(prev => isSelected ? prev.filter(pId => pId !== partner.id) : [...prev, partner.id])} 
                                                    className={`group relative border rounded-xl p-2.5 aspect-square flex items-center justify-center cursor-pointer transition-all ${
                                                        isSelected 
                                                            ? 'border-red-650 bg-red-50/25 dark:bg-red-950/15 ring-1 ring-red-650 shadow-md' 
                                                            : 'border-slate-200 dark:border-slate-805 bg-white dark:bg-slate-900 hover:border-red-300 dark:hover:border-red-800'
                                                    }`}
                                                >
                                                    {/* Custom Checkbox */}
                                                    <div className={`absolute top-2 left-2 w-4 h-4 rounded border flex items-center justify-center transition-all ${
                                                        isSelected 
                                                            ? 'bg-red-650 border-red-650 text-white' 
                                                            : 'bg-white dark:bg-slate-950 border-slate-300 dark:border-slate-700'
                                                    }`}>
                                                        {isSelected && <Check className="h-2.5 w-2.5 stroke-[3]" />}
                                                    </div>

                                                    {/* Hover delete button */}
                                                    {!isSelected && (
                                                        <button 
                                                            type="button" 
                                                            onClick={(e) => { 
                                                                e.stopPropagation(); 
                                                                if (confirm("Bạn có chắc chắn muốn xóa đối tác này?")) {
                                                                    const tId = toast.loading("Đang xóa...");
                                                                    deletePartnerAction(partner.id).then(() => {
                                                                        toast.success("Đã xóa đối tác!", { id: tId });
                                                                        router.refresh();
                                                                    });
                                                                }
                                                            }} 
                                                            className="absolute top-1.5 right-1.5 p-1 bg-red-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-red-500 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-red-100 transition-all z-10 shadow-sm"
                                                        >
                                                            <Trash2 className="h-3 w-3" />
                                                        </button>
                                                    )}

                                                    {partner.imageUrl ? (
                                                        <img src={partner.imageUrl} className="max-w-[85%] max-h-[85%] object-contain mix-blend-multiply dark:mix-blend-normal transition-all duration-300" alt="Partner Logo" />
                                                    ) : (
                                                        <div className="text-slate-300 dark:text-slate-700 flex flex-col items-center">
                                                            <ImageIcon className="h-6 w-6 stroke-1" />
                                                            <span className="text-[7px] mt-1 font-bold">NO LOGO</span>
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <div className="py-12 text-center text-slate-450 dark:text-slate-650 flex flex-col items-center gap-1.5">
                                        <ImageIcon className="h-8 w-8 stroke-1" />
                                        <p className="text-xs font-semibold">Chưa có logo đối tác nào được đăng tải</p>
                                    </div>
                                )}

                                {/* Partners Pagination Footer */}
                                {totalPartnerPages > 1 && (
                                    <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center select-none mt-4">
                                        <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase">Trang {partnerPage} / {totalPartnerPages}</span>
                                        <div className="flex gap-1">
                                            <button 
                                                type="button" 
                                                disabled={partnerPage === 1} 
                                                onClick={() => setPartnerPage(p => Math.max(1, p - 1))} 
                                                className="px-3 py-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-850 disabled:opacity-40 transition-colors"
                                            >
                                                Trước
                                            </button>
                                            <button 
                                                type="button" 
                                                disabled={partnerPage === totalPartnerPages} 
                                                onClick={() => setPartnerPage(p => Math.min(totalPartnerPages, p + 1))} 
                                                className="px-3 py-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-850 disabled:opacity-40 transition-colors"
                                            >
                                                Sau
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Scroll back to top premium button */}
            {showScrollTop && (
                <button 
                    onClick={scrollToTop} 
                    className="fixed bottom-8 right-8 w-11 h-11 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-350 rounded-xl flex items-center justify-center shadow-lg hover:shadow-xl active:scale-95 transition-all z-50 animate-in fade-in slide-in-from-bottom-5 hover:text-red-655 dark:hover:text-red-400"
                    title="Lên đầu trang"
                >
                    <ArrowUp className="h-5 w-5 stroke-[2.5]" />
                </button>
            )}
        </div>
    );
}
