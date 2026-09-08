// 📍 File: src/app/admin/cms/settings/SettingsClient.tsx
"use client";

import { useState } from "react";
import { 
    Image as ImageIcon, Save, RefreshCw, 
    Trash2, CheckCircle, Phone,
    MapPin, Share2, Globe,
    MessageCircle, Send, ChevronRight, LayoutTemplate, UploadCloud
} from "lucide-react";
import { 
    saveSiteLogoAction, deleteSiteLogoAction, 
    upsertCompanyInfoAction, clearCompanyInfoAction,
    saveBannerAction, deleteBannerAction, testTelegramAction
} from "@/actions/settings";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

interface SettingsClientProps {
    initialLogo: string | null;
    initialCompanyInfo: any;
    initialBanners: Record<string, string>;
}

export default function SettingsClient({ initialLogo, initialCompanyInfo, initialBanners }: SettingsClientProps) {
    const router = useRouter();
    const [logoUrl, setLogoUrl] = useState<string | null>(initialLogo);
    const [imagePreview, setImagePreview] = useState<string | null>(initialLogo);
    const [isLogoSaved, setIsLogoSaved] = useState(false);
    const [isLoadingLogo, setIsLoadingLogo] = useState(false);
    
    const [companyInfo, setCompanyInfo] = useState({ 
        hotline: initialCompanyInfo?.hotline || "",
        email: initialCompanyInfo?.email || "",
        zaloUrl: initialCompanyInfo?.zaloUrl || "", 
        whatsappUrl: initialCompanyInfo?.whatsappUrl || "",
        telegramUrl: initialCompanyInfo?.telegramUrl || "", 
        officeAddress: initialCompanyInfo?.officeAddress || "",
        factoryAddress: initialCompanyInfo?.factoryAddress || ""
    });
    
    const [banners, setBanners] = useState<Record<string, string>>(initialBanners);
    const [isInfoSaved, setIsInfoSaved] = useState(false);
    const [isLoadingInfo, setIsLoadingInfo] = useState(false);
    const [isTestingTele, setIsTestingTele] = useState(false);

    const bannerConfig = [
        { key: "BANNER_HOME", name: "Trang Chủ", desc: "Ảnh bìa màn hình đầu tiên" },
        { key: "BANNER_ABOUT", name: "Về Chúng Tôi", desc: "Ảnh nền trang giới thiệu" },
        { key: "BANNER_SERVICES", name: "Dịch Vụ", desc: "Ảnh nền trang dịch vụ" },
        { key: "BANNER_PRODUCTS", name: "Sản Phẩm", desc: "Ảnh nền kho thiết bị" },
        { key: "BANNER_NEWS", name: "Tin Tức", desc: "Ảnh nền trang bài viết" },
    ];

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (file.size > 2 * 1024 * 1024) {
            e.target.value = '';
            return toast.error("Ảnh logo nên dưới 2MB!");
        }
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onloadend = () => {
            setImagePreview(reader.result as string);
            setLogoUrl(reader.result as string);
            setIsLogoSaved(false);
            e.target.value = '';
        };
    };

    const handleSaveLogo = async () => {
        if (!logoUrl) return toast.error("Chọn ảnh!");
        setIsLoadingLogo(true);
        try {
            const result: any = await saveSiteLogoAction(logoUrl);
            if (result.success) {
                toast.success("Cập nhật thành công!");
                setIsLogoSaved(true);
                setTimeout(() => setIsLogoSaved(false), 3000);
                router.refresh();
            } else {
                toast.error(result.error || "Có lỗi xảy ra");
            }
        } catch (e) { toast.error("Lỗi kết nối Server"); }
        setIsLoadingLogo(false);
    };

    const handleSaveInfo = async () => {
        setIsLoadingInfo(true);
        try {
            const result: any = await upsertCompanyInfoAction(companyInfo);
            if (result.success) {
                toast.success("Đã đồng bộ!");
                setIsInfoSaved(true);
                setTimeout(() => setIsInfoSaved(false), 3000);
                router.refresh();
            } else {
                toast.error(result.error || "Có lỗi khi lưu");
            }
        } catch (e) { toast.error("Lỗi hệ thống"); }
        setIsLoadingInfo(false);
    };

    const handleTestTele = async () => {
        setIsTestingTele(true);
        const tid = toast.loading("Đang gửi tin nhắn thử nghiệm...");
        try {
            const res = await testTelegramAction();
            if (res.success) toast.success("Telegram báo 'Tinh Tinh' rồi sếp ơi!", { id: tid });
            else toast.error(res.error || "Lỗi cấu hình!", { id: tid });
        } catch (e) { toast.error("Lỗi kết nối!", { id: tid }); }
        setIsTestingTele(false);
    };

    const handleBannerFile = async (e: React.ChangeEvent<HTMLInputElement>, key: string) => {
        const file = e.target.files?.[0];
        if (!file) return;
        
        if (file.size > 15 * 1024 * 1024) {
            e.target.value = '';
            return toast.error("Ảnh quá siêu nặng (vượt 15MB), vui lòng đổi ảnh khác!");
        }

        const toastId = toast.loading("Đang xử lý và nén ảnh tự động...");

        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (event) => {
            const img = new window.Image();
            img.src = event.target?.result as string;
            img.onload = async () => {
                const canvas = document.createElement('canvas');
                const MAX_WIDTH = 1920; 
                const MAX_HEIGHT = 1080;
                let width = img.width;
                let height = img.height;

                if (width > MAX_WIDTH || height > MAX_HEIGHT) {
                    const ratio = Math.min(MAX_WIDTH / width, MAX_HEIGHT / height);
                    width = Math.round(width * ratio);
                    height = Math.round(height * ratio);
                }

                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx?.drawImage(img, 0, 0, width, height);
                
                const compressedBase64 = canvas.toDataURL('image/webp', 0.75);
                setBanners(prev => ({ ...prev, [key]: compressedBase64 })); 
                
                try {
                    const res: any = await saveBannerAction(key, compressedBase64);
                    if (res.success) toast.success("Cập nhật ảnh nền thành công!", { id: toastId });
                    else toast.error("Lỗi khi lưu ảnh vào Database!", { id: toastId });
                } catch (err) {
                    toast.error("Lỗi Server!", { id: toastId });
                }

                e.target.value = '';
            };
            img.onerror = () => {
                toast.error("Không thể đọc file ảnh này!", { id: toastId });
                e.target.value = '';
            };
        };
    };

    const handleDeleteBanner = async (key: string) => {
        if (!confirm("Chủ tịch có chắc chắn muốn xóa ảnh nền trang này?")) return;
        setBanners(prev => { const next = {...prev}; delete next[key]; return next; });
        await deleteBannerAction(key);
        toast.success("Đã xóa ảnh!");
    };

    return (
        <div className="p-6 md:p-10 bg-[#f8fafc] min-h-screen animate-in fade-in duration-500 pb-20">
            
            <div className="max-w-[1300px] mx-auto mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <div className="flex items-center gap-1.5 text-[11px] font-medium text-slate-400 mb-2">
                        <span>Apps</span>
                        <ChevronRight size={10} className="text-slate-300" />
                        <span>Quản lý trang web</span>
                        <ChevronRight size={10} className="text-slate-300" />
                        <span className="italic text-slate-600">Cấu hình website</span>
                    </div>
                    <h1 className="text-2xl md:text-3xl font-black text-[#1e293b] uppercase tracking-tighter leading-none">
                        CẤU HÌNH WEBSITE
                    </h1>
                </div>
                
                <button 
                    onClick={handleSaveInfo} 
                    disabled={isLoadingInfo} 
                    className={`px-6 py-3.5 rounded-xl font-black uppercase tracking-[0.15em] text-[11px] transition-all shadow-md flex items-center gap-2.5 active:scale-95 ${isInfoSaved ? 'bg-emerald-500 text-white' : 'bg-gradient-to-r from-orange-500 to-orange-600 hover:shadow-orange-300 hover:-translate-y-0.5 text-white'}`}
                >
                    {isLoadingInfo ? <RefreshCw className="animate-spin" size={16}/> : isInfoSaved ? <CheckCircle size={16}/> : <Save size={16}/>}
                    {isInfoSaved ? "Đã Lưu Thông Tin" : "Lưu Thay Đổi & Cập Nhật Web"}
                </button>
            </div>

            <div className="max-w-[1300px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
                
                <div className="lg:col-span-4 flex flex-col gap-6">
                    <div className="bg-white rounded-[1.5rem] p-6 shadow-sm border border-slate-200">
                        <div className="flex items-center justify-between mb-5">
                            <h2 className="text-[10px] font-black uppercase text-indigo-600 flex items-center gap-2 tracking-widest">
                                <ImageIcon size={14} /> Logo thương hiệu
                            </h2>
                            {imagePreview && (
                                <button onClick={async () => { if(confirm("Xóa logo?")) { await deleteSiteLogoAction(); router.refresh(); }}} className="text-slate-300 hover:text-red-500 transition-colors"><Trash2 size={14} /></button>
                            )}
                        </div>
                        <div className="w-full aspect-video bg-[#0f172a] rounded-xl flex items-center justify-center mb-5 relative group cursor-pointer border border-slate-100 shadow-inner overflow-hidden">
                            {imagePreview ? <img src={imagePreview} className="h-10 object-contain drop-shadow-lg" alt="Preview" /> : <ImageIcon size={32} className="text-white/5" />}
                            <input type="file" accept="image/*" onChange={handleFileChange} className="absolute inset-0 opacity-0 cursor-pointer z-10" />
                        </div>
                        <button onClick={handleSaveLogo} disabled={isLoadingLogo || !logoUrl} className={`w-full py-3 rounded-lg font-bold uppercase text-[10px] flex items-center justify-center gap-2 transition-all ${isLogoSaved ? 'bg-emerald-500' : 'bg-slate-900 hover:bg-indigo-600'} text-white shadow-sm`}>
                            {isLoadingLogo ? <RefreshCw className="animate-spin" size={14}/> : isLogoSaved ? <CheckCircle size={14}/> : <Save size={14}/>}
                            {isLogoSaved ? "Đã cập nhật" : "Lưu logo riêng"}
                        </button>
                    </div>

                    <div className="bg-white rounded-[1.5rem] p-6 shadow-sm border border-slate-200 flex-1">
                        <div className="flex items-center gap-3 text-teal-600 mb-6 border-b border-slate-50 pb-4">
                            <div className="p-2.5 bg-teal-50 rounded-xl"><Share2 size={20} /></div>
                            <h2 className="text-sm font-black uppercase tracking-widest">Mạng xã hội</h2>
                        </div>
                        <div className="grid grid-cols-1 gap-5">
                            <div className="relative"><MessageCircle size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-500" /><input value={companyInfo.zaloUrl} onChange={e => setCompanyInfo({...companyInfo, zaloUrl: e.target.value})} placeholder="Link Zalo..." className="w-full pl-10 pr-3 py-3 bg-slate-50 border border-slate-100 rounded-xl text-xs font-medium outline-none focus:ring-2 focus:ring-blue-500/10 transition-all shadow-inner" /></div>
                            <div className="relative"><Globe size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-green-500" /><input value={companyInfo.whatsappUrl} onChange={e => setCompanyInfo({...companyInfo, whatsappUrl: e.target.value})} placeholder="Link Whatsapp..." className="w-full pl-10 pr-3 py-3 bg-slate-50 border border-slate-100 rounded-xl text-xs font-medium outline-none focus:ring-2 focus:ring-green-500/10 transition-all shadow-inner" /></div>
                            <div className="relative"><Send size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-sky-500" /><input value={companyInfo.telegramUrl} onChange={e => setCompanyInfo({...companyInfo, telegramUrl: e.target.value})} placeholder="Link Telegram..." className="w-full pl-10 pr-3 py-3 bg-slate-50 border border-slate-100 rounded-xl text-xs font-medium outline-none focus:ring-2 focus:ring-sky-500/10 transition-all shadow-inner" /></div>
                        </div>
                        <button 
                            onClick={handleTestTele}
                            disabled={isTestingTele}
                            className="w-full mt-6 py-3 bg-sky-50 text-sky-600 rounded-xl text-[10px] font-black uppercase tracking-widest border border-sky-100 hover:bg-sky-100 transition-all flex items-center justify-center gap-2"
                        >
                            {isTestingTele ? <RefreshCw size={14} className="animate-spin" /> : <Send size={14} />}
                            {isTestingTele ? "Đang kiểm tra..." : "Test thử Telegram"}
                        </button>
                    </div>
                </div>

                <div className="lg:col-span-8 flex flex-col gap-6 h-full">
                    <div className="bg-white rounded-[1.5rem] p-8 shadow-sm border border-slate-200">
                        <div className="flex items-center justify-between mb-8 border-b border-slate-50 pb-5">
                            <div className="flex items-center gap-3 text-orange-600">
                                <div className="p-2.5 bg-orange-50 rounded-xl"><Phone size={20} /></div>
                                <h2 className="text-sm font-black uppercase tracking-widest">Thông tin liên hệ</h2>
                            </div>
                            <button onClick={async () => { if(confirm("Xóa trắng?")) { await clearCompanyInfoAction(); router.refresh(); }}} className="text-[9px] font-black uppercase text-red-500 bg-red-50 px-3 py-1.5 rounded-lg hover:bg-red-500 hover:text-white transition-all">Xóa trắng</button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Hotline tư vấn</label>
                                <input value={companyInfo.hotline} onChange={e => setCompanyInfo({...companyInfo, hotline: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-semibold text-slate-700 outline-none focus:border-orange-500 focus:bg-white transition-all shadow-inner" />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Email doanh nghiệp</label>
                                <input value={companyInfo.email} onChange={e => setCompanyInfo({...companyInfo, email: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-semibold text-slate-700 outline-none focus:border-blue-500 focus:bg-white transition-all shadow-inner" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-[1.5rem] p-8 shadow-sm border border-slate-200 flex-1 flex flex-col">
                        <div className="flex items-center gap-3 text-premium-red drop-shadow-md mb-8 border-b border-slate-50 pb-5">
                            <div className="p-2.5 bg-red-50 rounded-xl"><MapPin size={20} /></div>
                            <h2 className="text-sm font-black uppercase tracking-widest">Địa chỉ hoạt động</h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 flex-1">
                            <div className="space-y-2 flex flex-col">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Văn phòng chính</label>
                                <textarea value={companyInfo.officeAddress} onChange={e => setCompanyInfo({...companyInfo, officeAddress: e.target.value})} className="flex-1 w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-medium text-slate-700 outline-none focus:border-red-500 focus:bg-white transition-all shadow-inner leading-relaxed resize-none min-h-[100px]" />
                            </div>
                            <div className="space-y-2 flex flex-col">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Nhà máy / Kho xưởng</label>
                                <textarea value={companyInfo.factoryAddress} onChange={e => setCompanyInfo({...companyInfo, factoryAddress: e.target.value})} className="flex-1 w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-medium text-slate-700 outline-none focus:border-red-500 focus:bg-white transition-all shadow-inner leading-relaxed resize-none min-h-[100px]" />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-12 mt-4">
                    <div className="bg-white rounded-[1.5rem] p-8 shadow-sm border border-slate-200">
                        <div className="flex items-center gap-3 mb-8 border-b border-slate-50 pb-5 text-indigo-600">
                            <div className="p-2.5 bg-indigo-50 rounded-xl"><LayoutTemplate size={20} /></div>
                            <h2 className="text-sm font-black uppercase tracking-widest">Quản Lý Ảnh Bìa Các Trang (Banners)</h2>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                            {bannerConfig.map((config) => (
                                <div key={config.key} className="border border-slate-100 rounded-2xl p-5 bg-slate-50 hover:border-indigo-200 hover:shadow-md transition-all group">
                                    <div className="flex items-center justify-between mb-4">
                                        <div>
                                            <h3 className="text-sm font-black uppercase text-slate-800 tracking-tight">{config.name}</h3>
                                            <p className="text-[10px] font-bold text-slate-500 tracking-widest mt-0.5">{config.desc}</p>
                                        </div>
                                        {banners[config.key] && (
                                            <button onClick={() => handleDeleteBanner(config.key)} className="w-8 h-8 flex items-center justify-center rounded-lg bg-white text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all shadow-sm border border-slate-100">
                                                <Trash2 size={14}/>
                                            </button>
                                        )}
                                    </div>
                                    <div className="w-full h-40 bg-white rounded-xl relative overflow-hidden flex items-center justify-center border border-slate-200 shadow-inner group-hover:border-indigo-300 cursor-pointer transition-colors">
                                        {banners[config.key] ? (
                                            <img src={banners[config.key]} alt={config.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                        ) : (
                                            <div className="flex flex-col items-center text-slate-400 gap-2">
                                                <UploadCloud size={28} className="group-hover:text-indigo-500 transition-colors" />
                                                <span className="text-[10px] font-black uppercase tracking-widest group-hover:text-indigo-500 transition-colors">Tải ảnh lên</span>
                                            </div>
                                        )}
                                        <input type="file" accept="image/*" onChange={(e) => handleBannerFile(e, config.key)} className="absolute inset-0 opacity-0 cursor-pointer z-10" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
