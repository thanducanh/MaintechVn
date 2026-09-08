// 📍 File: src/app/admin/cms/services/ServiceClient.tsx
"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { 
    Search, Edit3, Trash2, Eye, X, ChevronsLeft, ChevronLeft, ChevronRight, ChevronsRight,
    UploadCloud, Loader2, Save, MoreHorizontal, Pencil, List, Plus, Settings, ArrowRight, FileText, Globe
} from "lucide-react";
import Link from "next/link";
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
import { deleteServiceAction, toggleServiceStatusAction, saveServicesPageConfigAction, uploadServicesBannerAction, uploadServiceDetailImageAction, upsertServiceAction } from "@/actions/services";
import { CmsHeader, CmsFilters, StatusBadge, TablePagination } from "@/components/admin/CmsShared";

export default function ServiceClient({ services = [], initialConfig }: { services?: any[], initialConfig?: any }) {
    const { t, language } = useAdminSettings();
    const router = useRouter();
    const [mounted, setMounted] = useState(false);
    useEffect(() => { setMounted(true); }, []);

    // Tab active switcher: "list" | "config"
    const [activeTab, setActiveTab] = useState("config");
    const [selectedDetailSlug, setSelectedDetailSlug] = useState<string>("");

    const defaultConfig = {
        hero: {
            title: { vi: "Dịch Vụ & Giải Pháp", en: "Services & Solutions" },
            subtitle: { 
                vi: "Cung cấp giải pháp kỹ thuật công nghiệp toàn diện và chuyên sâu", 
                en: "Providing comprehensive and specialized industrial technical solutions" 
            },
            badge: { vi: "Dịch Vụ", en: "Services" },
            backgroundImage: "",
            overlayOpacity: 0.6
        },
        serviceDetails: {}
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
    const [isUploadingDetailImage, setIsUploadingDetailImage] = useState<string | null>(null);

    // List searching & pagination states
    const [searchTerm, setSearchTerm] = useState("");
    const [categoryFilter, setCategoryFilter] = useState("ALL");
    const [statusFilter, setStatusFilter] = useState("ALL");
    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(10); 

    const [previewItem, setPreviewItem] = useState<any>(null);
    const [deleteTarget, setDeleteTarget] = useState<{ id: number | string; name: string } | null>(null);
    const [updatingId, setUpdatingId] = useState<number | string | null>(null);
    const [isDeleting, setIsDeleting] = useState<number | string | null>(null);
    const [removedIds, setRemovedIds] = useState<Array<number | string>>([]);
    const [newServiceDrafts, setNewServiceDrafts] = useState<number[]>([]);

    // For banner configuration panel preview language switch
    const [previewLanguage, setPreviewLanguage] = useState<'vi' | 'en'>(language === 'en' ? 'en' : 'vi');

    // Advanced search & filter logic
    const filteredServices = services.filter(s => !removedIds.includes(s.id)).filter(s => {
        const title = s.title_vi || "";
        const desc = s.desc_vi || "";
        const matchesSearch = !searchTerm || 
            title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            desc.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (s.category && s.category.toLowerCase().includes(searchTerm.toLowerCase()));
        
        const matchesCategory = categoryFilter === "ALL" || s.category === categoryFilter;
        const matchesStatus = statusFilter === "ALL" || s.status === statusFilter;
        
        return matchesSearch && matchesCategory && matchesStatus;
    });

    // CMS dịch vụ hiển thị toàn bộ danh sách; không cắt sau 3/10 dịch vụ.
    // Thứ tự đã được sắp xếp từ server theo thời điểm tạo.
    const totalPages = 1;
    const currentData = filteredServices;

    useEffect(() => {
        if (!currentData.some((item) => item.slug === selectedDetailSlug)) {
            setSelectedDetailSlug(currentData[0]?.slug || "");
        }
    }, [currentData, selectedDetailSlug]);

    const handleToggleStatus = async (id: number | string, currentStatus: string) => {
        setUpdatingId(id);
        const res = await toggleServiceStatusAction(id, currentStatus);
        if (res?.success) {
            toast.success(res.newStatus === "HIỂN THỊ" ? "Đã hiển thị dịch vụ!" : "Đã chuyển về trạng thái ẩn!");
            router.refresh(); 
        } else {
            toast.error("Lỗi cập nhật trạng thái!");
        }
        setUpdatingId(null);
    };

    const handleDelete = async (id: any, name: string) => {
        setIsDeleting(id);
        const res = await deleteServiceAction(id);
        if (res?.success) {
            setRemovedIds((current) => [...current, id]);
            toast.success("Đã xóa dịch vụ thành công!");
            router.refresh(); 
        } else {
            toast.error(res?.error || "Không thể xóa dịch vụ.");
        }
        setIsDeleting(null);
        setDeleteTarget(null);
    };

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

            const res = await uploadServicesBannerAction(formData);
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

    const handleDetailImageUpload = async (slug: string, e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setIsUploadingDetailImage(slug);
        const tId = toast.loading("Đang tải ảnh dịch vụ...");
        try {
            const formData = new FormData();
            formData.append("file", file);
            const res = await uploadServiceDetailImageAction(formData);
            if (res.success && res.url) {
                setConfig(prev => ({ ...prev, serviceDetails: { ...(prev.serviceDetails || {}), [slug]: { ...(prev.serviceDetails?.[slug] || {}), imageUrl: res.url } } }));
                toast.success("Đã tải ảnh dịch vụ! Nhấn Lưu thiết lập để lưu.", { id: tId });
            } else toast.error(res.error || "Tải ảnh thất bại!", { id: tId });
        } catch {
            toast.error("Lỗi máy chủ khi tải ảnh!", { id: tId });
        } finally {
            setIsUploadingDetailImage(null);
            e.target.value = "";
        }
    };

    const handleSaveConfig = async () => {
        setIsSavingConfig(true);
        try {
            const newServiceForms = Array.from(document.querySelectorAll("form[data-new-service-form]")) as HTMLFormElement[];
            for (const newServiceForm of newServiceForms) {
                const newData = new FormData(newServiceForm);
                const title = String(newData.get("title_vi") || "").trim();
                if (title) {
                    if (!newServiceForm.reportValidity()) return;
                    const serviceResult = await upsertServiceAction(newData);
                    if (!serviceResult?.success) {
                        toast.error(serviceResult?.error || "Không thể lưu dịch vụ mới.");
                        return;
                    }
                }
            }
            const serviceForms = Array.from(document.querySelectorAll("form[data-service-form]")) as HTMLFormElement[];
            for (const form of serviceForms) {
                const data = new FormData(form);
                const serviceResult = await upsertServiceAction(data);
                if (!serviceResult?.success) {
                    toast.error(serviceResult?.error || "Không thể lưu dịch vụ.");
                    return;
                }
            }
            const res = await saveServicesPageConfigAction(config);
            if (res.success) {
                toast.success(language === 'en' ? "Services page configuration saved!" : "Đã lưu cấu hình trang Dịch vụ!");
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

    // Safe fallbacks
    const fallbackBannerImage = "/images/services-hero-bg.jpg";
    const currentBannerImage = config.hero.backgroundImage || fallbackBannerImage;

    return (
        <div className="w-full min-h-screen bg-slate-50 dark:bg-slate-950 p-4 md:p-6 font-sans text-slate-700 dark:text-slate-200 animate-in fade-in duration-500 transition-colors">
            <div className="mx-auto w-full max-w-[1400px] space-y-5">
                {/* Header section identical to other premium modules */}
                <CmsHeader
                    icon={undefined}
                    title=""
                    subtitle=""
                    noDivider
                    rightElement={null}
                />

                <div className="grid grid-cols-1 items-start gap-6 lg:h-[calc(100vh-8rem)] lg:grid-cols-[260px_minmax(0,1fr)]">
                    <div className="flex w-full flex-col gap-4 self-start lg:sticky lg:top-6 shrink-0">
                        <aside data-services-cms-menu className="flex flex-col space-y-1 p-2 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
                            {[
                                { id: "config", label: "Banner & Hero", icon: Settings },
                                { id: "list", label: "Thêm dịch vụ", icon: Plus },
                                { id: "details", label: "Chi tiết dịch vụ", icon: List }
                            ].map((tab) => {
                                const IconComponent = tab.icon;
                                const isActive = activeTab === tab.id;
                                return (
                                    <button
                                        key={tab.id}
                                        type="button"
                                        onClick={() => {
                                            setActiveTab(tab.id);
                                            if (tab.id === "list") {
                                                setNewServiceDrafts(prev => [...prev, Date.now()]);
                                                setTimeout(() => document.querySelector("form[data-new-service-form]:last-of-type")?.scrollIntoView({ behavior: "smooth", block: "center" }), 100);
                                            } else {
                                                window.scrollTo({ top: 0, behavior: "smooth" });
                                            }
                                        }}
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
                        </aside>
                        <button
                            type="button"
                            onClick={handleSaveConfig}
                            disabled={isSavingConfig}
                            className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-emerald-700 px-5 text-xs font-bold text-white shadow-sm transition hover:bg-emerald-800 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-emerald-500/20 disabled:pointer-events-none disabled:opacity-50 dark:bg-emerald-600 dark:hover:bg-emerald-700"
                        >
                            {isSavingConfig ? <Loader2 className="animate-spin h-4 w-4" /> : <Save className="h-4 w-4" />}
                            {isSavingConfig ? "ĐANG LƯU..." : "LƯU THIẾT LẬP"}
                        </button>
                    </div>
                    <div className="min-w-0 lg:h-full lg:overflow-y-auto lg:pr-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                {/* Banner & Hero được đặt trực tiếp phía trên danh sách */}
                {activeTab === "config" && (                <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <label className="space-y-1 text-xs font-semibold text-slate-600">Tiêu đề VI
                            <input value={config.hero.title.vi} onChange={e => updateConfigField("title", "vi", e.target.value)} className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm font-normal text-slate-900 outline-none focus:border-red-600" />
                        </label>
                        <label className="space-y-1 text-xs font-semibold text-slate-600">Tiêu đề EN
                            <input value={config.hero.title.en} onChange={e => updateConfigField("title", "en", e.target.value)} className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm font-normal text-slate-900 outline-none focus:border-red-600" />
                        </label>
                    </div>
                    <div className="mt-6 pt-1">
                        <p className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-400">Ảnh nền</p>
                        <div className="flex flex-wrap items-end gap-4">
                        {!config.hero.backgroundImage && <label className="flex h-44 w-full cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-300 text-center text-sm font-semibold text-slate-600 hover:border-red-500 hover:text-red-600 md:w-1/2">
                            {isUploadingBanner ? "Đang tải ảnh..." : "Tải ảnh lên"}
                            <span className="mt-1 block text-[11px] font-normal text-slate-400">Định dạng JPG, PNG, WEBP. Tối đa 5MB.</span>
                            <input type="file" accept="image/jpeg,image/png,image/webp" onChange={handleBannerUpload} className="hidden" disabled={isUploadingBanner} />
                        </label>}
                        {config.hero.backgroundImage && <div className="relative h-44 w-full md:w-1/2">
                            <img src={config.hero.backgroundImage} alt="Hero preview" className="h-full w-full rounded-xl object-cover" />
                            <button type="button" onClick={() => setConfig(prev => ({ ...prev, hero: { ...prev.hero, backgroundImage: "" } }))} className="absolute right-2 top-2 rounded-md bg-white/90 px-2 py-1 text-xs font-bold text-slate-700 shadow hover:bg-white">
                                Xóa ảnh
                            </button>
                        </div>}
                        </div>
                    </div>
                </section>)}
                {activeTab === "details" && (
                    <section className="grid gap-5 lg:grid-cols-[240px_minmax(0,1fr)] animate-in fade-in duration-300">
                        <aside className="h-fit rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
                            <h2 className="px-3 py-2 text-sm font-bold text-slate-900">Chi tiết dịch vụ</h2>
                            <p className="px-3 pb-2 text-xs text-slate-500">Chọn dịch vụ để chỉnh sửa</p>
                            <div className="space-y-1">
                                {currentData.map((item, index) => (
                                    <button key={item.id} type="button" onClick={() => setSelectedDetailSlug(item.slug)} className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-semibold transition ${selectedDetailSlug === item.slug ? "bg-red-50 text-red-700" : "text-slate-700 hover:bg-slate-50"}`}>
                                        <span className="w-7 text-xs font-bold text-slate-400">{String(index + 1).padStart(2, "0")}</span>
                                        <span className="truncate">{item.title_vi}</span>
                                    </button>
                                ))}
                            </div>
                        </aside>
                        {currentData.length === 0 && <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center text-sm text-slate-500">Chưa có dịch vụ. Hãy chọn “Thêm dịch vụ” trước.</div>}
                        {(() => {
                            const item = currentData.find((service) => service.slug === selectedDetailSlug) || currentData[0];
                            if (!item) return null;
                            const detail = config.serviceDetails?.[item.slug] || {};
                            const updateDetail = (field: string, value: string) => setConfig((prev: any) => ({ ...prev, serviceDetails: { ...(prev.serviceDetails || {}), [item.slug]: { ...(prev.serviceDetails?.[item.slug] || {}), [field]: value } } }));
                            const detailImage = detail.imageUrl ?? item.imageUrl ?? "";
                            return <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                                <div className="mb-5 flex items-center gap-3 border-b border-slate-100 pb-4"><span className="text-xs font-bold text-slate-400">{String(currentData.findIndex((service) => service.slug === item.slug) + 1).padStart(2, "0")}</span><h3 className="font-bold text-slate-900">{item.title_vi}</h3></div>
                                <div className="mb-6 border-b border-slate-100 pb-6">
                                    <div className="flex items-center justify-between"><label className="text-xs font-semibold text-slate-600">Hình ảnh dịch vụ</label>{detailImage && <button type="button" onClick={() => updateDetail("imageUrl", "")} className="rounded-md px-2 py-1 text-xs font-semibold text-red-600 transition hover:bg-red-50 hover:text-red-700">Xóa ảnh</button>}</div>
                                    <div className="mt-2 max-w-2xl">
                                        <div className="relative aspect-[16/9] w-full overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
                                            {detailImage ? <img src={detailImage} alt={item.title_vi} className="h-full w-full object-cover" /> : <label className="flex h-full cursor-pointer flex-col items-center justify-center border-2 border-dashed border-slate-300 text-sm font-semibold text-slate-500 transition hover:border-red-400 hover:text-red-600"><UploadCloud size={24} /><span className="mt-2">{isUploadingDetailImage === item.slug ? "Đang tải ảnh..." : "Tải ảnh lên"}</span><span className="mt-1 text-[11px] font-normal text-slate-400">JPG, PNG, WEBP. Tối đa 5MB.</span><input type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={e => handleDetailImageUpload(item.slug, e)} disabled={isUploadingDetailImage === item.slug} /></label>}
                                        </div>
                                        {detailImage && <label className="mt-3 inline-flex cursor-pointer items-center rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-red-300 hover:text-red-700">Thay ảnh<input type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={e => handleDetailImageUpload(item.slug, e)} disabled={isUploadingDetailImage === item.slug} /></label>}
                                    </div>
                                </div>
                                <div className="grid gap-5 md:grid-cols-2">
                                    <label className="text-xs font-semibold text-slate-600">Tiêu đề 1 (VI)<input value={detail.title_vi ?? item.title_vi ?? ""} onChange={e => updateDetail("title_vi", e.target.value)} className="mt-2 h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm text-slate-900" /></label>
                                    <label className="text-xs font-semibold text-slate-600">Tiêu đề 1 (EN)<input value={detail.title_en ?? item.title_en ?? ""} onChange={e => updateDetail("title_en", e.target.value)} className="mt-2 h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm text-slate-900" /></label>
                                    <label className="text-xs font-semibold text-slate-600 md:col-span-2">Nội dung 1 (VI)<textarea value={detail.content_vi ?? item.desc_vi ?? ""} onChange={e => updateDetail("content_vi", e.target.value)} rows={10} className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-900" /></label>
                                    <label className="text-xs font-semibold text-slate-600 md:col-span-2">Nội dung 1 (EN)<textarea value={detail.content_en ?? item.desc_en ?? ""} onChange={e => updateDetail("content_en", e.target.value)} rows={10} className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-900" /></label>
                                </div>
                            </div>;
                        })()}
                    </section>
                )}
{/* Tab 1: Services List Layout */}
                {activeTab === "list" && (
                    <div className="space-y-4 animate-in fade-in duration-300">
                        {/* Filters toolbar with strict ABB theme sizing */}
                        {false && <CmsFilters
                            searchTerm={searchTerm}
                            onSearchChange={(val) => { setSearchTerm(val); setCurrentPage(1); }}
                            searchPlaceholder={t.adminServices.filters.searchPlaceholder}
                            showReset={!!(searchTerm || categoryFilter !== "ALL" || statusFilter !== "ALL")}
                            onReset={() => { setSearchTerm(""); setCategoryFilter("ALL"); setStatusFilter("ALL"); setCurrentPage(1); }}
                            resetLabel={t.adminServices.actions.reset}
                        >
                            {/* Category filter */}
                            <select 
                                value={categoryFilter} 
                                onChange={(e) => { setCategoryFilter(e.target.value); setCurrentPage(1); }} 
                                className="h-8 rounded-md border border-dashed border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900 px-2.5 text-xs font-medium text-slate-800 dark:text-slate-200 shadow-sm outline-none cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
                            >
                                <option value="ALL">{t.adminServices.filters.allCategories}</option>
                                <option value="BẢO TRÌ SỬA CHỮA">{t.adminServices.categories.BẢO_TRÌ_SỬA_CHỮA}</option>
                                <option value="THIẾT KẾ THI CÔNG">{t.adminServices.categories.THIẾT_KẾ_THI_CÔNG}</option>
                                <option value="CUNG CẤP THIẾT BỊ">{t.adminServices.categories.CUNG_CẤP_THIẾT_BỊ}</option>
                                <option value="DỊCH VỤ">{t.adminServices.categories.DỊCH_VỤ}</option>
                            </select>
                            
                            {/* Status filter */}
                            <select 
                                value={statusFilter} 
                                onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }} 
                                className="h-8 rounded-md border border-dashed border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900 px-2.5 text-xs font-medium text-slate-800 dark:text-slate-200 shadow-sm outline-none cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
                            >
                                <option value="ALL">{t.adminServices.filters.allStatuses}</option>
                                <option value="HIỂN THỊ">{t.adminServices.status.active}</option>
                                <option value="ẨN">{t.adminServices.status.hidden}</option>
                            </select>
                        </CmsFilters>}

                        {/* List Wrapper with min-height matching Articles to prevent layout jumping */}
                        <div className="space-y-5">
                            {currentData.map((item, index) => (
                                <form key={item.id} data-service-form onSubmit={async (event) => { event.preventDefault(); const result = await upsertServiceAction(new FormData(event.currentTarget)); if (result?.error) toast.error(result.error); }} className="border border-slate-200 bg-white p-5 text-left">
                                    <input type="hidden" name="id" value={item.id} /><input type="hidden" name="imageUrl" value={item.imageUrl || ""} /><input type="hidden" name="category" value={item.category || "DỊCH VỤ"} /><input type="hidden" name="status" value={item.status === "ẨN" ? "ẨN" : "HIỂN THỊ"} />
                                    <div className="mb-4 flex items-center justify-between border-b border-slate-100 pb-3"><b className="text-sm text-slate-900">DỊCH VỤ {index + 1}</b><button type="button" onClick={() => setDeleteTarget({ id: item.id, name: item.title_vi })} className="text-xs font-semibold text-red-600 rounded-md px-2 py-1 transition-all duration-200 hover:bg-red-50 hover:text-red-700 hover:shadow-sm active:scale-95">Xóa dịch vụ</button></div>
                                    <div className="grid gap-4 md:grid-cols-2">
                                        <label className="text-xs font-semibold text-slate-600">Tiêu đề VI<input name="title_vi" defaultValue={item.title_vi} required className="mt-2 w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm" /></label>
                                        <label className="text-xs font-semibold text-slate-600">Tiêu đề EN<input name="title_en" defaultValue={item.title_en} className="mt-2 w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm" /></label>
                                        <label className="text-xs font-semibold text-slate-600">Mô tả VI<textarea name="desc_vi" defaultValue={item.desc_vi} required rows={4} className="mt-2 w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm" /></label>
                                        <label className="text-xs font-semibold text-slate-600">Mô tả EN<textarea name="desc_en" defaultValue={item.desc_en} rows={4} className="mt-2 w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm" /></label>
                                        <label className="text-xs font-semibold text-slate-600">Hình ảnh<input name="image_file" type="file" accept="image/jpeg,image/png,image/webp" onChange={(e) => { const file = e.currentTarget.files?.[0]; const image = e.currentTarget.parentElement?.querySelector("img") as HTMLImageElement | null; if (file && image) { image.src = URL.createObjectURL(file); image.classList.remove("hidden"); } }} className="mt-2 block text-xs file:mr-2 file:border file:border-slate-300 file:bg-white file:px-3 file:py-2" />{item.imageUrl && <img src={item.imageUrl} alt="Ảnh dịch vụ" className="mt-3 h-28 w-56 rounded-md object-cover" />}</label>
                                        <label className="text-xs font-semibold text-slate-600">Icon<input name="icon" defaultValue={item.icon || ""} className="mt-2 w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm" /></label>
                                    </div>
                                </form>
                            ))}
                        </div>

                        <div className="space-y-5">
                            {newServiceDrafts.map((draftId, draftIndex) => (
                                <form key={draftId} data-new-service-form onSubmit={(event) => event.preventDefault()} className="border border-slate-200 bg-white p-5 text-left">
                                    <input type="hidden" name="category" value="DỊCH VỤ" /><input type="hidden" name="status" value="HIỂN THỊ" />
                                    <div className="mb-4 flex items-center justify-between border-b border-slate-100 pb-3"><b className="text-sm text-slate-900">DỊCH VỤ {filteredServices.length + draftIndex + 1}</b><button type="button" onClick={() => setNewServiceDrafts(prev => prev.filter(id => id !== draftId))} className="rounded-md px-2 py-1 text-xs font-semibold text-red-600 transition hover:bg-red-50 hover:text-red-700">Xóa dịch vụ</button></div>
                                    <div className="grid gap-4 md:grid-cols-2">
                                        <label className="text-xs font-semibold text-slate-600">Tiêu đề VI<input name="title_vi" required className="mt-2 w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm" /></label>
                                        <label className="text-xs font-semibold text-slate-600">Tiêu đề EN<input name="title_en" className="mt-2 w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm" /></label>
                                        <label className="text-xs font-semibold text-slate-600">Mô tả VI<textarea name="desc_vi" required rows={4} className="mt-2 w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm" /></label>
                                        <label className="text-xs font-semibold text-slate-600">Mô tả EN<textarea name="desc_en" rows={4} className="mt-2 w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm" /></label>
                                        <label className="text-xs font-semibold text-slate-600">Hình ảnh<input name="image_file" type="file" accept="image/jpeg,image/png,image/webp" className="mt-2 block text-xs file:mr-2 file:border file:border-slate-300 file:bg-white file:px-3 file:py-2" /></label>
                                        <label className="text-xs font-semibold text-slate-600">Icon<input name="icon" className="mt-2 w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm" /></label>
                                    </div>
                                </form>
                            ))}
                            <button type="button" onClick={() => setNewServiceDrafts(prev => [...prev, Date.now()])} className="flex h-10 w-full items-center justify-center rounded-lg border border-dashed border-red-300 text-xs font-semibold text-red-600 transition hover:bg-red-50">+ {language === 'en' ? 'Add service' : 'Thêm dịch vụ'}</button>
                        </div>

                        <div className="hidden rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden transition-colors min-h-[440px]">
                            <div className="overflow-x-auto custom-scrollbar">
                                <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300 border-collapse table-fixed">
                                    <colgroup>
                                        <col className="w-[60px]" />
                                        <col />
                                        <col className="w-[200px]" />
                                        <col className="w-[140px]" />
                                        <col className="w-[56px]" />
                                    </colgroup>
                                    {false && <thead className="bg-slate-50 dark:bg-slate-900/80 border-b border-slate-200 dark:border-slate-800 select-none">
                                        <tr className="h-10">
                                            <th className="py-2 px-4 font-semibold text-slate-700 dark:text-slate-300 text-center uppercase tracking-wider text-[11px] align-middle">{t.adminServices.table.index}</th>
                                            <th className="py-2 px-4 font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[11px] align-middle">{t.adminServices.table.title}</th>
                                            <th className="py-2 px-4 font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[11px] align-middle">{t.adminServices.table.category}</th>
                                            <th className="py-2 px-4 font-semibold text-slate-700 dark:text-slate-300 text-center uppercase tracking-wider text-[11px] align-middle">{t.adminServices.table.status}</th>
                                            <th className="py-2 px-4 font-semibold text-slate-700 dark:text-slate-300 text-right uppercase tracking-wider text-[11px] sr-only align-middle">{t.adminServices.table.actions}</th>
                                        </tr>
                                    </thead>}
                                    
                                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 bg-white dark:bg-slate-900 transition-colors">
                                        {false ? (
                                            <tr>
                                                <td colSpan={5} className="p-4 bg-white dark:bg-slate-900">
                                                    <details>
                                                        <summary className="flex h-9 cursor-pointer list-none items-center justify-center rounded-lg border border-dashed border-red-300 text-xs font-semibold text-red-600 transition hover:bg-red-50 dark:hover:bg-red-950/20">
                                                            + {language === 'en' ? 'Add service' : 'Thêm dịch vụ'}
                                                        </summary>
                                                        <form id="new-service-form" onSubmit={async (event) => { event.preventDefault(); const result = await upsertServiceAction(new FormData(event.currentTarget)); if (result?.error) { toast.error(result.error); } else { toast.success("Đã lưu dịch vụ"); router.refresh(); } }} className="mt-4 border border-slate-200 bg-white p-5 text-left">
                                                            <div className="mb-4 flex items-center justify-between border-b border-slate-100 pb-3"><b className="text-sm text-slate-900">DỊCH VỤ {filteredServices.length + 1}</b><span className="text-xs font-semibold text-red-600">Xóa dịch vụ</span></div>
                                                            <div className="grid gap-4 md:grid-cols-2">
                                                                <label className="text-xs font-semibold text-slate-600">Tiêu đề VI<input name="title_vi" required className="mt-2 w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm" /></label>
                                                                <label className="text-xs font-semibold text-slate-600">Tiêu đề EN<input name="title_en" className="mt-2 w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm" /></label>
                                                                <label className="text-xs font-semibold text-slate-600">Mô tả VI<textarea name="desc_vi" required rows={4} className="mt-2 w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm" /></label>
                                                                <label className="text-xs font-semibold text-slate-600">Mô tả EN<textarea name="desc_en" rows={4} className="mt-2 w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm" /></label>
                                                                <label className="text-xs font-semibold text-slate-600">Hình ảnh<input name="image_file" type="file" accept="image/jpeg,image/png,image/webp" onChange={(e) => { const file = e.currentTarget.files?.[0]; const image = document.getElementById("new-service-preview") as HTMLImageElement | null; if (file && image) { image.src = URL.createObjectURL(file); image.classList.remove("hidden"); } }} className="mt-2 block w-auto max-w-full text-xs text-slate-700 file:mr-2 file:rounded-none file:border file:border-slate-300 file:bg-white file:px-3 file:py-2 file:text-xs file:text-slate-700" /><img id="new-service-preview" alt="Xem trước ảnh dịch vụ" className="mt-3 hidden h-28 w-56 rounded-md object-cover" /></label>
                                                                <label className="text-xs font-semibold text-slate-600">Icon<input name="icon" className="mt-2 w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm" /></label>
                                                            </div>
                                                            <input type="hidden" name="category" value="DỊCH VỤ" /><input type="hidden" name="status" value="HIỂN THỊ" />
                                                        </form>
                                                    </details>
                                                </td>
                                            </tr>
                                        ) : (
                                            currentData.map((item, index) => {
                                                const catKey = item.category?.replace(/\s+/g, "_");
                                                const displayCategory = t.adminServices.categories[catKey] ?? item.category;

                                                return (
                                                    <tr key={item.id} className="h-10 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group">
                                                        <td className="px-4 py-2 text-center text-slate-400 dark:text-slate-500 font-medium font-mono text-xs align-middle">
                                                            {(currentPage - 1) * rowsPerPage + index + 1}
                                                        </td>
                                                        <td className="px-4 py-2 truncate font-medium align-middle">
                                                            <Link 
                                                                href={`/admin/cms/services/edit/${item.id}`} 
                                                                className="text-sm font-medium text-slate-900 dark:text-slate-100 hover:text-red-700 dark:hover:text-red-500 transition-colors block truncate tracking-tight"
                                                                title={item.title_vi}
                                                            >
                                                                {item.title_vi}
                                                            </Link>
                                                        </td>
                                                        <td className="px-4 py-2 align-middle">
                                                            <span className="inline-flex items-center h-5 rounded-md px-2 text-[11px] font-medium bg-slate-100 text-slate-700 border border-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700">
                                                                {displayCategory}
                                                            </span>
                                                        </td>
                                                        <td className="px-4 py-2 text-center align-middle">
                                                            <StatusBadge 
                                                                status={item.status} 
                                                                activeLabel={updatingId === item.id ? "..." : t.adminServices.status.active}
                                                                hiddenLabel={updatingId === item.id ? "..." : t.adminServices.status.hidden}
                                                                onClick={() => handleToggleStatus(item.id, item.status)}
                                                                disabled={updatingId === item.id}
                                                            />
                                                        </td>
                                                        <td className="px-4 py-2 text-right align-middle">
                                                            <DropdownMenu>
                                                                <DropdownMenuTrigger asChild>
                                                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 transition-colors">
                                                                        <MoreHorizontal className="h-4 w-4" />
                                                                        <span className="sr-only">{t.adminServices.table.actions}</span>
                                                                    </Button>
                                                                </DropdownMenuTrigger>
                                                                <DropdownMenuContent align="end" className="w-44 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                                                                    <DropdownMenuItem 
                                                                        onClick={() => setPreviewItem(item)}
                                                                        className="cursor-pointer text-slate-700 dark:text-slate-300 focus:bg-slate-50 dark:focus:bg-slate-800"
                                                                    >
                                                                        <Eye className="mr-2 h-4 w-4 text-slate-500" />
                                                                        <span>{t.adminServices.menu.view}</span>
                                                                    </DropdownMenuItem>
                                                                    <DropdownMenuItem asChild className="cursor-pointer focus:bg-slate-50 dark:focus:bg-slate-800">
                                                                        <Link href={`/admin/cms/services/edit/${item.id}`} className="flex items-center w-full text-slate-700 dark:text-slate-300">
                                                                            <Pencil className="mr-2 h-4 w-4 text-slate-500" />
                                                                            <span>{t.adminServices.menu.edit}</span>
                                                                        </Link>
                                                                    </DropdownMenuItem>
                                                                    <DropdownMenuSeparator className="bg-slate-100 dark:bg-slate-800" />
                                                                    <DropdownMenuItem 
                                                                        onClick={() => setDeleteTarget({ id: item.id, name: item.title_vi })}
                                                                        disabled={isDeleting === item.id}
                                                                        className="cursor-pointer text-red-600 dark:text-red-400 focus:text-red-700 focus:bg-red-50 dark:focus:bg-red-950/30 disabled:opacity-50 disabled:cursor-not-allowed"
                                                                    >
                                                                        <Trash2 className="mr-2 h-4 w-4" />
                                                                        <span>{t.adminServices.menu.delete}</span>
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
                        </div>

                        {/* Compact pagination footer */}
                        {false && <TablePagination
                            totalItems={filteredServices.length}
                            itemsLabel={language === 'en' ? 'services' : 'dịch vụ'}
                            rowsPerPage={rowsPerPage}
                            onRowsPerPageChange={(rows) => { setRowsPerPage(rows); setCurrentPage(1); }}
                            currentPage={currentPage}
                            totalPages={totalPages}
                            onPageChange={(page) => setCurrentPage(page)}
                            language={language === 'en' ? 'en' : 'vi'}
                            rowsPerPageLabel={t.adminServices.table.rowsPerPage}
                        />}
                    </div>
                )}

                {/* Legacy banner editor removed: Banner & Hero is managed by the compact form above. */}
                {false && activeTab === "config" && (
                    <div className="space-y-6 animate-in fade-in duration-300">
                        {/* Hàng 1: Banner Form Card + Real-time Preview Card */}
                        <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_460px] gap-6 items-stretch">
                            
                            {/* Left Config Panel */}
                            <div className="space-y-6 min-w-0 h-full flex flex-col">
                                <div className="h-full bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-5 transition-colors">
                                    <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
                                        <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">Tiêu đề & Mô tả Banner</h3>
                                        <p className="text-xs text-slate-400 dark:text-slate-500">Cấu hình tiêu đề hiển thị ở phần đầu của trang Dịch vụ ngoài website.</p>
                                    </div>
                                    
                                    <div className="grid grid-cols-2 gap-5">
                                        <div className="space-y-2">
                                            <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">Badge (Tiếng Việt)</label>
                                            <input 
                                                type="text"
                                                value={config.hero.badge.vi}
                                                onChange={e => updateConfigField("badge", "vi", e.target.value)}
                                                className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-sm text-slate-900 dark:text-slate-100 focus:border-red-700 dark:focus:border-red-600 focus:outline-none transition-colors"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">Badge (English)</label>
                                            <input 
                                                type="text"
                                                value={config.hero.badge.en}
                                                onChange={e => updateConfigField("badge", "en", e.target.value)}
                                                className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-sm text-slate-900 dark:text-slate-100 focus:border-red-700 dark:focus:border-red-600 focus:outline-none transition-colors"
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
                                                className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-sm text-slate-900 dark:text-slate-100 focus:border-red-700 dark:focus:border-red-600 focus:outline-none transition-colors"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">Tiêu đề Banner (English)</label>
                                            <input 
                                                type="text"
                                                value={config.hero.title.en}
                                                onChange={e => updateConfigField("title", "en", e.target.value)}
                                                className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-sm text-slate-900 dark:text-slate-100 focus:border-red-700 dark:focus:border-red-600 focus:outline-none transition-colors"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-5">
                                        <div className="space-y-2">
                                            <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">Mô tả Banner (Tiếng Việt)</label>
                                            <textarea 
                                                value={config.hero.subtitle.vi}
                                                onChange={e => updateConfigField("subtitle", "vi", e.target.value)}
                                                className="w-full min-h-[82px] p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-sm text-slate-900 dark:text-slate-100 focus:border-red-700 dark:focus:border-red-600 focus:outline-none resize-none transition-colors"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">Mô tả Banner (English)</label>
                                            <textarea 
                                                value={config.hero.subtitle.en}
                                                onChange={e => updateConfigField("subtitle", "en", e.target.value)}
                                                className="w-full min-h-[82px] p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-sm text-slate-900 dark:text-slate-100 focus:border-red-700 dark:focus:border-red-600 focus:outline-none resize-none transition-colors"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Right Banner & Real-time Live Preview Panel */}
                            <div className="w-full xl:w-[460px] shrink-0 h-full bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm transition-colors flex flex-col justify-between min-h-[460px]">
                                <div className="border-b border-slate-100 dark:border-slate-800 pb-3 flex items-center justify-between shrink-0">
                                    <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">Ảnh nền & Lớp phủ</h3>
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
                                                    {previewLanguage === 'en' ? (config.hero.badge.en || "Services") : (config.hero.badge.vi || "Dịch Vụ")}
                                                </span>
                                                <h4 className="text-white text-base font-black uppercase tracking-tight line-clamp-1 max-w-full leading-none mb-1">
                                                    {previewLanguage === 'en' ? (config.hero.title.en || "SERVICES") : (config.hero.title.vi || "DỊCH VỤ")}
                                                </h4>
                                                <p className="text-white/60 text-[10px] font-medium leading-tight max-w-[80%] line-clamp-2">
                                                    {previewLanguage === 'en' ? (config.hero.subtitle.en || "") : (config.hero.subtitle.vi || "")}
                                                </p>
                                            </div>
                                            
                                            {/* Button to remove uploader */}
                                            <button
                                                type="button"
                                                onClick={() => setConfig(prev => ({ ...prev, hero: { ...prev.hero, backgroundImage: "" } }))}
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
                                            <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg border border-slate-200 dark:border-slate-700">
                                                <button
                                                    onClick={() => setPreviewLanguage('vi')}
                                                    className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all ${
                                                        previewLanguage === 'vi' 
                                                            ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                                                            : 'text-slate-500 hover:text-slate-800'
                                                    }`}
                                                >
                                                    VI
                                                </button>
                                                <button
                                                    onClick={() => setPreviewLanguage('en')}
                                                    className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all ${
                                                        previewLanguage === 'en' 
                                                            ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                                                            : 'text-slate-500 hover:text-slate-800'
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
                                                onChange={e => setConfig(prev => ({ ...prev, hero: { ...prev.hero, overlayOpacity: parseFloat(e.target.value) } }))}
                                                className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-red-700 focus:outline-none"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Connection indicators matching Articles */}
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
                </div>
            </div>

            {deleteTarget && createPortal(
                <div className="fixed inset-0 z-[300] flex items-center justify-center bg-slate-950/45 p-4 backdrop-blur-sm" onClick={() => setDeleteTarget(null)}>
                    <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
                        <div className="mb-5 flex items-start gap-4">
                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-red-50 text-red-600"><Trash2 size={20} /></div>
                            <div><h2 className="text-lg font-bold text-slate-900">Xóa dịch vụ?</h2><p className="mt-1 text-sm leading-relaxed text-slate-500">Bạn có chắc muốn xóa <span className="font-semibold text-slate-800">“{deleteTarget.name}”</span>? Thao tác này không thể hoàn tác.</p></div>
                        </div>
                        <div className="flex justify-end gap-3 border-t border-slate-100 pt-4">
                            <button type="button" onClick={() => setDeleteTarget(null)} className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50">Hủy</button>
                            <button type="button" onClick={() => handleDelete(deleteTarget.id, deleteTarget.name)} disabled={isDeleting === deleteTarget.id} className="rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-red-700 disabled:opacity-60">{isDeleting === deleteTarget.id ? "Đang xóa..." : "Xóa dịch vụ"}</button>
                        </div>
                    </div>
                </div>, document.body
            )}

            {/* Portal preview modal rendered cleanly with full dark mode support */}
            {mounted && previewItem && createPortal(
                <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4 md:p-8 animate-in fade-in duration-300 animate-out fade-out">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-5xl h-full max-h-[90vh] flex flex-col overflow-hidden relative border border-slate-200 dark:border-slate-800">
                        
                        {/* Modal Header */}
                        <div className="shrink-0 flex justify-between items-center px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 sticky top-0 z-10 transition-colors">
                            <div>
                                <span className="text-[10px] font-black bg-indigo-50 dark:bg-indigo-900/50 text-indigo-650 dark:text-indigo-300 px-2.5 py-1 rounded uppercase tracking-widest border border-indigo-100 dark:border-indigo-900/50">
                                    {t.adminServices.categories[getCategoryKey(previewItem.category)] ?? previewItem.category}
                                </span>
                            </div>
                            <button onClick={() => setPreviewItem(null)} className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-red-50 dark:hover:bg-red-950/30 text-slate-400 hover:text-red-500 transition-all"><X size={24} strokeWidth={3} /></button>
                        </div>
                        
                        {/* Modal Content */}
                        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 md:p-12 bg-white dark:bg-slate-900 transition-colors">
                            <div className="max-w-3xl mx-auto">
                                <h1 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-slate-100 leading-tight mb-6 uppercase tracking-tight">{previewItem.title_vi}</h1>
                                
                                {previewItem.imageUrl && (
                                    <div className="mb-10 rounded-2xl overflow-hidden border border-slate-100 dark:border-slate-800 shadow-sm flex justify-center bg-slate-50 dark:bg-slate-950">
                                        <img src={previewItem.imageUrl} alt="Cover" className="w-full h-auto max-h-[450px] object-contain" />
                                    </div>
                                )}
                                
                                <div className="prose prose-slate dark:prose-invert max-w-none prose-p:text-sm prose-p:leading-relaxed prose-headings:font-black prose-img:rounded-xl text-slate-700 dark:text-slate-350 whitespace-pre-wrap">
                                    {previewItem.desc_vi || <p className="italic text-slate-400 dark:text-slate-500">Chưa có mô tả chi tiết bằng tiếng Việt.</p>}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </div>
    );
}

// Inline constant for category translation inside modal preview
const getCategoryKey = (cat: string) => {
    return cat ? cat.replace(/\s+/g, "_") : "";
};








