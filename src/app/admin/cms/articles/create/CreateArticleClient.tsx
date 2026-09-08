// 📍 File: src/app/admin/cms/articles/create/CreateArticleClient.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
    CloudUpload, 
    FileText, 
    LayoutGrid, 
    Loader2, 
    Image as ImageIcon,
    Save,
    Trash2
} from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";
import { updateArticle } from "@/actions/article";
import { useAdminSettings } from "@/context/AdminSettingsContext";

export default function CreateArticleClient() {
    const router = useRouter();
    const { t, language } = useAdminSettings();
    const [loading, setLoading] = useState(false);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [activeLangTab, setActiveLangTab] = useState<"vi" | "en">("vi");

    // Reactive form tracking states
    const [titleVi, setTitleVi] = useState("");
    const [titleEn, setTitleEn] = useState("");
    const [summaryVi, setSummaryVi] = useState("");
    const [summaryEn, setSummaryEn] = useState("");
    const [contentVi, setContentVi] = useState("");
    const [contentEn, setContentEn] = useState("");
    const [category, setCategory] = useState("TIN_TUC");
    const [status, setStatus] = useState("PUBLISHED");
    const [isDirty, setIsDirty] = useState(false);
    const [isSaved, setIsSaved] = useState(false);

    // Add required render log for verification
    useEffect(() => {
        console.log("CREATE_ARTICLE_RENDER_V3_COMPACT_I18N");
    }, []);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setImagePreview(URL.createObjectURL(file));
            setIsDirty(true);
            setIsSaved(false);
        }
    };

    const handleRemoveImage = () => {
        setImagePreview(null);
        setIsDirty(true);
        setIsSaved(false);
        const fileInput = document.getElementById("cover-input") as HTMLInputElement;
        if (fileInput) fileInput.value = "";
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        const formData = new FormData(e.currentTarget);

        try {
            const result = await updateArticle(formData);
            if (result?.success || !result?.error) {
                setIsSaved(true);
                setIsDirty(false);
                toast.success((language === "en" ? "Saved article" : t.adminArticles.form.save) + " " + (language === "en" ? "successfully!" : "thành công!"));
                router.push("/admin/cms/articles");
                router.refresh();
            } else {
                toast.error(result?.error || "Error saving article");
            }
        } catch {
            toast.error("Lỗi hệ thống!");
        }
        setLoading(false);
    };

    // Reactively computed indicators
    const hasRequiredFields = 
        titleVi.trim().length > 0 && 
        summaryVi.trim().length > 0 && 
        contentVi.trim().length > 0;

    const isPublicVisible = status === "PUBLISHED";
    const viComplete = titleVi.trim().length > 0 && summaryVi.trim().length > 0 && contentVi.trim().length > 0;
    const enComplete = titleEn.trim().length > 0 && summaryEn.trim().length > 0 && contentEn.trim().length > 0;

    return (
        <div className="h-[calc(100vh-64px)] overflow-hidden bg-slate-50 dark:bg-slate-950 font-sans text-slate-700 dark:text-slate-300 select-none">
            <div className="mx-auto flex h-full max-w-[1400px] flex-col px-6 py-5">
                
                {/* Form Top Header Area */}
                <div className="mb-4 flex shrink-0 items-center justify-between pb-4">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm text-slate-700 dark:text-slate-300">
                            <FileText size={18} />
                        </div>
                        <h1 className="text-xl font-extrabold text-slate-900 dark:text-slate-50 uppercase tracking-tight">{t.adminArticles.form.createTitle}</h1>
                    </div>
                    
                    {/* Action Buttons */}
                    <div className="flex items-center gap-2.5">
                        <Link 
                            href="/admin/cms/articles" 
                            className="h-10 px-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm font-semibold text-slate-700 dark:text-slate-200 shadow-sm hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center justify-center uppercase tracking-wider transition-all select-none"
                        >
                            {t.adminArticles.form.cancel}
                        </Link>
                        <button
                            onClick={() => (document.getElementById("news-form") as HTMLFormElement).requestSubmit()}
                            disabled={loading}
                            className="h-10 px-5 rounded-xl bg-[#c40018] hover:bg-[#a80014] text-white text-sm font-semibold shadow-sm flex items-center justify-center gap-2 disabled:opacity-50 uppercase tracking-wider transition-all select-none"
                        >
                            {loading ? <Loader2 size={14} className="animate-spin" /> : <Save className="h-4 w-4" />}
                            {t.adminArticles.form.save}
                        </button>
                    </div>
                </div>

                <form id="news-form" onSubmit={handleSubmit} className="grid flex-1 min-h-0 grid-cols-1 xl:grid-cols-[1fr_360px] gap-5 items-start">
                    
                    {/* Left Column: Title/Summary + Clean Textarea */}
                    <div className="flex flex-col gap-4 min-h-0">
                        
                        {/* 1. THÔNG TIN BÀI VIẾT (Titles and Summaries) */}
                        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 transition-colors shrink-0">
                            <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3 mb-4">
                                <FileText size={16} className="text-slate-500" />
                                <h2 className="text-sm font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">{t.adminArticles.form.articleInfo}</h2>
                            </div>

                            <div className="space-y-4">
                                {/* Tiêu đề */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-[10px] font-bold uppercase text-slate-400 dark:text-slate-500 block mb-1 tracking-wider">{t.adminArticles.form.titleVi} <span className="text-red-500">*</span></label>
                                        <input 
                                            name="title" 
                                            required 
                                            type="text"
                                            value={titleVi}
                                            onChange={e => { setTitleVi(e.target.value); setIsDirty(true); setIsSaved(false); }}
                                            placeholder={t.adminArticles.form.placeholderTitleVi} 
                                            className="w-full h-11 px-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-sm text-slate-900 dark:text-slate-100 outline-none focus:border-indigo-500 dark:focus:border-indigo-600 shadow-inner transition-colors placeholder:text-slate-400 dark:placeholder:text-slate-500 font-medium" 
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-bold uppercase text-slate-400 dark:text-slate-500 block mb-1 tracking-wider">{t.adminArticles.form.titleEn}</label>
                                        <input 
                                            name="title_en" 
                                            type="text"
                                            value={titleEn}
                                            onChange={e => { setTitleEn(e.target.value); setIsDirty(true); setIsSaved(false); }}
                                            placeholder={t.adminArticles.form.placeholderTitleEn} 
                                            className="w-full h-11 px-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-sm text-slate-900 dark:text-slate-100 outline-none focus:border-indigo-500 dark:focus:border-indigo-600 shadow-inner transition-colors placeholder:text-slate-400 dark:placeholder:text-slate-500 font-medium" 
                                        />
                                    </div>
                                </div>

                                {/* Tóm tắt */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-[10px] font-bold uppercase text-slate-400 dark:text-slate-500 block mb-1 tracking-wider">{t.adminArticles.form.summaryVi}</label>
                                        <textarea 
                                            name="summary" 
                                            value={summaryVi}
                                            onChange={e => { setSummaryVi(e.target.value); setIsDirty(true); setIsSaved(false); }}
                                            placeholder={t.adminArticles.form.placeholderSummaryVi} 
                                            className="w-full h-20 px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-sm text-slate-900 dark:text-slate-100 outline-none focus:border-indigo-500 dark:focus:border-indigo-600 resize-none shadow-inner custom-scrollbar transition-colors placeholder:text-slate-400 dark:placeholder:text-slate-500 font-medium" 
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-bold uppercase text-slate-400 dark:text-slate-500 block mb-1 tracking-wider">{t.adminArticles.form.summaryEn}</label>
                                        <textarea 
                                            name="summary_en" 
                                            value={summaryEn}
                                            onChange={e => { setSummaryEn(e.target.value); setIsDirty(true); setIsSaved(false); }}
                                            placeholder={t.adminArticles.form.placeholderSummaryEn} 
                                            className="w-full h-20 px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-sm text-slate-900 dark:text-slate-100 outline-none focus:border-indigo-500 dark:focus:border-indigo-600 resize-none shadow-inner custom-scrollbar transition-colors placeholder:text-slate-400 dark:placeholder:text-slate-500 font-medium" 
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* 2. NỘI DUNG BÀI VIẾT (Locked height card 430px, clean plaintext textarea) */}
                        <div className="rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 flex flex-col h-[430px] transition-colors overflow-hidden shrink-0">
                            <div className="flex h-12 shrink-0 items-center justify-between border-b px-4 border-slate-200 dark:border-slate-800">
                                <div className="flex items-center gap-2">
                                    <FileText size={16} className="text-slate-500" />
                                    <span className="text-sm font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">{t.adminArticles.form.articleContent}</span>
                                </div>
                                
                                {/* Dynamic Language switcher tabs */}
                                <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-lg p-0.5 border border-slate-200/50 dark:border-slate-700/50 select-none">
                                    <button
                                        type="button"
                                        onClick={() => setActiveLangTab("vi")}
                                        className={`px-3.5 py-1 text-[11px] font-bold rounded-md transition-all ${
                                            activeLangTab === "vi"
                                                ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-50 shadow-sm"
                                                : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                                        }`}
                                    >
                                        {language === "en" ? "Vietnamese" : "Tiếng Việt"}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setActiveLangTab("en")}
                                        className={`px-3.5 py-1 text-[11px] font-bold rounded-md transition-all ${
                                            activeLangTab === "en"
                                                ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-50 shadow-sm"
                                                : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                                        }`}
                                    >
                                        {language === "en" ? "English" : "English"}
                                    </button>
                                </div>
                            </div>
                            
                            {/* Plain text editing area */}
                            <div className="flex-1 min-h-0 bg-white dark:bg-slate-900">
                                {activeLangTab === "vi" ? (
                                    <textarea 
                                        id="content-textarea-vi"
                                        name="content" 
                                        required 
                                        value={contentVi}
                                        onChange={e => { setContentVi(e.target.value); setIsDirty(true); setIsSaved(false); }}
                                        placeholder={t.adminArticles.form.placeholderContentVi} 
                                        className="w-full h-[350px] p-4 bg-transparent text-sm text-slate-900 dark:text-slate-100 outline-none resize-none overflow-y-auto custom-scrollbar leading-relaxed" 
                                    />
                                ) : (
                                    <textarea 
                                        id="content-textarea-en"
                                        name="content_en" 
                                        value={contentEn}
                                        onChange={e => { setContentEn(e.target.value); setIsDirty(true); setIsSaved(false); }}
                                        placeholder={t.adminArticles.form.placeholderContentEn} 
                                        className="w-full h-[350px] p-4 bg-transparent text-sm text-slate-900 dark:text-slate-100 outline-none resize-none overflow-y-auto custom-scrollbar leading-relaxed" 
                                    />
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Balanced layout with Settings Card + Cover Image + Sync Status */}
                    <div className="flex flex-col gap-4 w-full xl:w-[360px] shrink-0">
                        
                        {/* 1. Settings Card */}
                        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 transition-colors shrink-0">
                            <div className="flex items-center gap-2 mb-4 border-b border-slate-100 dark:border-slate-800 pb-3">
                                <LayoutGrid size={16} className="text-slate-500" />
                                <h2 className="text-sm font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">{t.adminArticles.form.settings}</h2>
                            </div>
                            
                            <div className="grid grid-cols-1 gap-4">
                                <div className="flex items-center justify-between gap-4">
                                    <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">{t.adminArticles.form.category}</span>
                                    <select 
                                        name="category" 
                                        value={category}
                                        onChange={e => { setCategory(e.target.value); setIsDirty(true); setIsSaved(false); }}
                                        className="w-56 h-9 px-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs font-semibold text-slate-900 outline-none dark:text-slate-100 cursor-pointer shadow-sm transition-colors font-medium"
                                    >
                                        {Object.entries(t.adminArticles.categories).map(([key, val]: any) => (
                                            <option key={key} value={key} className="dark:bg-slate-900">{val}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="flex items-center justify-between gap-4">
                                    <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">{t.adminArticles.form.status}</span>
                                    <select 
                                        name="status" 
                                        value={status}
                                        onChange={e => { setStatus(e.target.value); setIsDirty(true); setIsSaved(false); }}
                                        className="w-56 h-9 px-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs font-semibold text-slate-900 outline-none dark:text-slate-100 cursor-pointer shadow-sm transition-colors font-medium"
                                    >
                                        <option value="PUBLISHED" className="dark:bg-slate-900">{t.adminArticles.status.published}</option>
                                        <option value="DRAFT" className="dark:bg-slate-900">{t.adminArticles.status.hidden}</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* 2. Article Cover Image Card (SINGLE 16:9 box containing visual states) */}
                        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 transition-colors shrink-0">
                            <div className="flex items-center gap-2 mb-4 border-b border-slate-100 dark:border-slate-800 pb-3">
                                <ImageIcon size={16} className="text-slate-500" />
                                <h2 className="text-sm font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">{t.adminArticles.form.coverImage}</h2>
                            </div>
                            
                            {/* Visual single-box state machine */}
                            <div className="aspect-video w-full rounded-xl border border-dashed border-slate-300 dark:border-slate-700 overflow-hidden relative group bg-slate-50 dark:bg-slate-950 shadow-inner">
                                {imagePreview ? (
                                    <>
                                        <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                                        {/* Premium overlay visible on hover */}
                                        <div className="absolute inset-0 bg-black/45 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center gap-3">
                                            <label className="p-2 bg-white/20 hover:bg-white/40 backdrop-blur-sm rounded-xl text-white cursor-pointer transition-colors shadow" title={t.adminArticles.form.changeCover}>
                                                <CloudUpload size={18} />
                                                <input id="cover-input" type="file" name="image_file" accept="image/*" className="hidden" onChange={handleImageChange} />
                                            </label>
                                            <button 
                                                type="button" 
                                                onClick={handleRemoveImage} 
                                                className="p-2 bg-white/20 hover:bg-red-650 backdrop-blur-sm rounded-xl text-red-150 transition-colors shadow" 
                                                title="Remove Image"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </>
                                ) : (
                                    <label className="flex flex-col items-center justify-center w-full h-full cursor-pointer hover:border-indigo-500 dark:hover:border-indigo-600 transition-colors py-4">
                                        <div className="flex flex-col items-center justify-center text-center px-4">
                                            <CloudUpload size={28} className="text-slate-450 dark:text-slate-500 mb-1.5 group-hover:text-indigo-500 dark:group-hover:text-indigo-600 transition-colors" />
                                            <p className="text-[11px] text-slate-800 dark:text-slate-200 font-bold uppercase tracking-wider">{t.adminArticles.form.uploadCover}</p>
                                            <p className="text-[9px] text-slate-400 dark:text-slate-500 mt-1">{t.adminArticles.form.dragDrop}</p>
                                            <p className="text-[9px] text-slate-400 dark:text-slate-500 mt-0.5">{t.adminArticles.form.formats}</p>
                                        </div>
                                        <input id="cover-input" type="file" name="image_file" accept="image/*" className="hidden" onChange={handleImageChange} />
                                    </label>
                                )}
                            </div>
                        </div>

                        {/* 3. Real-time Computed Sync Status Card */}
                        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 transition-colors shrink-0 select-none">
                            <div className="flex items-center gap-2 mb-2 border-b border-slate-100 dark:border-slate-800 pb-2">
                                <span className="relative flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                                </span>
                                <h2 className="text-[11px] font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">{t.adminArticles.form.syncStatus}</h2>
                            </div>
                            <div className="space-y-2 text-[11px] font-bold text-slate-500 dark:text-slate-400">
                                {/* Admin Save Status */}
                                <div className="flex items-center justify-between">
                                    <span>Admin:</span>
                                    {!hasRequiredFields ? (
                                        <span className="text-red-650 dark:text-red-400 bg-red-50 dark:bg-red-950/20 px-2 py-0.5 rounded border border-red-100 dark:border-red-900/30 scale-[0.95] origin-right font-bold">
                                            {language === "en" ? "Missing required fields" : "Thiếu dữ liệu bắt buộc"}
                                        </span>
                                    ) : loading ? (
                                        <span className="text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/20 px-2 py-0.5 rounded border border-blue-100 dark:border-blue-900/30 scale-[0.95] origin-right font-bold">
                                            {language === "en" ? "Saving..." : "Đang lưu..."}
                                        </span>
                                    ) : isSaved ? (
                                        <span className="text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/20 px-2 py-0.5 rounded border border-emerald-100 dark:border-emerald-900/30 scale-[0.95] origin-right font-bold">
                                            {language === "en" ? "Saved" : "Đã lưu"}
                                        </span>
                                    ) : isDirty ? (
                                        <span className="text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-955/20 px-2 py-0.5 rounded border border-amber-100 dark:border-amber-900/30 scale-[0.95] origin-right font-bold">
                                            {language === "en" ? "Unsaved changes" : "Có thay đổi chưa lưu"}
                                        </span>
                                    ) : (
                                        <span className="text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/20 px-2 py-0.5 rounded border border-emerald-100 dark:border-emerald-900/30 scale-[0.95] origin-right font-bold">
                                            {language === "en" ? "Ready to save" : "Sẵn sàng lưu"}
                                        </span>
                                    )}
                                </div>

                                {/* Public Visibility */}
                                <div className="flex items-center justify-between">
                                    <span>Public:</span>
                                    {isPublicVisible ? (
                                        <span className="text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/20 px-2 py-0.5 rounded border border-emerald-100 dark:border-emerald-900/30 scale-[0.95] origin-right font-bold">
                                            {language === "en" ? "Will display on website" : "Sẽ hiển thị ngoài website"}
                                        </span>
                                    ) : (
                                        <span className="text-slate-500 dark:text-slate-450 bg-slate-50 dark:bg-slate-900/30 px-2 py-0.5 rounded border border-slate-100 dark:border-slate-800/30 scale-[0.95] origin-right font-bold">
                                            {language === "en" ? "Not displayed on website" : "Không hiển thị ngoài website"}
                                        </span>
                                    )}
                                </div>

                                {/* Languages completeness */}
                                <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-850 pt-1.5 mt-1.5">
                                    <span>{language === "en" ? "Languages:" : "Ngôn ngữ:"}</span>
                                    <span className="text-slate-700 dark:text-slate-300 font-bold scale-[0.95] origin-right">
                                        VI {viComplete ? (language === "en" ? "OK" : "đủ") : (language === "en" ? "incomplete" : "thiếu")} / EN {enComplete ? (language === "en" ? "OK" : "đủ") : (language === "en" ? "incomplete" : "thiếu")}
                                    </span>
                                </div>

                                {/* Cover image completeness */}
                                <div className="flex items-center justify-between">
                                    <span>{language === "en" ? "Cover Image:" : "Ảnh bìa:"}</span>
                                    {imagePreview ? (
                                        <span className="text-emerald-600 dark:text-emerald-400 font-bold scale-[0.95] origin-right">
                                            {language === "en" ? "Attached" : "Đã có"}
                                        </span>
                                    ) : (
                                        <span className="text-slate-400 dark:text-slate-500 font-bold scale-[0.95] origin-right">
                                            {language === "en" ? "Not attached" : "Chưa có"}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>

                    </div>
                </form>
            </div>
        </div>
    );
}