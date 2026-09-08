// 📍 File: src/app/admin/cms/products/ProductClient.tsx
"use client";

import { useState, useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import { 
    Edit3, Trash2, Eye, X, Plus, Package, 
    UploadCloud, Loader2, Save,
    MoreHorizontal, Pencil, List, Settings
} from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
// @ts-ignore
import { 
    toggleProductStatus, 
    deleteProduct,
    saveProductPageConfigAction,
    uploadProductBannerAction
} from "@/actions/product";
import { useAdminSettings } from "@/context/AdminSettingsContext";
import { Button } from "@/components/ui/button";
import { 
    DropdownMenu, 
    DropdownMenuTrigger, 
    DropdownMenuContent, 
    DropdownMenuItem, 
    DropdownMenuSeparator 
} from "@/components/ui/dropdown-menu";
import { CmsHeader, CmsFilters, StatusBadge, TablePagination } from "@/components/admin/CmsShared";

export default function ProductClient({ products = [], initialPageConfig }: { products?: any[], initialPageConfig?: any }) {
    const { t, language } = useAdminSettings();
    const router = useRouter();
    const [mounted, setMounted] = useState(false);
    useEffect(() => { setMounted(true); }, []);

    // Tab active switcher: "list" | "settings"
    const [activeTab, setActiveTab] = useState<"list" | "settings">("list");

    // Dynamic configuration states for Banner
    const defaultConfig = {
        hero: {
            badge: { vi: "SẢN PHẨM & THIẾT BỊ", en: "PRODUCTS & EQUIPMENT" },
            title: { vi: "SẢN PHẨM & THIẾT BỊ CÔNG NGHIỆP", en: "INDUSTRIAL PRODUCTS & EQUIPMENT" },
            subtitle: { vi: "Maintech chuyên cung cấp thiết bị F&B, thiết bị nâng hạ và phụ tùng công nghiệp.", en: "Maintech specializes in providing high-quality F&B, lifting equipment and industrial components." },
            backgroundImage: "/images/bg-banner.jpg",
            overlayOpacity: 0.6
        }
    };

    const mergeConfig = (initial: any, defaults: any) => {
        if (!initial) return defaults;
        const merged = { ...defaults };
        
        const badgeVi = initial.badgeVi || initial.hero?.badge?.vi || defaults.hero.badge.vi;
        const badgeEn = initial.badgeEn || initial.hero?.badge?.en || defaults.hero.badge.en;
        const titleVi = initial.titleVi || initial.hero?.title?.vi || defaults.hero.title.vi;
        const titleEn = initial.titleEn || initial.hero?.title?.en || defaults.hero.title.en;
        const descVi = initial.descVi || initial.hero?.subtitle?.vi || defaults.hero.subtitle.vi;
        const descEn = initial.descEn || initial.hero?.subtitle?.en || defaults.hero.subtitle.en;
        const bgImage = initial.backgroundImage || initial.hero?.backgroundImage || defaults.hero.backgroundImage;
        let opacityVal = defaults.hero.overlayOpacity;
        if (initial.overlayOpacity !== undefined) {
            opacityVal = initial.overlayOpacity > 1 ? initial.overlayOpacity / 100 : initial.overlayOpacity;
        } else if (initial.hero?.overlayOpacity !== undefined) {
            opacityVal = initial.hero.overlayOpacity;
        }

        merged.hero = {
            badge: { vi: badgeVi, en: badgeEn },
            title: { vi: titleVi, en: titleEn },
            subtitle: { vi: descVi, en: descEn },
            backgroundImage: bgImage,
            overlayOpacity: opacityVal
        };
        return merged;
    };

    const [config, setConfig] = useState(() => mergeConfig(initialPageConfig, defaultConfig));
    const [savingSettings, setSavingSettings] = useState(false);
    const [settingsDirty, setSettingsDirty] = useState(false);
    const [isUploadingBanner, setIsUploadingBanner] = useState(false);
    const [previewLanguage, setPreviewLanguage] = useState<'vi' | 'en'>(language === 'en' ? 'en' : 'vi');

    // List searching & pagination states
    const [searchTerm, setSearchTerm] = useState("");
    const [categoryFilter, setCategoryFilter] = useState("ALL");
    const [subcategoryFilter, setSubcategoryFilter] = useState("ALL");
    const [statusFilter, setStatusFilter] = useState("ALL");
    const [previewProduct, setPreviewProduct] = useState<any>(null);
    
    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [updatingId, setUpdatingId] = useState<number | null>(null);
    const [isDeleting, setIsDeleting] = useState<number | null>(null);

    const normalizeCategory = (value?: string | null) =>
      String(value || "")
        .trim()
        .toUpperCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/\s+/g, "_")
        .replace(/-/g, "_");

    // Robust category label resolver
    const getCategoryLabel = (category: string) => {
        const raw = String(category || "").trim().toUpperCase();
        if (raw.includes("NANG_HA") || raw.includes("NÂN_HA") || raw.includes("NÂNG HẠ")) return t.adminProducts?.categories?.THIET_BI_NANG_HA || "Thiết bị nâng hạ";
        if (raw.includes("FB") || raw.includes("F&B") || raw.includes("THUC_PHAM")) return t.adminProducts?.categories?.THIET_BI_FB || "Thiết bị F&B";
        if (raw.includes("CANG") || raw.includes("CAU") || raw.includes("CẨU")) return t.adminProducts?.categories?.Palang || t.adminProducts?.categories?.THIET_BI_CAU || "Thiết bị cẩu";
        if (raw.includes("LINH_KIEN") || raw.includes("PHU_KIEN") || raw.includes("PHU_TUNG")) return t.adminProducts?.categories?.LINH_KIEN_PHU_KIEN || "Linh kiện & phụ kiện";
        
        const matched = t.adminProducts?.categories?.[normalizeCategory(category)];
        if (matched) return matched;
        return category;
    };

    // Subcategory (phân nhóm) label resolver
    const getSubcategoryLabel = (subcategory: string) => {
        if (!subcategory) return "---";
        const raw = normalizeCategory(subcategory);
        if (raw === "THIET_BI") return language === 'en' ? "Equipment" : "Thiết bị";
        if (raw === "PHU_TUNG") return language === 'en' ? "Spare Parts" : "Phụ tùng";
        if (raw === "LINH_KIEN") return language === 'en' ? "Components" : "Linh kiện";
        if (raw === "KHAC") return language === 'en' ? "Others" : "Khác";
        
        const matched = t.adminProducts?.subcategories?.[raw];
        if (matched) return matched;
        return subcategory;
    };

    const filteredProducts = useMemo(() => {
        return products.filter(p => {
            const matchesSearch = !searchTerm || 
                p.title_vi?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                p.title_en?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                p.supplier?.toLowerCase().includes(searchTerm.toLowerCase());
            
            const [industry, nature] = (p.category || "").includes(":") ? p.category.split(":") : [p.category, ""];

            const matchesCategory = categoryFilter === "ALL" || 
                normalizeCategory(industry) === normalizeCategory(categoryFilter);
                
            const matchesSubcategory = subcategoryFilter === "ALL" || 
                normalizeCategory(nature) === normalizeCategory(subcategoryFilter);
                
            const matchesStatus = statusFilter === "ALL" || p.status === statusFilter;
            return matchesSearch && matchesCategory && matchesSubcategory && matchesStatus;
        });
    }, [products, searchTerm, categoryFilter, subcategoryFilter, statusFilter]);

    const totalPages = Math.max(1, Math.ceil(filteredProducts.length / rowsPerPage));
    const currentData = filteredProducts.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);

    useEffect(() => { setCurrentPage(1); }, [searchTerm, categoryFilter, subcategoryFilter, statusFilter]);

    const handleToggleStatus = async (id: number, currentStatus: string) => {
        setUpdatingId(id);
        const res = await toggleProductStatus(id, currentStatus);
        if (res?.success) {
            toast.success(res.newStatus === "PUBLISHED" ? "Đã hiển thị sản phẩm!" : "Đã chuyển về trạng thái ẩn!");
            router.refresh();
        } else {
            toast.error("Lỗi cập nhật trạng thái!");
        }
        setUpdatingId(null);
    };

    const handleDelete = async (id: number) => {
        if (!confirm("Sếp có chắc chắn muốn xóa sản phẩm này không? Thao tác này không thể hoàn tác.")) return;
        setIsDeleting(id);
        const loadingToast = toast.loading("Đang xóa...");
        const res = await deleteProduct(id);
        if (res?.success) {
            toast.success("Đã xóa sản phẩm thành công!", { id: loadingToast });
            if (currentData.length === 1 && currentPage > 1) setCurrentPage(p => p - 1);
            router.refresh();
        } else {
            toast.error("Lỗi khi xóa sản phẩm!", { id: loadingToast });
        }
        setIsDeleting(null);
    };

    // Configuration action handlers
    const updateConfigField = (field: string, lang: 'vi' | 'en', text: string) => {
        setConfig((prev: any) => {
            const currentObj = { ...prev.hero[field] };
            currentObj[lang] = text;
            return {
                ...prev,
                hero: {
                    ...prev.hero,
                    [field]: currentObj
                }
            };
        });
        setSettingsDirty(true);
    };

    const handleSavePageSettings = async () => {
        setSavingSettings(true);
        const payload = {
            badgeVi: config.hero.badge.vi,
            badgeEn: config.hero.badge.en,
            titleVi: config.hero.title.vi,
            titleEn: config.hero.title.en,
            descVi: config.hero.subtitle.vi,
            descEn: config.hero.subtitle.en,
            backgroundImage: config.hero.backgroundImage,
            overlayOpacity: Math.round(config.hero.overlayOpacity * 100),
        };
        const res = await saveProductPageConfigAction(payload);
        if (res?.success) {
            setSettingsDirty(false);
            toast.success(language === 'en' ? "Page configurations saved!" : "Lưu cấu hình trang thành công!");
            router.refresh();
        } else {
            toast.error(res?.error || (language === 'en' ? "Failed to save settings!" : "Lưu cấu hình thất bại!"));
        }
        setSavingSettings(false);
    };

    const handleBannerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploadingBanner(true);
        const tId = toast.loading("Đang tải ảnh nền...");
        try {
            const formData = new FormData();
            formData.append("file", file);

            const res = await uploadProductBannerAction(formData);
            if (res.success && res.url) {
                setConfig(prev => ({
                    ...prev,
                    hero: {
                        ...prev.hero,
                        backgroundImage: res.url
                    }
                }));
                setSettingsDirty(true);
                toast.success("Tải ảnh nền banner thành công!", { id: tId });
            } else {
                toast.error(res.error || "Không thể upload ảnh!", { id: tId });
            }
        } catch (err) {
            toast.error("Lỗi kết nối server!", { id: tId });
        } finally {
            setIsUploadingBanner(false);
        }
    };

    const renderPreviewModal = () => {
        if (!mounted || !previewProduct) return null;
        
        const productDesc = previewProduct.desc_vi?.replace(/\n/g, '<br/>') || "";
        const [industry, nature] = (previewProduct.category || "").includes(":") ? previewProduct.category.split(":") : [previewProduct.category, ""];

        return createPortal(
            <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4 md:p-8 animate-in fade-in duration-300">
                <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-5xl h-full max-h-[90vh] flex flex-col overflow-hidden relative border border-slate-200 dark:border-slate-800">
                    <div className="shrink-0 flex justify-between items-center px-6 py-4 border-b border-slate-100 dark:border-slate-850 bg-white dark:bg-slate-900 sticky top-0 z-10">
                        <div className="flex items-center gap-2">
                            <span className="text-[11px] font-semibold bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300 px-2.5 py-1 rounded">
                                {getCategoryLabel(industry)}
                            </span>
                            {nature && (
                                <span className="text-[11px] font-semibold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 px-2.5 py-1 rounded">
                                    {getSubcategoryLabel(nature)}
                                </span>
                            )}
                            <span className="ml-3 text-[13px] font-bold text-emerald-600 dark:text-emerald-400">
                                {language === 'en' ? 'Price: ' : 'Giá: '}{previewProduct.price || (language === 'en' ? 'Contact' : 'Liên hệ')}
                            </span>
                        </div>
                        <button onClick={() => setPreviewProduct(null)} className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-red-50 dark:hover:bg-red-950/40 text-slate-400 hover:text-red-500 transition-all">
                            <X size={24} strokeWidth={2} />
                        </button>
                    </div>
                    <div className="flex-1 overflow-y-auto custom-scrollbar p-6 md:p-12 bg-white dark:bg-slate-900">
                        <div className="max-w-3xl mx-auto">
                            <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-slate-100 leading-tight mb-2">
                                {language === 'en' ? (previewProduct.title_en || previewProduct.title_vi) : previewProduct.title_vi}
                            </h1>
                            <p className="text-slate-500 dark:text-slate-400 font-medium mb-6">
                                {language === 'en' ? 'Supplier: ' : 'Nhà cung cấp: '}
                                <span className="font-semibold text-slate-750 dark:text-slate-350">{previewProduct.supplier || "Maintech VN"}</span>
                            </p>
                            
                            {previewProduct.imageUrl && (
                                <div className="mb-10 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-sm flex justify-center bg-white dark:bg-slate-950 p-4">
                                    <img src={previewProduct.imageUrl} alt="Product" className="w-full h-auto max-h-[400px] object-contain" />
                                </div>
                            )}
                            
                            {previewProduct.summary && (
                                <div className="bg-slate-50 dark:bg-slate-950 p-6 rounded-xl border border-slate-100 dark:border-slate-800 mb-8">
                                    <h3 className="font-bold text-xs uppercase tracking-wider text-slate-800 dark:text-slate-200 mb-2">
                                        {language === 'en' ? 'Summary' : 'Tóm tắt'}
                                    </h3>
                                    <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-sm">{previewProduct.summary}</p>
                                </div>
                            )}
                            
                            <div className="prose prose-slate dark:prose-invert max-w-none prose-sm">
                                <h3 className="font-bold text-xs uppercase tracking-wider text-slate-800 dark:text-slate-200 mb-4 border-b border-slate-200 dark:border-slate-800 pb-2">
                                    {language === 'en' ? 'Technical Specifications' : 'Thông số chi tiết'}
                                </h3>
                                <div dangerouslySetInnerHTML={{ __html: productDesc }} className="text-slate-650 dark:text-slate-350 leading-relaxed" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>,
            document.body
        );
    };

    return (
        <div className="w-full min-h-screen bg-slate-50 dark:bg-slate-950 p-4 md:p-6 font-sans text-slate-700 dark:text-slate-200 animate-in fade-in duration-500 transition-colors">
            <div className="mx-auto w-full max-w-[1400px] space-y-5">
                
                <CmsHeader
                    icon={Package}
                    title={t.adminProducts?.title || (language === 'en' ? 'Products & Equipment' : 'Sản phẩm & Thiết bị')}
                    subtitle={t.adminProducts?.subtitle || (language === 'en' ? 'Manage product list, categories and page banner settings' : 'Quản lý danh sách sản phẩm, hạng mục và cấu hình banner trang.')}
                    rightElement={
                        <div className="flex items-center gap-2">
                            {/* Tab Switcher Segmented Control */}
                            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-1 flex shadow-sm h-9 items-center gap-1">
                                <button 
                                    onClick={() => setActiveTab("list")}
                                    className={`flex items-center gap-1.5 px-3 rounded-lg text-[13px] font-semibold uppercase tracking-tight transition-all h-7 ${
                                        activeTab === "list"
                                            ? "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white"
                                            : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
                                    }`}
                                >
                                    <List size={13} />
                                    {language === 'en' ? 'List' : 'Danh sách'}
                                </button>
                                <button 
                                    onClick={() => setActiveTab("settings")}
                                    className={`flex items-center gap-1.5 px-3 rounded-lg text-[13px] font-semibold uppercase tracking-tight transition-all h-7 ${
                                        activeTab === "settings"
                                            ? "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white"
                                            : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
                                    }`}
                                >
                                    <Settings size={13} />
                                    {language === 'en' ? 'Page Settings' : 'Cấu hình trang'}
                                </button>
                            </div>

                            {activeTab === "list" ? (
                                <Link 
                                    href="/admin/cms/products/create" 
                                    className="inline-flex h-9 items-center gap-2 rounded-xl bg-red-700 px-4 text-[13px] font-semibold text-white shadow-sm transition-colors hover:bg-red-800 uppercase tracking-wider"
                                >
                                    <Plus className="h-4 w-4" />
                                    {t.adminProducts?.actions?.create || (language === 'en' ? 'Create Product' : 'Tạo sản phẩm')}
                                </Link>
                            ) : (
                                <button 
                                    onClick={handleSavePageSettings} 
                                    disabled={savingSettings}
                                    className="inline-flex h-9 items-center gap-2 rounded-xl bg-red-700 px-4 text-[13px] font-semibold text-white shadow-sm transition-colors hover:bg-red-800 disabled:opacity-50 uppercase tracking-wider"
                                >
                                    {savingSettings ? <Loader2 className="animate-spin h-4 w-4" /> : <Save className="h-4 w-4" />}
                                    {language === 'en' ? 'Save Settings' : 'Lưu cấu hình'}
                                </button>
                            )}
                        </div>
                    }
                />

                {/* Tab 1: Products Listing */}
                {activeTab === "list" && (
                    <div className="space-y-4 animate-in fade-in duration-300">
                        <CmsFilters
                            searchTerm={searchTerm}
                            onSearchChange={(val) => { setSearchTerm(val); setCurrentPage(1); }}
                            searchPlaceholder={t.adminProducts?.filters?.searchPlaceholder || (language === 'en' ? "Search..." : "Tìm nhanh...")}
                            showReset={!!(searchTerm || categoryFilter !== "ALL" || subcategoryFilter !== "ALL" || statusFilter !== "ALL")}
                            onReset={() => { 
                                setSearchTerm(""); 
                                setCategoryFilter("ALL"); 
                                setSubcategoryFilter("ALL"); 
                                setStatusFilter("ALL"); 
                                setCurrentPage(1); 
                            }}
                            resetLabel={language === 'en' ? "Reset" : "Đặt lại"}
                        >
                            {/* Category Select */}
                            <select 
                                value={categoryFilter} 
                                onChange={(e) => { setCategoryFilter(e.target.value); setCurrentPage(1); }} 
                                className="h-8 rounded-md border border-dashed border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-2.5 text-xs font-medium text-slate-800 dark:text-slate-200 shadow-sm outline-none cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
                            >
                                <option value="ALL">{t.adminProducts?.filters?.allCategories || (language === 'en' ? "Category: All" : "Hạng mục: Tất cả")}</option>
                                <option value="THIET_BI_NANG_HA">{t.adminProducts?.categories?.THIET_BI_NANG_HA || (language === 'en' ? "Lifting Equipment" : "Thiết bị nâng hạ")}</option>
                                <option value="THIET_BI_FB">{t.adminProducts?.categories?.THIET_BI_FB || (language === 'en' ? "F&B Equipment" : "Thiết bị F&B")}</option>
                                <option value="THIET_BI_CAU">{t.adminProducts?.categories?.THIET_BI_CAU || (language === 'en' ? "Crane Equipment" : "Thiết bị cẩu")}</option>
                                <option value="LINH_KIEN_PHU_KIEN">{t.adminProducts?.categories?.LINH_KIEN_PHU_KIEN || (language === 'en' ? "Components & Parts" : "Linh kiện & phụ kiện")}</option>
                            </select>
                            
                            {/* Subcategory Select */}
                            <select 
                                value={subcategoryFilter} 
                                onChange={(e) => { setSubcategoryFilter(e.target.value); setCurrentPage(1); }} 
                                className="h-8 rounded-md border border-dashed border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-2.5 text-xs font-medium text-slate-800 dark:text-slate-200 shadow-sm outline-none cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
                            >
                                <option value="ALL">{t.adminProducts?.filters?.allSubcategories || (language === 'en' ? "Subcategory: All" : "Phân nhóm: Tất cả")}</option>
                                <option value="THIET_BI">{language === 'en' ? "Equipment" : "Thiết bị"}</option>
                                <option value="PHU_TUNG">{language === 'en' ? "Spare Parts" : "Phụ tùng"}</option>
                                <option value="LINH_KIEN">{language === 'en' ? "Components" : "Linh kiện"}</option>
                                <option value="KHAC">{language === 'en' ? "Others" : "Khác"}</option>
                            </select>
                            
                            {/* Status Select */}
                            <select 
                                value={statusFilter} 
                                onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }} 
                                className="h-8 rounded-md border border-dashed border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-2.5 text-xs font-medium text-slate-800 dark:text-slate-200 shadow-sm outline-none cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
                            >
                                <option value="ALL">{t.adminProducts?.filters?.allStatuses || (language === 'en' ? "Status: All" : "Trạng thái: Tất cả")}</option>
                                <option value="PUBLISHED">{t.adminProducts?.status?.active || (language === 'en' ? "Active" : "Hoạt động")}</option>
                                <option value="DRAFT">{t.adminProducts?.status?.hidden || (language === 'en' ? "Hidden" : "Ẩn")}</option>
                            </select>
                        </CmsFilters>

                        {/* Table Layout */}
                        <div className="rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden transition-colors shadow-sm">
                            <div className="overflow-x-auto custom-scrollbar hidden md:block min-h-[440px]">
                                <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300 border-collapse table-fixed">
                                    <colgroup>
                                        <col className="w-[60px]" />
                                        <col />
                                        <col className="w-[180px]" />
                                        <col className="w-[140px]" />
                                        <col className="w-[140px]" />
                                        <col className="w-[130px]" />
                                        <col className="w-[140px]" />
                                        <col className="w-[56px]" />
                                    </colgroup>
                                    <thead className="bg-slate-50 dark:bg-slate-900/80 border-b border-slate-200 dark:border-slate-800 select-none">
                                        <tr className="h-10">
                                            <th className="py-2 px-4 font-semibold text-slate-700 dark:text-slate-300 text-center uppercase tracking-wider text-[11px] align-middle">
                                                {t.adminProducts?.table?.index || (language === 'en' ? 'No.' : 'STT')}
                                            </th>
                                            <th className="py-2 px-4 font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[11px] align-middle">
                                                {t.adminProducts?.table?.title || (language === 'en' ? 'Product Name' : 'Tên sản phẩm')}
                                            </th>
                                            <th className="py-2 px-4 font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[11px] align-middle">
                                                {t.adminProducts?.table?.category || (language === 'en' ? 'Category' : 'Hạng mục')}
                                            </th>
                                            <th className="py-2 px-4 font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[11px] align-middle">
                                                {t.adminProducts?.table?.subcategory || (language === 'en' ? 'Subcategory' : 'Phân nhóm')}
                                            </th>
                                            <th className="py-2 px-4 font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[11px] align-middle">
                                                {t.adminProducts?.table?.supplier || (language === 'en' ? 'Supplier' : 'Hãng')}
                                            </th>
                                            <th className="py-2 px-4 font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[11px] align-middle">
                                                {t.adminProducts?.table?.price || (language === 'en' ? 'Price' : 'Giá')}
                                            </th>
                                            <th className="py-2 px-4 font-semibold text-slate-700 dark:text-slate-300 text-center uppercase tracking-wider text-[11px] align-middle">
                                                {t.adminProducts?.table?.status || (language === 'en' ? 'Status' : 'Trạng thái')}
                                            </th>
                                            <th className="py-2 px-4 font-semibold text-slate-700 dark:text-slate-300 text-right uppercase tracking-wider text-[11px] sr-only align-middle">
                                                {t.adminProducts?.table?.actions || (language === 'en' ? 'Actions' : 'Thao tác')}
                                            </th>
                                        </tr>
                                    </thead>
                                    
                                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 bg-white dark:bg-slate-900 transition-colors">
                                        {currentData.length === 0 ? (
                                            <tr>
                                                <td colSpan={8} className="h-32 text-center text-xs text-slate-400 dark:text-slate-500 italic bg-white dark:bg-slate-900 transition-colors align-middle">
                                                    {language === 'en' ? 'No products found...' : 'Không tìm thấy sản phẩm phù hợp...'}
                                                </td>
                                            </tr>
                                        ) : (
                                            currentData.map((item, index) => {
                                                const [industry, nature] = (item.category || "").includes(":") ? item.category.split(":") : [item.category, ""];
                                                return (
                                                    <tr key={item.id} className="h-10 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group">
                                                        <td className="px-4 py-2 text-center text-slate-400 dark:text-slate-500 font-medium font-mono text-xs align-middle">
                                                            {(currentPage - 1) * rowsPerPage + index + 1}
                                                        </td>
                                                        <td className="px-4 py-2 truncate font-medium align-middle">
                                                            <Link 
                                                                href={`/admin/cms/products/edit/${item.id}`} 
                                                                className="text-sm font-medium text-slate-900 dark:text-slate-100 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors block truncate"
                                                                title={language === 'en' ? (item.title_en || item.title_vi) : item.title_vi}
                                                            >
                                                                {language === 'en' ? (item.title_en || item.title_vi) : item.title_vi}
                                                            </Link>
                                                        </td>
                                                        <td className="px-4 py-2 truncate align-middle">
                                                            <span className="inline-flex items-center h-5 rounded-md px-2 text-[11px] font-medium bg-slate-100 text-slate-700 border border-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700">
                                                                {getCategoryLabel(industry)}
                                                            </span>
                                                        </td>
                                                        <td className="px-4 py-2 truncate align-middle">
                                                            <span className="inline-flex items-center h-5 rounded-md px-2 text-[11px] font-medium bg-slate-100 text-slate-700 border border-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700">
                                                                {getSubcategoryLabel(nature)}
                                                            </span>
                                                        </td>
                                                        <td className="px-4 py-2 truncate text-slate-700 dark:text-slate-300 font-medium align-middle">
                                                            {item.supplier || "Maintech VN"}
                                                        </td>
                                                        <td className="px-4 py-2 truncate text-slate-850 dark:text-slate-200 font-semibold align-middle">
                                                            {item.price || (language === 'en' ? 'Contact' : 'Liên hệ')}
                                                        </td>
                                                        <td className="px-4 py-2 text-center align-middle">
                                                            <StatusBadge 
                                                                status={item.status === 'PUBLISHED' || item.status === 'HIỂN THỊ' || item.status === 'HOẠT ĐỘNG' ? "HIỂN THỊ" : "ẨN"} 
                                                                activeLabel={updatingId === item.id ? "..." : t.adminProducts.status.active}
                                                                hiddenLabel={updatingId === item.id ? "..." : t.adminProducts.status.hidden}
                                                                onClick={() => handleToggleStatus(item.id, item.status)}
                                                                disabled={updatingId === item.id}
                                                            />
                                                        </td>
                                                        <td className="px-4 py-2 text-right align-middle">
                                                            <DropdownMenu>
                                                                <DropdownMenuTrigger asChild>
                                                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 transition-colors">
                                                                        <MoreHorizontal className="h-4 w-4" />
                                                                        <span className="sr-only">Actions</span>
                                                                    </Button>
                                                                </DropdownMenuTrigger>
                                                                <DropdownMenuContent align="end" className="w-44 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                                                                    <DropdownMenuItem 
                                                                        onClick={() => setPreviewProduct(item)}
                                                                        className="cursor-pointer text-slate-700 dark:text-slate-300 focus:bg-slate-50 dark:focus:bg-slate-800"
                                                                    >
                                                                        <Eye className="mr-2 h-4 w-4 text-slate-500" />
                                                                        <span>{language === 'en' ? 'View details' : 'Xem chi tiết'}</span>
                                                                    </DropdownMenuItem>
                                                                    <DropdownMenuItem asChild className="cursor-pointer focus:bg-slate-50 dark:focus:bg-slate-800">
                                                                        <Link href={`/admin/cms/products/edit/${item.id}`} className="flex items-center w-full text-slate-700 dark:text-slate-300">
                                                                            <Pencil className="mr-2 h-4 w-4 text-slate-500" />
                                                                            <span>{language === 'en' ? 'Edit' : 'Chỉnh sửa'}</span>
                                                                        </Link>
                                                                    </DropdownMenuItem>
                                                                    <DropdownMenuSeparator className="bg-slate-100 dark:bg-slate-800" />
                                                                    <DropdownMenuItem 
                                                                        onClick={() => handleDelete(item.id)}
                                                                        disabled={isDeleting === item.id}
                                                                        className="cursor-pointer text-red-600 dark:text-red-400 focus:text-red-700 focus:bg-red-50 dark:focus:bg-red-950/30 disabled:opacity-50 disabled:cursor-not-allowed"
                                                                    >
                                                                        <Trash2 className="mr-2 h-4 w-4" />
                                                                        <span>{language === 'en' ? 'Delete' : 'Xóa'}</span>
                                                                    </DropdownMenuItem>
                                                                </DropdownMenuContent>
                                                            </DropdownMenu>
                                                        </td>
                                                    </tr>
                                                );
                                            })
                                        )}
                                    </tbody>
                                </table>
                            </div>
                            {/* Mobile Card List */}
                            <div className="md:hidden divide-y divide-slate-100 dark:divide-slate-800/80">
                                {currentData.length === 0 ? (
                                    <div className="p-8 text-center text-xs text-slate-400 dark:text-slate-500 italic bg-white dark:bg-slate-900 transition-colors">
                                        {language === 'en' ? 'No products found...' : 'Không tìm thấy sản phẩm phù hợp...'}
                                    </div>
                                ) : (
                                    currentData.map((item, index) => {
                                        const [industry, nature] = (item.category || "").includes(":") ? item.category.split(":") : [item.category, ""];
                                        return (
                                            <div key={item.id} className="p-4 flex flex-col gap-3 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                                <div className="flex justify-between items-start gap-2">
                                                    <div className="flex-1 min-w-0 space-y-1.5">
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <span className="text-xs font-bold text-slate-400 dark:text-slate-500 font-mono">#{(currentPage - 1) * rowsPerPage + index + 1}</span>
                                                            <span className="inline-flex items-center h-5 rounded-md px-2 text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-700 border border-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700">
                                                                {getCategoryLabel(industry)}
                                                            </span>
                                                        </div>
                                                        <Link 
                                                            href={`/admin/cms/products/edit/${item.id}`} 
                                                            className="text-sm font-bold text-slate-900 dark:text-slate-100 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors block line-clamp-2"
                                                        >
                                                            {language === 'en' ? (item.title_en || item.title_vi) : item.title_vi}
                                                        </Link>
                                                        <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                                                            {item.supplier || "Maintech VN"}
                                                        </div>
                                                    </div>
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 transition-colors shrink-0">
                                                                <MoreHorizontal className="h-4 w-4" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end" className="w-44 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                                                            <DropdownMenuItem onClick={() => setPreviewProduct(item)} className="cursor-pointer text-slate-700 dark:text-slate-300">
                                                                <Eye className="mr-2 h-4 w-4 text-slate-500" />
                                                                <span>{language === 'en' ? 'View details' : 'Xem chi tiết'}</span>
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem asChild className="cursor-pointer">
                                                                <Link href={`/admin/cms/products/edit/${item.id}`} className="flex items-center w-full text-slate-700 dark:text-slate-300">
                                                                    <Pencil className="mr-2 h-4 w-4 text-slate-500" />
                                                                    <span>{language === 'en' ? 'Edit' : 'Chỉnh sửa'}</span>
                                                                </Link>
                                                            </DropdownMenuItem>
                                                            <DropdownMenuSeparator className="bg-slate-100 dark:bg-slate-800" />
                                                            <DropdownMenuItem onClick={() => handleDelete(item.id)} disabled={isDeleting === item.id} className="cursor-pointer text-red-600 dark:text-red-400">
                                                                <Trash2 className="mr-2 h-4 w-4" />
                                                                <span>{language === 'en' ? 'Delete' : 'Xóa'}</span>
                                                            </DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </div>
                                                
                                                <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800/80 mt-1">
                                                    <div className="flex flex-col gap-1">
                                                        <span className="text-[10px] uppercase font-semibold text-slate-400 dark:text-slate-500">{t.adminProducts?.table?.price || (language === 'en' ? 'Price' : 'Giá')}</span>
                                                        <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                                                            {item.price || (language === 'en' ? 'Contact' : 'Liên hệ')}
                                                        </span>
                                                    </div>
                                                    <StatusBadge 
                                                        status={item.status === 'PUBLISHED' || item.status === 'HIỂN THỊ' || item.status === 'HOẠT ĐỘNG' ? "HIỂN THỊ" : "ẨN"} 
                                                        activeLabel={updatingId === item.id ? "..." : t.adminProducts.status.active}
                                                        hiddenLabel={updatingId === item.id ? "..." : t.adminProducts.status.hidden}
                                                        onClick={() => handleToggleStatus(item.id, item.status)}
                                                        disabled={updatingId === item.id}
                                                    />
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                        </div>
                        <TablePagination
                            totalItems={filteredProducts.length}
                            itemsLabel={language === 'en' ? 'products' : 'sản phẩm'}
                            rowsPerPage={rowsPerPage}
                            onRowsPerPageChange={(rows) => { setRowsPerPage(rows); setCurrentPage(1); }}
                            currentPage={currentPage}
                            totalPages={totalPages}
                            onPageChange={(page) => setCurrentPage(page)}
                            language={language === 'en' ? 'en' : 'vi'}
                            rowsPerPageLabel={t.adminProducts?.table?.rowsPerPage || (language === 'en' ? 'Rows per page' : 'Dòng mỗi trang')}
                        />
                    </div>
                )}

                {/* Tab 2: Page Configurations */}
                {activeTab === "settings" && (
                    <div className="space-y-6 animate-in fade-in duration-300">
                        {/* Row 1: Configurations form + Banner preview */}
                        <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_460px] gap-6 items-stretch">
                            
                            {/* Left Config Panel */}
                            <div className="space-y-6 min-w-0 h-full flex flex-col">
                                <div className="h-full bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-5 transition-colors">
                                    <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
                                        <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">
                                            {language === 'en' ? 'Banner Title & Subtitle' : 'Tiêu đề & Mô tả Banner'}
                                        </h3>
                                        <p className="text-xs text-slate-400 dark:text-slate-500">
                                            {language === 'en' ? 'Configure header titles shown at the top of products page on the website.' : 'Cấu hình tiêu đề hiển thị ở phần đầu của trang Sản phẩm & Thiết bị ngoài website.'}
                                        </p>
                                    </div>
                                    
                                    <div className="grid grid-cols-2 gap-5">
                                        <div className="space-y-2">
                                            <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">Badge (Tiếng Việt)</label>
                                            <input 
                                                type="text"
                                                value={config.hero.badge.vi}
                                                onChange={e => updateConfigField("badge", "vi", e.target.value)}
                                                className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-sm text-slate-900 dark:text-slate-100 focus:border-red-750 dark:focus:border-red-655 focus:outline-none transition-colors"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">Badge (English)</label>
                                            <input 
                                                type="text"
                                                value={config.hero.badge.en}
                                                onChange={e => updateConfigField("badge", "en", e.target.value)}
                                                className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-sm text-slate-900 dark:text-slate-100 focus:border-red-750 dark:focus:border-red-655 focus:outline-none transition-colors"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-5">
                                        <div className="space-y-2">
                                            <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">Tiêu đề Banner (Tiếng Việt)</label>
                                            <input 
                                                type="text"
                                                value={config.hero.title.vi}
                                                onChange={e => updateConfigField("title", "vi", e.target.value)}
                                                className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-sm text-slate-900 dark:text-slate-100 focus:border-red-750 dark:focus:border-red-655 focus:outline-none transition-colors"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">Tiêu đề Banner (English)</label>
                                            <input 
                                                type="text"
                                                value={config.hero.title.en}
                                                onChange={e => updateConfigField("title", "en", e.target.value)}
                                                className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-sm text-slate-900 dark:text-slate-100 focus:border-red-750 dark:focus:border-red-655 focus:outline-none transition-colors"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-5">
                                        <div className="space-y-2">
                                            <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">Mô tả Banner (Tiếng Việt)</label>
                                            <textarea 
                                                value={config.hero.subtitle.vi}
                                                onChange={e => updateConfigField("subtitle", "vi", e.target.value)}
                                                className="w-full min-h-[82px] p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-sm text-slate-900 dark:text-slate-100 focus:border-red-750 dark:focus:border-red-655 focus:outline-none resize-none transition-colors"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">Mô tả Banner (English)</label>
                                            <textarea 
                                                value={config.hero.subtitle.en}
                                                onChange={e => updateConfigField("subtitle", "en", e.target.value)}
                                                className="w-full min-h-[82px] p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-sm text-slate-900 dark:text-slate-100 focus:border-red-750 dark:focus:border-red-655 focus:outline-none resize-none transition-colors"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Right Banner & Real-time Live Preview Panel */}
                            <div className="w-full xl:w-[460px] shrink-0 h-full bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm transition-colors flex flex-col justify-between min-h-[460px]">
                                <div className="border-b border-slate-100 dark:border-slate-800 pb-3 flex items-center justify-between shrink-0">
                                    <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">
                                        {language === 'en' ? 'Banner Background & Overlay' : 'Ảnh nền & Lớp phủ'}
                                    </h3>
                                    <span className="text-[10px] font-black uppercase bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300 px-2 py-0.5 rounded">Realtime</span>
                                </div>

                                <div className="flex-1 flex flex-col justify-between mt-4 space-y-4">
                                    {config.hero.backgroundImage ? (
                                        <div className="relative aspect-video w-full rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-inner group">
                                            <img 
                                                src={config.hero.backgroundImage} 
                                                alt="Banner Preview" 
                                                className="w-full h-full object-cover"
                                            />
                                            {/* Full Overlay covering the entire background image strictly */}
                                            <div 
                                                className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center transition-all select-none w-full h-full"
                                                style={{ backgroundColor: `rgba(15, 23, 42, ${config.hero.overlayOpacity})` }}
                                            >
                                                <span className="text-[9px] font-black text-red-500 bg-black/50 px-2 py-0.5 rounded uppercase tracking-wider mb-2 animate-pulse">PREVIEW</span>
                                                <span className="text-[9px] font-black text-white/80 uppercase tracking-widest px-2 py-0.5 border border-white/20 rounded-full mb-1">
                                                    {previewLanguage === 'en' ? (config.hero.badge.en || "Products") : (config.hero.badge.vi || "Sản Phẩm")}
                                                </span>
                                                <h4 className="text-white text-base font-black uppercase tracking-tight line-clamp-1 max-w-full leading-none mb-1">
                                                    {previewLanguage === 'en' ? (config.hero.title.en || "PRODUCTS") : (config.hero.title.vi || "SẢN PHẨM")}
                                                </h4>
                                                <p className="text-white/60 text-[10px] font-medium leading-tight max-w-[80%] line-clamp-2">
                                                    {previewLanguage === 'en' ? (config.hero.subtitle.en || "") : (config.hero.subtitle.vi || "")}
                                                </p>
                                            </div>
                                            
                                            {/* Button to remove uploader */}
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setConfig(prev => ({ ...prev, hero: { ...prev.hero, backgroundImage: "" } }));
                                                    setSettingsDirty(true);
                                                }}
                                                className="absolute top-2 right-2 p-1.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors shadow-lg z-20"
                                            >
                                                <X size={14} />
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="relative aspect-video w-full rounded-xl border-2 border-dashed border-slate-350 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-4 text-center hover:bg-slate-100 dark:hover:bg-slate-900/60 cursor-pointer transition-colors group">
                                            {isUploadingBanner ? (
                                                <Loader2 className="animate-spin text-red-700 mb-2" size={28} />
                                            ) : (
                                                <UploadCloud className="text-slate-400 group-hover:text-red-700 transition-colors mb-2" size={28} />
                                            )}
                                            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Tải ảnh nền banner</span>
                                            <span className="text-[10px] text-slate-400">JPG, PNG, WEBP (Tối đa 5MB)</span>
                                            <input 
                                                type="file" 
                                                accept="image/*" 
                                                onChange={handleBannerUpload}
                                                disabled={isUploadingBanner}
                                                className="absolute inset-0 opacity-0 cursor-pointer"
                                            />
                                        </div>
                                    )}

                                    {/* Control panel for preview banner language & opacity */}
                                    <div className="space-y-3 pt-2">
                                        <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800 pt-3">
                                            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Preview Language Switcher</span>
                                            <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg border border-slate-200 dark:bg-slate-700">
                                                <button
                                                    onClick={() => setPreviewLanguage('vi')}
                                                    type="button"
                                                    className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all ${
                                                        previewLanguage === 'vi' 
                                                            ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                                                            : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                                                    }`}
                                                >
                                                    VI
                                                </button>
                                                <button
                                                    onClick={() => setPreviewLanguage('en')}
                                                    type="button"
                                                    className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all ${
                                                        previewLanguage === 'en' 
                                                            ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                                                            : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                                                    }`}
                                                >
                                                    EN
                                                </button>
                                            </div>
                                        </div>

                                        <div className="space-y-1">
                                            <div className="flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400">
                                                <span>{language === 'en' ? 'Overlay Opacity' : 'Độ mờ lớp phủ'}</span>
                                                <span className="font-mono bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-slate-600 dark:text-slate-350">{Math.round((config.hero.overlayOpacity !== undefined ? config.hero.overlayOpacity : 0.6) * 100)}%</span>
                                            </div>
                                            <input 
                                                type="range"
                                                min="0"
                                                max="0.95"
                                                step="0.05"
                                                value={config.hero.overlayOpacity}
                                                onChange={e => {
                                                    setConfig(prev => ({ ...prev, hero: { ...prev.hero, overlayOpacity: parseFloat(e.target.value) } }));
                                                    setSettingsDirty(true);
                                                }}
                                                className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-red-700 focus:outline-none"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Row 2: Status visualizers */}
                        {(() => {
                            const badgeVi = config.hero?.badge?.vi || "";
                            const badgeEn = config.hero?.badge?.en || "";
                            const titleVi = config.hero?.title?.vi || "";
                            const titleEn = config.hero?.title?.en || "";
                            const descriptionVi = config.hero?.subtitle?.vi || "";
                            const descriptionEn = config.hero?.subtitle?.en || "";
                            const backgroundImage = config.hero?.backgroundImage || "";
                            const overlayOpacity = config.hero?.overlayOpacity !== undefined ? config.hero.overlayOpacity : 0.6;

                            const hasViBanner =
                                badgeVi.trim().length > 0 &&
                                titleVi.trim().length > 0 &&
                                descriptionVi.trim().length > 0;

                            const hasEnBanner =
                                badgeEn.trim().length > 0 &&
                                titleEn.trim().length > 0 &&
                                descriptionEn.trim().length > 0;

                            const hasBackgroundImage =
                                backgroundImage.trim().length > 0;

                            const isPublicConnected =
                                hasViBanner && hasBackgroundImage;

                            return (
                                <div className="mt-4 rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm dark:border-slate-800 dark:bg-slate-900 transition-colors select-none">
                                    <div className="flex flex-wrap items-center gap-4 overflow-hidden">
                                        <div className="flex shrink-0 items-center gap-2 text-sm font-semibold text-slate-900 dark:text-slate-100">
                                            <span className="relative flex h-2 w-2">
                                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                                            </span>
                                            <span>{language === 'en' ? 'Display Status' : 'Trạng thái hiển thị'}</span>
                                        </div>

                                        <div className="h-4 w-px bg-slate-200 dark:bg-slate-800" />

                                        {/* 1. Public Page */}
                                        <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                                            <span>Public Page:</span>
                                            {isPublicConnected ? (
                                                <span className="h-5 rounded-md bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 flex items-center border border-emerald-100/40 dark:border-emerald-900/30">
                                                    {language === 'en' ? 'Connected' : 'Đã kết nối'}
                                                </span>
                                            ) : (
                                                <span className="h-5 rounded-md bg-amber-50 px-2 py-0.5 text-[11px] font-semibold text-amber-700 dark:bg-amber-955/35 dark:text-amber-300 flex items-center border border-amber-100/40 dark:border-amber-900/30 animate-pulse">
                                                    {language === 'en' ? 'Using default cover' : 'Sử dụng ảnh mẫu'}
                                                </span>
                                            )}
                                        </div>

                                        <div className="h-4 w-px bg-slate-200 dark:bg-slate-800" />

                                        {/* 2. Banner */}
                                        <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                                            <span>Banner Content:</span>
                                            {hasViBanner ? (
                                                <span className="h-5 rounded-md bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700 dark:bg-emerald-955/40 dark:text-emerald-300 flex items-center border border-emerald-100/40 dark:border-emerald-900/30">
                                                    {language === 'en' ? 'Complete' : 'Đầy đủ'}
                                                </span>
                                            ) : (
                                                <span className="h-5 rounded-md bg-red-50 px-2 py-0.5 text-[11px] font-semibold text-red-700 dark:bg-red-955/20 dark:text-red-300 flex items-center border border-red-100/40 dark:border-red-900/30 animate-pulse">
                                                    {language === 'en' ? 'Missing content' : 'Thiếu nội dung'}
                                                </span>
                                            )}
                                        </div>

                                        <div className="h-4 w-px bg-slate-200 dark:bg-slate-800" />

                                        {/* 3. Ảnh nền */}
                                        <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                                            <span>{language === 'en' ? 'Background Image' : 'Ảnh nền'}:</span>
                                            {hasBackgroundImage ? (
                                                <span className="h-5 rounded-md bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 flex items-center border border-emerald-100/40 dark:border-emerald-900/30">
                                                    {language === 'en' ? 'Available' : 'Đã tải lên'}
                                                </span>
                                            ) : (
                                                <span className="h-5 rounded-md bg-amber-50 px-2 py-0.5 text-[11px] font-semibold text-amber-700 dark:bg-amber-955/35 dark:text-amber-300 flex items-center border border-amber-100/40 dark:border-amber-900/30">
                                                    {language === 'en' ? 'Using default image' : 'Dùng ảnh mặc định'}
                                                </span>
                                            )}
                                        </div>

                                        <div className="h-4 w-px bg-slate-200 dark:bg-slate-800" />

                                        {/* 4. Song ngữ */}
                                        <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                                            <span>{language === 'en' ? 'Bilingual' : 'Song ngữ'}:</span>
                                            {hasViBanner && hasEnBanner ? (
                                                <span className="h-5 rounded-md bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700 dark:bg-emerald-955/40 dark:text-emerald-300 flex items-center border border-emerald-100/40 dark:border-emerald-900/30">
                                                    {language === 'en' ? 'Complete' : 'Đầy đủ'}
                                                </span>
                                            ) : (
                                                <span className="h-5 rounded-md bg-amber-50 px-2 py-0.5 text-[11px] font-semibold text-amber-700 dark:bg-amber-955/35 dark:text-amber-300 flex items-center border border-amber-100/40 dark:border-amber-900/30 animate-pulse">
                                                    {language === 'en' ? 'Incomplete EN' : 'Chưa hoàn tất EN'}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })()}
                    </div>
                )}
            </div>

            {renderPreviewModal()}
        </div>
    );
}