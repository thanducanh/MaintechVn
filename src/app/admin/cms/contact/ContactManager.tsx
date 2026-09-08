"use client";

import { useState, useEffect } from "react";
import { 
    Save, Loader2, Phone, Mail, MapPin, 
    MessageSquare, Settings2, Globe, Send,
    CheckCircle2, AlertCircle, Clock, Building2, Factory, FileText,
    UploadCloud, X, Trash2, Image as ImageIcon, RefreshCw, ArrowUp, Sliders
} from "lucide-react";
import { updateContactConfigAction, uploadContactBannerAction } from "@/actions/contact";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useAdminSettings } from "@/context/AdminSettingsContext";

interface ContactManagerProps {
    initialConfig: any;
}

// 🎨 Theme-aware reusable layout classes
const surfaceClass = "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800";
const pageClass = "bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100";
const inputClass = "w-full px-4 py-2.5 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-sm text-slate-900 dark:text-slate-100 outline-none focus-visible:ring-2 focus-visible:ring-slate-200 dark:focus-visible:ring-slate-800 focus-visible:border-slate-300 dark:focus-visible:border-slate-700 transition-all";

// 🚀 Helper to deep-merge database config with default fallback config
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
    // Preserve other potential keys from db just in case
    for (const key in initial) {
        if (merged[key] === undefined) {
            merged[key] = initial[key];
        }
    }
    return merged;
    return merged;
};

// 🚀 Helper to manage dynamic lists
const DynamicListEditor = ({ 
    title, items, onChange, maxItems = 5, placeholder, icon: Icon 
}: { 
    title: string, items: string[], onChange: (items: string[]) => void, maxItems?: number, placeholder: string, icon: any 
}) => {
    return (
        <div className="space-y-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm">
            <label className="text-xs font-medium text-slate-700 dark:text-slate-300 flex items-center justify-between">
                <span className="flex items-center gap-2"><Icon size={14} className="text-slate-500"/> {title} ({items.length}/{maxItems})</span>
                {items.length < maxItems && (
                    <button type="button" onClick={() => onChange([...items, ""])} className="text-emerald-600 hover:text-emerald-700 font-bold flex items-center gap-1 text-[11px] uppercase bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-lg transition-colors">
                        + Thêm mới
                    </button>
                )}
            </label>
            <div className="space-y-3 mt-4">
                {items.map((item, index) => (
                    <div key={index} className="flex items-center gap-2">
                        <input 
                            value={item}
                            onChange={(e) => {
                                const newItems = [...items];
                                newItems[index] = e.target.value;
                                onChange(newItems);
                            }}
                            className="w-full px-4 py-2.5 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-sm text-slate-900 dark:text-slate-100 outline-none focus-visible:ring-2 focus-visible:ring-slate-200 dark:focus-visible:ring-slate-800 focus-visible:border-slate-300 dark:focus-visible:border-slate-700 transition-all"
                            placeholder={placeholder}
                        />
                        <button type="button" title="Xóa" onClick={() => onChange(items.filter((_, i) => i !== index))} className="p-2.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg shrink-0 transition-colors">
                            <X size={16} />
                        </button>
                    </div>
                ))}
                {items.length === 0 && (
                    <div className="text-sm text-slate-400 italic py-2">Chưa có dữ liệu.</div>
                )}
            </div>
        </div>
    );
};

export default function ContactManager({ initialConfig }: ContactManagerProps) {
    const router = useRouter();
    const { t, language } = useAdminSettings();
    const [isLoading, setIsLoading] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const [showScrollTop, setShowScrollTop] = useState(false);
    const [activeSection, setActiveSection] = useState("banner");

    useEffect(() => {
        const mainEl = document.querySelector("main");
        if (!mainEl) return;

        const handleScroll = () => {
            setShowScrollTop(mainEl.scrollTop > 300);
        };

        handleScroll();
        mainEl.addEventListener("scroll", handleScroll, { passive: true });
        return () => mainEl.removeEventListener("scroll", handleScroll);
    }, []);

    const sections = [
        { id: "banner", label: t.adminContact.sections.banner },
        { id: "main-info", label: t.adminContact.sections.contactInfo },
        { id: "address", label: t.adminContact.sections.address },
        { id: "quick-channels", label: t.adminContact.sections.quickLinks },
        { id: "intro-content", label: t.adminContact.sections.content },
        { id: "consultation-form", label: t.adminContact.sections.consultationForm },
    ];
    
    const defaultConfig = {
        hero: {
            title: { vi: "Liên hệ chúng tôi", en: "Contact us" },
    subtitle: { vi: "", en: "" },
            backgroundImage: "",
            overlayOpacity: 0.6
        },
        pageContent: {
            title: { vi: "CHÚNG TÔI LUÔN SẴN SÀNG LẮNG NGHE", en: "WE ARE ALWAYS READY TO LISTEN" },
            subtitle: { vi: "KẾT NỐI", en: "CONNECT" },
            description: { 
                vi: "Bất kể yêu cầu về bảo trì, phụ tùng hay tư vấn giải pháp mới, đội ngũ kỹ sư của Maintech luôn sẵn sàng đồng hành cùng doanh nghiệp bạn.",
                en: "Regardless of your request for maintenance, spare parts or advice on new solutions, Maintech's engineering team is always ready to accompany your business."
            }
        },
        contactInfo: {
            hotlines: ["0918 458 399"],
            emails: ["mtv@maintechvn.com.vn"],
            hotline: "0918 458 399",
            email: "mtv@maintechvn.com.vn",
            responseTime: {
                vi: "Cam kết phản hồi kỹ thuật trong vòng 24 giờ làm việc.",
                en: "We commit to responding within 24 business hours."
            }
        },
        addresses: {
            list: [
                "25V/5 Đường Bình Hòa 22, Phường Bình Hòa, TP. Thuận An, Tỉnh Bình Dương, Việt Nam.",
                "85/5 Vĩnh Phú 38A, Phường Vĩnh Phú, TP. Thuận An, Tỉnh Bình Dương, Việt Nam."
            ],
            headOffice: "25V/5 Đường Bình Hòa 22, Phường Bình Hòa, TP. Thuận An, Tỉnh Bình Dương, Việt Nam.",
            factory: "85/5 Vĩnh Phú 38A, Phường Vĩnh Phú, TP. Thuận An, Tỉnh Bình Dương, Việt Nam.",
            mapUrl: "https://maps.google.com/maps?q=Maintech+Vietnam+%C4%90%E1%BB%93ng+Nai&output=embed&z=15"
        },
        quickChannels: {
            zalo: { enabled: true, label: "Zalo", value: "0918458399" },
            whatsapp: { enabled: true, label: "WhatsApp", value: "+84918458399" },
            telegram: { enabled: true, label: "Telegram", value: "maintechvn" }
        },
        form: {
            enabled: true,
            title: { vi: "Gửi yêu cầu tư vấn", en: "Request a consultation" },
            subtitle: { vi: "Cam kết phản hồi kỹ thuật trong vòng 24 giờ làm việc.", en: "We commit to responding within 24 business hours." },
            submitText: { vi: "Gửi thông tin ngay", en: "Send request" },
            receiverEmail: "mtv@maintechvn.com.vn",
            successMessage: {
                vi: "Yêu cầu đã được gửi! Chúng tôi sẽ liên hệ lại sớm nhất.",
                en: "Your request has been sent. We will contact you soon."
            }
        }
    };

  const [config, setConfig] = useState(() => {
    const merged = mergeConfig(initialConfig, defaultConfig);
    if (!merged.contactInfo.hotlines) merged.contactInfo.hotlines = merged.contactInfo.hotline ? [merged.contactInfo.hotline] : [];
    if (!merged.contactInfo.emails) merged.contactInfo.emails = merged.contactInfo.email ? [merged.contactInfo.email] : [];
    if (!merged.addresses.list) merged.addresses.list = [merged.addresses.headOffice, merged.addresses.factory].filter(Boolean);
    return {
      ...merged,
      hero: {
        ...merged.hero,
        subtitle: { vi: "", en: "" },
      },
    };
  });

    const getBilingualValue = (section: string, field: string, lang: 'vi' | 'en') => {
        const val = config[section]?.[field];
        if (!val) return "";
        if (typeof val === "string") {
            return lang === 'vi' ? val : "";
        }
        return val[lang] || "";
    };

    const updateBilingualField = (section: string, field: string, lang: 'vi' | 'en', text: string) => {
        setConfig((prev: any) => {
            const val = prev[section]?.[field];
            let currentObj = { vi: "", en: "" };
            if (typeof val === "string") {
                currentObj.vi = val;
            } else if (val && typeof val === "object") {
                currentObj = { ...val };
            }
            currentObj[lang] = text;
            return {
                ...prev,
                [section]: {
                    ...prev[section],
                    [field]: currentObj
                }
            };
        });
    };

    const updateField = (section: string, field: string, value: any) => {
        setConfig((prev: any) => ({
            ...prev,
            [section]: {
                ...prev[section],
                [field]: value
            }
        }));
    };

    const updateNestedField = (section: string, subSection: string, field: string, value: any) => {
        setConfig((prev: any) => ({
            ...prev,
            [section]: {
                ...prev[section],
                [subSection]: {
                    ...prev[section][subSection],
                    [field]: value
                }
            }
        }));
    };

    const handleUpload = async (file: File) => {
        // Validate file type
        const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
        if (!validTypes.includes(file.type)) {
            toast.error("Định dạng file không hợp lệ! Chỉ chấp nhận JPG, JPEG, PNG, WEBP.");
            return;
        }

        // Validate file size (max 5MB)
        const maxSize = 5 * 1024 * 1024;
        if (file.size > maxSize) {
            toast.error("Dung lượng file quá lớn! Vui lòng chọn ảnh dưới 5MB.");
            return;
        }

        setIsUploading(true);
        const toastId = toast.loading("Đang tải ảnh lên...");

        try {
            const formData = new FormData();
            formData.append("file", file);

            const res = await uploadContactBannerAction(formData);

            if (res.success && res.url) {
                updateField("hero", "backgroundImage", res.url);
                toast.success("Tải ảnh lên thành công!", { id: toastId });
            } else {
                toast.error(res.error || "Không thể tải ảnh lên!", { id: toastId });
            }
        } catch (error: any) {
            console.error("Lỗi khi upload:", error);
            toast.error("Lỗi kết nối máy chủ!", { id: toastId });
        } finally {
            setIsUploading(false);
        }
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const files = e.dataTransfer.files;
        if (files && files.length > 0) {
            handleUpload(files[0]);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files && files.length > 0) {
            handleUpload(files[0]);
        }
    };

    const handleDeleteImage = () => {
        updateField("hero", "backgroundImage", "");
        toast.success("Đã xóa ảnh banner!");
    };

    const handleSave = async () => {
        setIsLoading(true);
        const res = await updateContactConfigAction(config);
        if (res?.success) {
            toast.success("Đã cập nhật cấu hình Liên hệ!");
            router.refresh();
        } else {
            toast.error("Lỗi: " + res?.error);
        }
        setIsLoading(false);
    };

    return (
        <div className="min-h-full w-full flex flex-col overflow-visible animate-in fade-in duration-500">
            {/* 🚀 TWO-COLUMN GRID LAYOUT */}
            <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-8 items-start min-h-0 flex-1">
                {/* Left Sidebar Menu & Live Status Widget */}
                <aside className="self-start flex flex-col space-y-4 w-full shrink-0">
                    <div className="flex flex-col space-y-1 p-2 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden shrink-0">
                        {[
                            { id: "banner", label: "Banner & Hero", icon: Globe },
                            { id: "contact", label: language === 'en' ? 'Contact Info' : 'Thông tin liên hệ', icon: Phone }
                        ].map((tab) => {
                            const IconComponent = tab.icon;
                            const isActive = activeSection === tab.id;
                            return (
                                <button
                                    key={tab.id}
                                    type="button"
                                    onClick={() => setActiveSection(tab.id)}
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


                    <button
                        type="button"
                        onClick={handleSave}
                        disabled={isLoading}
                        className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-emerald-700 px-5 text-xs font-bold text-white shadow-sm transition hover:bg-emerald-800 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-emerald-500/20 disabled:pointer-events-none disabled:opacity-50 dark:bg-emerald-600 dark:hover:bg-emerald-700"
                    >
                        {isLoading ? <Loader2 className="animate-spin h-4 w-4" /> : <Save className="h-4 w-4" />}
                        {t.adminContact.actions.save}
                    </button>
                </aside>

                {/* Right Active Content Container - Locked Scroll View */}
                <div className="min-h-0 pr-2 pb-12 self-start rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white/60 dark:bg-slate-900/40 p-4">

            {/* 🚀 CARD 4: BANNER & HERO - SPANS FULL WIDTH (12 COLUMNS) */}
            {activeSection === "banner" && (
                <div className="animate-in fade-in duration-300 space-y-6">

                    <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-4 border-b border-slate-100">
                            <div className="space-y-2">
                                <label className="text-xs font-medium text-slate-500 ml-1">{t.adminContact.banner.titleVi}</label>
                                <input 
                                    value={getBilingualValue("hero", "title", "vi")}
                                    onChange={e => updateBilingualField("hero", "title", "vi", e.target.value)}
                                    className={inputClass}
                                  />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-medium text-slate-500 ml-1">{t.adminContact.banner.titleEn}</label>
                                <input 
                                    value={getBilingualValue("hero", "title", "en")}
                                    onChange={e => updateBilingualField("hero", "title", "en", e.target.value)}
                                    className={inputClass}
                                  />
                            </div>
                        </div>
                        
                        <div className="hidden grid grid-cols-1 md:grid-cols-2 gap-6 pb-4 border-b border-slate-100">
                            <div className="space-y-2">
                                <label className="text-xs font-medium text-slate-500 ml-1">{t.adminContact.banner.descVi}</label>
                                <input 
                                    value={getBilingualValue("hero", "subtitle", "vi")}
                                    onChange={e => updateBilingualField("hero", "subtitle", "vi", e.target.value)}
                                    className={inputClass}
                                  />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-medium text-slate-500 ml-1">{t.adminContact.banner.descEn}</label>
                                <input 
                                    value={getBilingualValue("hero", "subtitle", "en")}
                                    onChange={e => updateBilingualField("hero", "subtitle", "en", e.target.value)}
                                    className={inputClass}
                                  />
                            </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* BANNER UPLOADER */}
                                <div className="w-full space-y-2">
                                <label className="text-xs font-medium text-slate-500 ml-1">{t.adminContact.banner.image}</label>
                                {config.hero.backgroundImage ? (
                                    <div 
                                        className="relative w-full h-[220px] rounded-xl overflow-hidden border border-slate-200 shadow-sm group"
                                    >
                                        {/* Actual Image */}
                                        <img 
                                            src={config.hero.backgroundImage} 
                                            alt={language === 'en' ? 'Banner Preview' : 'Ảnh nền Banner'} 
                                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                                        />
                                        
                                        {/* Overlay Actions */}
                                        <div className="absolute inset-0 bg-slate-900/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center">
                                            {/* Change Image Button - Center */}
                                            <label className="flex items-center gap-2 px-5 py-2.5 bg-slate-900/70 hover:bg-slate-900/90 text-white text-sm font-semibold rounded-lg cursor-pointer transition-colors shadow-lg backdrop-blur-sm">
                                                <UploadCloud size={18} className={isUploading ? "animate-bounce" : ""} />
                                                {isUploading ? (language === 'en' ? "Uploading..." : "Đang tải...") : t.adminContact.banner.changeImage}
                                                <input 
                                                    type="file" 
                                                    accept="image/jpeg,image/jpg,image/png,image/webp" 
                                                    className="hidden" 
                                                    onChange={handleFileChange}
                                                    disabled={isUploading}
                                                />
                                            </label>
                                        </div>

                                        {/* Delete Button - Top Right */}
                                        <button
                                            type="button"
                                            onClick={handleDeleteImage}
                                            className="absolute top-3 right-3 flex items-center gap-1.5 px-3 py-1.5 bg-slate-900/60 hover:bg-red-600/90 text-white text-xs font-semibold rounded-lg shadow-lg backdrop-blur-sm transition-all duration-200 z-20"
                                            title={t.adminContact.banner.removeImage}
                                        >
                                            <Trash2 size={14} />
                                            {t.adminContact.banner.removeImage}
                                        </button>
                                    </div>

                            ) : (
                                /* 🚀 Dashed Drag and Drop Upload Area */
                                <label
                                    onDragOver={handleDragOver}
                                    onDragLeave={handleDragLeave}
                                    onDrop={handleDrop}
                                    className={`relative w-full h-[175px] rounded-xl border-2 border-dashed flex flex-col items-center justify-center p-6 text-center transition-all duration-200 group cursor-pointer ${
                                        isDragging 
                                            ? "border-red-600 bg-red-50/50" 
                                            : "border-slate-300 hover:border-slate-400 bg-slate-50/60 hover:bg-slate-100/50"
                                    }`}
                                >
                                    <input 
                                        type="file" 
                                        accept="image/jpeg,image/jpg,image/png,image/webp" 
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" 
                                        onChange={handleFileChange}
                                        disabled={isUploading}
                                    />
                                    {isUploading ? (
                                        <div className="flex flex-col items-center gap-2 relative z-0 pointer-events-none">
                                            <Loader2 className="animate-spin text-red-700" size={32} />
                                            <span className="text-xs font-bold text-slate-500">{language === 'en' ? 'UPLOADING...' : 'ĐANG TẢI ẢNH LÊN...'}</span>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center gap-2 relative z-0 pointer-events-none">
                                            <div className="p-3 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 group-hover:scale-110 transition-transform duration-200">
                                                <UploadCloud className="text-slate-400 group-hover:text-red-700 transition-colors" size={24} />
                                            </div>
                                            <p className="text-xs font-bold text-slate-700 uppercase tracking-wider mt-1">
                                                {language === 'en' ? 'Drag & drop cover or Click to upload' : 'Kéo thả ảnh hoặc Click để tải lên'}
                                            </p>
                                            <p className="text-[10px] text-slate-400 font-medium">
                                                {language === 'en' ? 'Accepts JPG, JPEG, PNG, WEBP (Max 5MB)' : 'Chấp nhận JPG, JPEG, PNG, WEBP (Tối đa 5MB)'}
                                            </p>
                                        </div>
                                    )}
                                </label>
                            )}
                        </div>

                        {/* OVERLAY SLIDER (4 COLS) */}
                        <div className="hidden md:col-span-4 space-y-4 flex flex-col justify-center">
                            <div className="space-y-2">
                                <div className="flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400">
                                    <span>{t.adminContact.banner.overlay}</span>
                                    <span className="font-mono bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-slate-600 dark:text-slate-350">
                                        {Math.round((config.hero.overlayOpacity !== undefined ? config.hero.overlayOpacity : 0.6) * 100)}%
                                    </span>
                                </div>
                                <p className="text-[11px] text-slate-400 font-medium leading-relaxed">
                                    {language === 'en' ? 'Adjust background brightness/darkness to ensure readable banner titles.' : 'Điều chỉnh độ sáng/tối của ảnh nền để đảm bảo nội dung tiêu đề hiển thị rõ ràng trên web.'}
                                </p>
                                <div className="flex items-center gap-4 pt-2">
                                    <input 
                                        type="range"
                                        step="0.05"
                                        min="0"
                                        max="1"
                                        value={config.hero.overlayOpacity !== undefined ? config.hero.overlayOpacity : 0.6}
                                        onChange={e => updateField("hero", "overlayOpacity", parseFloat(e.target.value))}
                                        className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-red-700 focus:outline-none"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            )}

            {activeSection === "contact" && (
                <div className="animate-in fade-in duration-300 space-y-6">
                    <div className="space-y-8">
                        <DynamicListEditor
                            title={language === 'en' ? 'Addresses' : 'Danh sách Địa chỉ'}
                            items={config.addresses.list || []}
                            onChange={items => updateField("addresses", "list", items)}
                            placeholder={language === 'en' ? 'Enter address...' : 'Nhập địa chỉ...'}
                            icon={MapPin}
                        />
                        <DynamicListEditor
                            title={language === 'en' ? 'Emails' : 'Danh sách Email'}
                            items={config.contactInfo.emails || []}
                            onChange={items => updateField("contactInfo", "emails", items)}
                            placeholder="Email..."
                            icon={Mail}
                        />
                        <DynamicListEditor
                            title={language === 'en' ? 'Phone Numbers' : 'Danh sách Số điện thoại'}
                            items={config.contactInfo.hotlines || []}
                            onChange={items => updateField("contactInfo", "hotlines", items)}
                            placeholder={language === 'en' ? 'Phone number...' : 'Số điện thoại...'}
                            icon={Phone}
                        />
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                            <div className="space-y-2">
                                <label className="text-xs font-medium text-slate-500 ml-1">{language === 'en' ? 'Response Time Text (VI)' : 'Thông báo thời gian phản hồi (VI)'}</label>
                                <textarea 
                                    value={getBilingualValue("contactInfo", "responseTime", "vi")}
                                    onChange={e => updateBilingualField("contactInfo", "responseTime", "vi", e.target.value)}
                                    rows={2}
                                    className={`${inputClass} resize-none`}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-medium text-slate-500 ml-1">{language === 'en' ? 'Response Time Text (EN)' : 'Thông báo thời gian phản hồi (EN)'}</label>
                                <textarea 
                                    value={getBilingualValue("contactInfo", "responseTime", "en")}
                                    onChange={e => updateBilingualField("contactInfo", "responseTime", "en", e.target.value)}
                                    rows={2}
                                    className={`${inputClass} resize-none`}
                                />
                            </div>
                        </div>

                        <div className="border-t border-slate-200 dark:border-slate-800 pt-6 space-y-2">
                            <label className="text-xs font-medium text-slate-500 ml-1">{language === 'en' ? 'Google Map Embed Link (iframe src)' : 'Link nhúng Google Map (iframe src)'}</label>
                            <input 
                                value={config.addresses.mapUrl}
                                onChange={e => updateField("addresses", "mapUrl", e.target.value)}
                                className="w-full px-4 py-2.5 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs font-mono text-slate-500 dark:text-slate-400 outline-none focus-visible:ring-2 focus-visible:ring-slate-200 dark:focus-visible:ring-slate-800 focus-visible:border-slate-300 dark:focus-visible:border-slate-700 transition-all"
                                placeholder="https://maps.google.com/..."
                            />
                        </div>
                        <div className="border-t border-slate-200 dark:border-slate-800 pt-6 space-y-4">
                            <label className="text-sm font-bold text-slate-900 dark:text-slate-100">
                                {language === 'en' ? 'Quick Channels & Social Networks' : 'Kênh liên lạc nhanh & Mạng xã hội'}
                            </label>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {[
                                    { key: 'zalo', style: "bg-blue-50/60 dark:bg-blue-950/20 border-blue-100 dark:border-blue-900/30 text-blue-700 dark:text-blue-400", label: "Zalo" },
                                    { key: 'whatsapp', style: "bg-emerald-50/60 dark:bg-emerald-950/20 border-emerald-100 dark:border-emerald-900/30 text-emerald-700 dark:text-emerald-400", label: "WhatsApp" },
                                    { key: 'telegram', style: "bg-sky-50/60 dark:bg-sky-950/20 border-sky-100 dark:border-sky-900/30 text-sky-700 dark:text-sky-400", label: "Telegram" }
                                ].map(({ key, style, label }) => (
                                    <div key={key} className={`rounded-xl border px-4 py-4 space-y-3 ${style}`}>
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm font-bold uppercase tracking-tight">{label}</span>
                                            <label className="relative inline-flex items-center cursor-pointer">
                                                <input 
                                                    type="checkbox" 
                                                    checked={config.quickChannels[key]?.enabled || false} 
                                                    onChange={e => updateNestedField("quickChannels", key, "enabled", e.target.checked)}
                                                    className="sr-only peer" 
                                                />
                                                <div className="w-9 h-5 bg-slate-200/50 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600 hover:peer-checked:bg-blue-700"></div>
                                            </label>
                                        </div>
                                        <input 
                                            value={config.quickChannels[key]?.value || ""}
                                            onChange={e => updateNestedField("quickChannels", key, "value", e.target.value)}
                                            placeholder={language === 'en' ? 'Link/Username...' : 'Link/Username...'}
                                            className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-sm text-slate-900 dark:text-slate-100 outline-none focus:border-slate-400 dark:focus:border-slate-700 transition-colors"
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}



                </div> {/* End right column container */}
            </div> {/* End grid container */}

            {/* Nút cuộn lên đầu (Back to Top) */}
            {showScrollTop && (
                <button 
                    type="button"
                    onClick={() => {
                        const mainEl = document.querySelector("main");
                        if (mainEl) {
                            mainEl.scrollTo({ top: 0, behavior: "smooth" });
                        }
                    }}
                    className="fixed bottom-24 right-6 z-[9999] flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-lg hover:bg-slate-50 hover:text-slate-900 transition-all duration-300 animate-in fade-in slide-in-from-bottom-4"
                    aria-label={language === 'en' ? "Scroll to top" : "Cuộn lên đầu trang"}
                    title={language === 'en' ? "Scroll to top" : "Cuộn lên đầu trang"}
                >
                    <ArrowUp className="h-4 w-4" />
                </button>
            )}
        </div>
    );
}
