// 📍 File: src/app/admin/cms/articles/ArticleClient.tsx
"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { 
    Search, Edit3, Trash2, Eye, X, Plus, 
    ChevronsLeft, ChevronLeft, ChevronRight, ChevronsRight,
    Globe, UploadCloud, RefreshCw, Loader2, Save,
    MoreHorizontal, Pencil, List, Settings
} from "lucide-react";
import Link from "next/link";
import { 
    deleteArticle, 
    toggleArticleStatus, 
    saveArticlePageConfigAction, 
    uploadArticleBannerAction 
} from "@/actions/article";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation"; 
import { Button } from "@/components/ui/button";
import { 
    DropdownMenu, 
    DropdownMenuTrigger, 
    DropdownMenuContent, 
    DropdownMenuItem, 
    DropdownMenuSeparator 
} from "@/components/ui/dropdown-menu";
import { useAdminSettings } from "@/context/AdminSettingsContext";
import { StatusBadge } from "@/components/admin/CmsShared";

// Helper to translate raw DB category string to user-friendly label
const getCategoryLabel = (category: string) => {
    switch (category) {
        case "TIN_TUC": return "Tin tức";
        case "DU_AN": return "Dự án";
        case "KIEN_THUC": return "Kiến thức";
        case "GIAI_PHAP": return "Giải pháp";
        case "DICH_VU": return "Dịch vụ";
        case "SAN_PHAM": return "Sản phẩm";
        case "GIOI_THIEU": return "Giới thiệu";
        case "CONG_NGHE": return "Công nghệ";
        default: return category?.replace(/_/g, " ") || "";
    }
};

const normalizeCategory = (value?: string | null) =>
  String(value || "")
    .trim()
    .toUpperCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, "_")
    .replace(/-/g, "_");

export default function ArticleClient({ articles = [], initialConfig }: { articles?: any[], initialConfig?: any }) {
    const { t, language } = useAdminSettings();
    const router = useRouter();
    const [mounted, setMounted] = useState(false);
    useEffect(() => { setMounted(true); }, []);

    // Tab active switcher: "list" | "config"
    const [activeTab, setActiveTab] = useState("config");

    // Dynamic configuration states
    const defaultConfig = {
        hero: {
            title: { vi: "TIN TỨC", en: "NEWS" },
            subtitle: { vi: "CẬP NHẬT HOẠT ĐỘNG KỸ THUẬT VÀ CÔNG NGHỆ MỚI NHẤT TỪ MAINTECH", en: "LATEST UPDATES ON TECHNICAL ACTIVITIES AND NEW TECHNOLOGIES FROM MAINTECH" },
            badge: { vi: "Insights", en: "Insights" },
            backgroundImage: "",
            overlayOpacity: 0.2
        }
    };

    const mergeConfig = (initial: any, defaults: any) => {
        if (!initial) return defaults;
        const merged = { ...defaults };
        for (const key in defaults) {
            if (defaults[key] && typeof defaults[key] === 'object' && !Array.isArray(defaults[key])) {
                merged[key] = {
                    ...defaults[key],
                    ...(initial[key] || {})
                };
            } else if (initial[key] !== undefined) {
                merged[key] = initial[key];
            }
        }
        return merged;
    };

    const [config, setConfig] = useState(() => mergeConfig(initialConfig, defaultConfig));
    const [isSavingConfig, setIsSavingConfig] = useState(false);
    const [isUploadingBanner, setIsUploadingBanner] = useState(false);

    // List searching & pagination states
    const [searchTerm, setSearchTerm] = useState("");
    const [categoryFilter, setCategoryFilter] = useState("ALL");
    const [statusFilter, setStatusFilter] = useState("ALL");
    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(10); 

    const [previewArticle, setPreviewArticle] = useState<any>(null);
    const [updatingId, setUpdatingId] = useState<number | null>(null);
    const [isDeleting, setIsDeleting] = useState<number | null>(null);

    // Advanced search & filter logic matching UsersTable requirements
    const filteredArticles = articles.filter(a => {
        const matchesSearch = !searchTerm || 
            a.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            a.slug?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            getCategoryLabel(a.category).toLowerCase().includes(searchTerm.toLowerCase()) ||
            normalizeCategory(a.category).includes(normalizeCategory(searchTerm));
        
        const matchesCategory = categoryFilter === "ALL" || 
            normalizeCategory(a.category) === normalizeCategory(categoryFilter);
        const matchesStatus = statusFilter === "ALL" || a.status === statusFilter;
        
        return matchesSearch && matchesCategory && matchesStatus;
    });

    const totalPages = Math.max(1, Math.ceil(filteredArticles.length / rowsPerPage));
    const currentData = filteredArticles.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);

    const handleDelete = async (id: number, title: string) => {
        if (!confirm(`Bạn có chắc chắn muốn xóa bài viết: "${title}"? Thao tác này không thể hoàn tác.`)) return;
        setIsDeleting(id);
        const res = await deleteArticle(id);
        if (res?.success) {
            toast.success("Đã xóa bài viết thành công!");
            router.refresh(); 
        } else {
            toast.error("Có lỗi khi xóa!");
        }
        setIsDeleting(null);
    };

    const handleToggleStatus = async (id: number, currentStatus: string) => {
        setUpdatingId(id);
        const res = await toggleArticleStatus(id, currentStatus);
        if (res?.success) {
            toast.success(res.newStatus === "PUBLISHED" ? "Đã hiển thị bài viết!" : "Đã chuyển về trạng thái ẩn!");
            router.refresh(); 
        } else {
            toast.error("Lỗi cập nhật trạng thái!");
        }
        setUpdatingId(null);
    };

    const formatDate = (dateString: any) => {
        if (!dateString) return "";
        return new Date(dateString).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
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
    };

    const handleBannerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploadingBanner(true);
        const tId = toast.loading("Đang tải ảnh nền...");
        try {
            const formData = new FormData();
            formData.append("file", file);

            const res = await uploadArticleBannerAction(formData);
            if (res.success && res.url) {
                setConfig(prev => ({
                    ...prev,
                    hero: {
                        ...prev.hero,
                        backgroundImage: res.url
                    }
                }));
                toast.success("Tải ảnh nền thành công!", { id: tId });
            } else {
                toast.error(res.error || "Tải ảnh thất bại!", { id: tId });
            }
        } catch (err: any) {
            toast.error("Lỗi máy chủ!", { id: tId });
        } finally {
            setIsUploadingBanner(false);
        }
    };

    const handleSaveConfig = async () => {
        setIsSavingConfig(true);
        try {
            const res = await saveArticlePageConfigAction(config);
            if (res.success) {
                toast.success(language === 'en' ? "News & Projects configuration saved!" : "Đã lưu cấu hình trang Tin tức & Dự án!");
                router.refresh();
            } else {
                toast.error(res.error || "Lỗi khi lưu cấu hình!");
            }
        } catch (err) {
            toast.error("Lỗi kết nối máy chủ!");
        } finally {
            setIsSavingConfig(false);
        }
    };

    return (
        <div className="min-h-full w-full flex flex-col overflow-visible animate-in fade-in duration-500 bg-slate-50 dark:bg-slate-950 font-sans text-slate-700 dark:text-slate-200">
            {/* 🚀 TWO-COLUMN GRID LAYOUT */}
            <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-8 items-start min-h-0 flex-1 p-4 md:p-6">
                {/* Left Sidebar Menu */}
                <aside className="self-start flex flex-col space-y-4 w-full shrink-0">
                    <div className="flex flex-col space-y-1 p-2 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden shrink-0">
                        {[
                            { id: "banner", label: "Banner & Hero", icon: Globe },
                            { id: "list", label: "Danh sách bài viết", icon: List }
                        ].map((tab) => {
                            const IconComponent = tab.icon;
                            const isActive = (activeTab === "config" && tab.id === "banner") || (activeTab === "list" && tab.id === "list");
                            return (
                                <button
                                    key={tab.id}
                                    type="button"
                                    onClick={() => setActiveTab(tab.id === "banner" ? "config" : "list")}
                                    className={`w-full flex items-center gap-3 px-4 py-3 text-xs font-bold transition-all duration-200 rounded-xl text-left border-l-4 ${
                                        isActive
                                            ? "bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-300 border-premium-red rounded-l-none pl-3 shadow-sm"
                                            : "text-slate-500 dark:text-slate-400 hover:bg-slate-50/50 dark:hover:bg-slate-850 hover:text-slate-900 dark:hover:text-white border-transparent pl-4"
                                    }`}
                                >
                                    <IconComponent className="h-4 w-4 stroke-[1.5]" />
                                    {tab.label}
                                </button>
                            );
                        })}
                    </div>

                    {activeTab === "list" ? (
                        <Link 
                            href="/admin/cms/articles/create" 
                            className="inline-flex h-11 w-full justify-center items-center gap-2 rounded-xl bg-red-700 px-4 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-red-800 uppercase tracking-wider"
                        >
                            <Plus className="h-4 w-4" />
                            {t.adminArticles.actions.create || "Thêm bài viết"}
                        </Link>
                    ) : (
                        <button 
                            onClick={handleSaveConfig} 
                            disabled={isSavingConfig}
                            className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-emerald-700 px-5 text-xs font-bold text-white shadow-sm transition hover:bg-emerald-800 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-emerald-500/20 disabled:pointer-events-none disabled:opacity-50 dark:bg-emerald-600 dark:hover:bg-emerald-700"
                        >
                            {isSavingConfig ? <Loader2 className="animate-spin h-4 w-4" /> : <Save className="h-4 w-4" />}
                            {language === 'en' ? 'SAVE SETTINGS' : 'LƯU CẤU HÌNH'}
                        </button>
                    )}
                </aside>

                {/* Right Active Content Container */}
                <div className="min-h-0 pr-2 pb-12 self-start rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white/60 dark:bg-slate-900/40 p-4">

                {/* Tab 1: Articles Listing & Filters */}
                {activeTab === "list" && (
                    <div className="space-y-4 animate-in fade-in duration-300">
                        {/* Separated Search/Filter Toolbar identical to UsersTable - No padding card background */}
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 w-full py-1 shrink-0">
                            <div className="flex flex-1 flex-col sm:flex-row items-center gap-2 w-full">
                                
                                {/* Search Input Box constrained to w-[250px] lg:w-[300px] */}
                                <div className="relative w-full sm:w-[250px] lg:w-[300px]">
                                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 dark:text-slate-500" />
                                    <input 
                                        type="text" 
                                        placeholder={t.adminArticles.filters.searchPlaceholder} 
                                        value={searchTerm} 
                                        onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }} 
                                        className="h-8 w-full rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 pl-8 pr-3 py-1 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 shadow-sm outline-none focus:border-slate-300 dark:focus:border-slate-700 transition-colors" 
                                    />
                                </div>
                                
                                {/* Interactive Dropdowns */}
                                <div className="flex items-center gap-2 w-full sm:w-auto">
                                    {/* Category Filter Select */}
                                    <div className="relative flex items-center">
                                        <select 
                                            value={categoryFilter} 
                                            onChange={(e) => { setCategoryFilter(e.target.value); setCurrentPage(1); }} 
                                            className="h-8 rounded-md border border-dashed border-slate-250 dark:border-slate-800 bg-white dark:bg-slate-900 px-2.5 text-xs font-medium text-slate-800 dark:text-slate-200 shadow-sm outline-none cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
                                        >
                                            <option value="ALL">{t.adminArticles.filters.allCategories}</option>
                                            <option value="TIN_TUC">{t.adminArticles.categories.TIN_TUC}</option>
                                            <option value="DU_AN">{t.adminArticles.categories.DU_AN}</option>
                                            <option value="KIEN_THUC">{t.adminArticles.categories.KIEN_THUC}</option>
                                            <option value="GIAI_PHAP">{t.adminArticles.categories.GIAI_PHAP}</option>
                                            <option value="DICH_VU">{t.adminArticles.categories.DICH_VU}</option>
                                            <option value="SAN_PHAM">{t.adminArticles.categories.SAN_PHAM}</option>
                                            <option value="GIOI_THIEU">{t.adminArticles.categories.GIOI_THIEU}</option>
                                            <option value="CONG_NGHE">{t.adminArticles.categories.CONG_NGHE}</option>
                                        </select>
                                    </div>
                                    
                                    {/* Status Filter Select */}
                                    <div className="relative flex items-center">
                                        <select 
                                            value={statusFilter} 
                                            onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }} 
                                            className="h-8 rounded-md border border-dashed border-slate-250 dark:border-slate-800 bg-white dark:bg-slate-900 px-2.5 text-xs font-medium text-slate-800 dark:text-slate-200 shadow-sm outline-none cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
                                        >
                                            <option value="ALL">{t.adminArticles.filters.allStatuses}</option>
                                            <option value="PUBLISHED">{t.adminArticles.status.active}</option>
                                            <option value="DRAFT">{t.adminArticles.status.hidden}</option>
                                        </select>
                                    </div>
                                    
                                    {/* Reset Button */}
                                    {(searchTerm || categoryFilter !== "ALL" || statusFilter !== "ALL") && (
                                        <button 
                                            onClick={() => { setSearchTerm(""); setCategoryFilter("ALL"); setStatusFilter("ALL"); setCurrentPage(1); }} 
                                            className="h-8 px-2 text-xs font-medium text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-colors flex items-center gap-1"
                                        >
                                            Đặt lại
                                            <X size={13} />
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Table layout container constrained inside card with high-density spacing */}
                        <div className="rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden transition-colors shadow-sm">
                            <div className="overflow-x-auto custom-scrollbar hidden md:block">
                                <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300 border-collapse table-fixed">
                                    <colgroup>
                                        <col className="w-[60px]" />
                                        <col />
                                        <col className="w-[160px]" />
                                        <col className="w-[140px]" />
                                        <col className="w-[56px]" />
                                    </colgroup>
                                    <thead className="bg-slate-50 dark:bg-slate-900/80 border-b border-slate-200 dark:border-slate-800 select-none">
                                        <tr className="h-10">
                                            <th className="py-2 px-4 font-semibold text-slate-700 dark:text-slate-300 text-center uppercase tracking-wider text-[11px] align-middle">{t.adminArticles.table.index}</th>
                                            <th className="py-2 px-4 font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[11px] align-middle">{t.adminArticles.table.title}</th>
                                            <th className="py-2 px-4 font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[11px] align-middle">{t.adminArticles.table.category}</th>
                                            <th className="py-2 px-4 font-semibold text-slate-700 dark:text-slate-300 text-center uppercase tracking-wider text-[11px] align-middle">{t.adminArticles.table.status}</th>
                                            <th className="py-2 px-4 font-semibold text-slate-700 dark:text-slate-300 text-right uppercase tracking-wider text-[11px] sr-only align-middle">{t.adminArticles.table.actions}</th>
                                        </tr>
                                    </thead>
                                    
                                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 bg-white dark:bg-slate-900 transition-colors">
                                        {currentData.length === 0 ? (
                                            <tr>
                                                <td colSpan={5} className="h-32 text-center text-xs text-slate-400 dark:text-slate-500 italic bg-white dark:bg-slate-900 transition-colors">
                                                    Không tìm thấy bài viết phù hợp...
                                                </td>
                                            </tr>
                                        ) : (
                                            currentData.map((item, index) => (
                                                <tr key={item.id} className="h-10 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group">
                                                    <td className="px-4 py-2 text-center text-slate-400 dark:text-slate-500 font-medium font-mono text-xs align-middle">
                                                        {(currentPage - 1) * rowsPerPage + index + 1}
                                                    </td>
                                                    <td className="px-4 py-2 max-w-[520px] truncate font-medium align-middle">
                                                        <Link 
                                                            href={`/admin/cms/articles/edit/${item.id}`} 
                                                            className="text-sm font-medium text-slate-900 dark:text-slate-100 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors block truncate tracking-tight"
                                                            title={item.title}
                                                        >
                                                            {item.title}
                                                        </Link>
                                                    </td>
                                                    <td className="px-4 py-2 align-middle">
                                                        <span className="inline-flex items-center h-5 rounded-md px-2 text-[11px] font-medium bg-slate-100 text-slate-700 border border-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700">
                                                            {t.adminArticles.categories[normalizeCategory(item.category)] ?? item.category}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-2 text-center align-middle">
                                                        <StatusBadge 
                                                            status={item.status === 'PUBLISHED' ? "HIỂN THỊ" : "ẨN"} 
                                                            activeLabel={updatingId === item.id ? "..." : t.adminArticles.status.active}
                                                            hiddenLabel={updatingId === item.id ? "..." : t.adminArticles.status.hidden}
                                                            onClick={() => handleToggleStatus(item.id, item.status)}
                                                            disabled={updatingId === item.id}
                                                        />
                                                    </td>
                                                    <td className="px-4 py-2 text-right align-middle">
                                                        <DropdownMenu>
                                                            <DropdownMenuTrigger asChild>
                                                                <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 transition-colors">
                                                                    <MoreHorizontal className="h-4 w-4" />
                                                                    <span className="sr-only">{t.adminArticles.table.actions}</span>
                                                                </Button>
                                                            </DropdownMenuTrigger>
                                                            <DropdownMenuContent align="end" className="w-44 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                                                                <DropdownMenuItem 
                                                                    onClick={() => setPreviewArticle(item)}
                                                                    className="cursor-pointer text-slate-700 dark:text-slate-300 focus:bg-slate-50 dark:focus:bg-slate-800"
                                                                >
                                                                    <Eye className="mr-2 h-4 w-4 text-slate-500" />
                                                                    <span>{t.adminArticles.menu.view}</span>
                                                                </DropdownMenuItem>
                                                                <DropdownMenuItem asChild className="cursor-pointer focus:bg-slate-50 dark:focus:bg-slate-800">
                                                                    <Link href={`/admin/cms/articles/edit/${item.id}`} className="flex items-center w-full text-slate-700 dark:text-slate-300">
                                                                        <Pencil className="mr-2 h-4 w-4 text-slate-500" />
                                                                        <span>{t.adminArticles.menu.edit}</span>
                                                                    </Link>
                                                                </DropdownMenuItem>
                                                                <DropdownMenuSeparator className="bg-slate-100 dark:bg-slate-800" />
                                                                <DropdownMenuItem 
                                                                    onClick={() => handleDelete(item.id, item.title)}
                                                                    disabled={isDeleting === item.id}
                                                                    className="cursor-pointer text-red-600 dark:text-red-400 focus:text-red-700 focus:bg-red-50 dark:focus:bg-red-950/30 disabled:opacity-50 disabled:cursor-not-allowed"
                                                                >
                                                                    <Trash2 className="mr-2 h-4 w-4" />
                                                                    <span>{t.adminArticles.menu.delete}</span>
                                                                </DropdownMenuItem>
                                                            </DropdownMenuContent>
                                                        </DropdownMenu>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                            {/* Mobile Card List */}
                            <div className="md:hidden divide-y divide-slate-100 dark:divide-slate-800/80">
                                {currentData.length === 0 ? (
                                    <div className="p-8 text-center text-xs text-slate-400 dark:text-slate-500 italic bg-white dark:bg-slate-900 transition-colors">
                                        Không tìm thấy bài viết phù hợp...
                                    </div>
                                ) : (
                                    currentData.map((item, index) => (
                                        <div key={item.id} className="p-4 flex flex-col gap-3 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                            <div className="flex justify-between items-start gap-2">
                                                <div className="flex-1 min-w-0 space-y-1.5">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <span className="text-xs font-bold text-slate-400 dark:text-slate-500 font-mono">#{(currentPage - 1) * rowsPerPage + index + 1}</span>
                                                        <span className="inline-flex items-center h-5 rounded-md px-2 text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-700 border border-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700">
                                                            {t.adminArticles.categories[normalizeCategory(item.category)] ?? item.category}
                                                        </span>
                                                    </div>
                                                    <Link 
                                                        href={`/admin/cms/articles/edit/${item.id}`} 
                                                        className="text-sm font-bold text-slate-900 dark:text-slate-100 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors block line-clamp-2"
                                                    >
                                                        {item.title}
                                                    </Link>
                                                </div>
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 transition-colors shrink-0">
                                                            <MoreHorizontal className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end" className="w-44 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                                                        <DropdownMenuItem onClick={() => setPreviewArticle(item)} className="cursor-pointer text-slate-700 dark:text-slate-300">
                                                            <Eye className="mr-2 h-4 w-4 text-slate-500" />
                                                            <span>{t.adminArticles.menu.view}</span>
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem asChild className="cursor-pointer">
                                                            <Link href={`/admin/cms/articles/edit/${item.id}`} className="flex items-center w-full text-slate-700 dark:text-slate-300">
                                                                <Pencil className="mr-2 h-4 w-4 text-slate-500" />
                                                                <span>{t.adminArticles.menu.edit}</span>
                                                            </Link>
                                                        </DropdownMenuItem>
                                                        <DropdownMenuSeparator className="bg-slate-100 dark:bg-slate-800" />
                                                        <DropdownMenuItem onClick={() => handleDelete(item.id, item.title)} disabled={isDeleting === item.id} className="cursor-pointer text-red-600 dark:text-red-400">
                                                            <Trash2 className="mr-2 h-4 w-4" />
                                                            <span>{t.adminArticles.menu.delete}</span>
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </div>
                                            
                                            <div className="flex items-center justify-end pt-3 border-t border-slate-100 dark:border-slate-800/80 mt-1">
                                                <StatusBadge 
                                                    status={item.status === 'PUBLISHED' ? "HIỂN THỊ" : "ẨN"} 
                                                    activeLabel={updatingId === item.id ? "..." : t.adminArticles.status.active}
                                                    hiddenLabel={updatingId === item.id ? "..." : t.adminArticles.status.hidden}
                                                    onClick={() => handleToggleStatus(item.id, item.status)}
                                                    disabled={updatingId === item.id}
                                                />
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                        <div className="flex items-center justify-between px-2 select-none pt-4 flex-wrap gap-4">
                            <div className="flex-1 text-sm text-slate-500 dark:text-slate-400 min-w-[200px]">
                                {t.adminArticles.table.total}: <strong className="font-semibold text-slate-900 dark:text-slate-100">{filteredArticles.length}</strong> {language === 'en' ? 'articles' : 'bài viết'}
                            </div>
                            
                            <div className="flex items-center space-x-6 lg:space-x-8">
                                <div className="flex items-center space-x-2">
                                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{t.adminArticles.table.rowsPerPage}</p>
                                    <select
                                        value={rowsPerPage}
                                        onChange={(e) => {
                                            setRowsPerPage(Number(e.target.value));
                                            setCurrentPage(1);
                                        }}
                                        className="h-8 w-16 rounded-md border border-slate-200 bg-white px-1 text-sm text-slate-900 shadow-sm outline-none cursor-pointer focus:border-indigo-400 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 transition-colors"
                                    >
                                        {[10, 20, 30, 40, 50].map((size) => (
                                            <option key={size} value={size}>
                                                {size}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                
                                <div className="flex w-[80px] items-center justify-center text-sm font-medium text-slate-700 dark:text-slate-300">
                                    {currentPage} / {totalPages}
                                </div>
                                
                                <div className="flex items-center space-x-1">
                                    <button 
                                        onClick={() => setCurrentPage(1)} 
                                        disabled={currentPage === 1} 
                                        title={language === 'en' ? 'First page' : 'Trang đầu'}
                                        className="h-8 w-8 rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center transition-colors shadow-sm"
                                    >
                                        <ChevronsLeft size={14} />
                                    </button>
                                    <button 
                                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))} 
                                        disabled={currentPage === 1} 
                                        title={language === 'en' ? 'Previous page' : 'Trang trước'}
                                        className="h-8 w-8 rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center transition-colors shadow-sm"
                                    >
                                        <ChevronLeft size={14} />
                                    </button>
                                    <button 
                                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} 
                                        disabled={currentPage === totalPages} 
                                        title={language === 'en' ? 'Next page' : 'Trang sau'}
                                        className="h-8 w-8 rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center transition-colors shadow-sm"
                                    >
                                        <ChevronRight size={14} />
                                    </button>
                                    <button 
                                        onClick={() => setCurrentPage(totalPages)} 
                                        disabled={currentPage === totalPages} 
                                        title={language === 'en' ? 'Last page' : 'Trang cuối'}
                                        className="h-8 w-8 rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center transition-colors shadow-sm"
                                    >
                                        <ChevronsRight size={14} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Tab 2: Dynamic Page Config (Banner, Badge, Titles) */}
                {activeTab === "config" && (
                    <div className="space-y-8 animate-in fade-in duration-300">
                        {/* Banner Form Card */}
                        <div className="space-y-8">
                            {/* Titles */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-2">
                                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Tiêu đề VI</label>
                                    <input 
                                        type="text"
                                        value={config.hero.title.vi}
                                        onChange={e => updateConfigField("title", "vi", e.target.value)}
                                        className="w-full h-11 px-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-sm text-slate-900 dark:text-slate-100 focus:border-red-500 dark:focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500 transition-all shadow-sm"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Tiêu đề EN</label>
                                    <input 
                                        type="text"
                                        value={config.hero.title.en}
                                        onChange={e => updateConfigField("title", "en", e.target.value)}
                                        className="w-full h-11 px-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-sm text-slate-900 dark:text-slate-100 focus:border-red-500 dark:focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500 transition-all shadow-sm"
                                    />
                                </div>
                            </div>

                            {/* Background Image */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-3">
                                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">ẢNH NỀN</label>
                                    {config.hero.backgroundImage ? (
                                        <div className="relative aspect-[21/9] w-full rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-sm group">
                                            <img 
                                                src={config.hero.backgroundImage} 
                                                alt="Banner Preview" 
                                                className="w-full h-full object-cover"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setConfig(prev => ({ ...prev, hero: { ...prev.hero, backgroundImage: "" } }))}
                                                className="absolute top-4 right-4 flex items-center gap-2 px-3 py-1.5 bg-slate-900/60 hover:bg-slate-900/80 backdrop-blur-md text-white text-xs font-medium rounded-lg transition-colors shadow-lg"
                                            >
                                                <X size={14} />
                                                Xóa ảnh
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="relative aspect-[21/9] w-full rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-4 text-center hover:bg-slate-100 dark:hover:bg-slate-900/60 cursor-pointer transition-colors group">
                                            {isUploadingBanner ? (
                                                <Loader2 className="animate-spin text-slate-400 mb-3" size={32} />
                                            ) : (
                                                <UploadCloud className="text-slate-300 group-hover:text-slate-500 transition-colors mb-3" size={32} />
                                            )}
                                            <span className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">Tải ảnh nền lên</span>
                                            <span className="text-[11px] text-slate-400">JPG, PNG, WEBP (Tối đa 5MB)</span>
                                            <input 
                                                type="file" 
                                                accept="image/*" 
                                                onChange={handleBannerUpload}
                                                disabled={isUploadingBanner}
                                                className="absolute inset-0 opacity-0 cursor-pointer"
                                            />
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                    </div>
                )}
                </div> {/* End right column */}
            </div> {/* End grid layout */}

            {/* Portal preview modal rendered cleanly with full dark mode support */}
            {mounted && previewArticle && createPortal(
                <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4 md:p-8 animate-in fade-in duration-300 animate-out fade-out">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-5xl h-full max-h-[90vh] flex flex-col overflow-hidden relative border border-slate-200 dark:border-slate-800">
                        
                        {/* Modal Header */}
                        <div className="shrink-0 flex justify-between items-center px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 sticky top-0 z-10 transition-colors">
                            <div>
                                <span className="text-[10px] font-black bg-indigo-50 dark:bg-indigo-900/50 text-indigo-650 dark:text-indigo-300 px-2.5 py-1 rounded uppercase tracking-widest border border-indigo-100 dark:border-indigo-900/50">
                                    {t.adminArticles.categories[normalizeCategory(previewArticle.category)] ?? previewArticle.category}
                                </span>
                                <span className="ml-3 text-[11px] font-bold text-slate-400 dark:text-slate-500">{formatDate(previewArticle.createdAt)}</span>
                            </div>
                            <button onClick={() => setPreviewArticle(null)} className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-red-50 dark:hover:bg-red-950/30 text-slate-400 hover:text-red-500 transition-all"><X size={24} strokeWidth={3} /></button>
                        </div>
                        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 md:p-12 bg-white dark:bg-slate-900 transition-colors">
                            <div className="max-w-3xl mx-auto">
                                <h1 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-slate-100 leading-tight mb-6">{previewArticle.title}</h1>
                                {previewArticle.imageUrl && (
                                    <div className="mb-10 rounded-2xl overflow-hidden border border-slate-100 dark:border-slate-800 shadow-sm flex justify-center bg-slate-50 dark:bg-slate-950">
                                        <img src={previewArticle.imageUrl} alt="Cover" className="w-full h-auto max-h-[450px] object-contain" />
                                    </div>
                                )}
                                <div className="prose prose-slate dark:prose-invert max-w-none prose-p:text-lg prose-p:leading-relaxed prose-headings:font-black prose-img:rounded-xl text-slate-700 dark:text-slate-300" dangerouslySetInnerHTML={{ __html: previewArticle.content ? previewArticle.content.replace(/&nbsp;/g, ' ') : `<p class='italic text-slate-400 dark:text-slate-500'>${language === 'en' ? 'Article content is being updated...' : 'Nội dung bài viết đang được cập nhật...'}</p>` }} />
                            </div>
                        </div>
                    </div>
                </div>, document.body
            )}
        </div>
    );
}
