// 📍 File: src/app/admin/cms/products/edit/[id]/EditProductClient.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CloudUpload, Box, Tag, Save, Trash2, Loader2 } from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";
import { updateProduct } from "@/actions/product";
import { useAdminSettings } from "@/context/AdminSettingsContext";
import GalleryManager from "@/components/admin/GalleryManager";

export default function EditProductClient({ productData }: { productData: any }) {
    const { t, language } = useAdminSettings();
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    
    // Get initial category details safely
    const [catIndustry, catNature] = (productData?.category || "").includes(":") 
        ? productData.category.split(":") 
        : [productData?.category || "THIET_BI_FB", "BOM_THUC_PHAM"];

    const [imagePreview, setImagePreview] = useState<string | null>(productData?.imageUrl || null);
    const [galleryPreviews, setGalleryPreviews] = useState<string[]>(() => {
        try {
            return productData?.gallery ? JSON.parse(productData.gallery) : [];
        } catch {
            return [];
        }
    });

    // Form inputs state tracking for dynamic Sync Status Card
    const [name, setName] = useState(productData?.title_vi || "");
    const [nameEn, setNameEn] = useState(productData?.title_en || "");
    const [summary, setSummary] = useState(productData?.summary || "");
    const [summaryEn, setSummaryEn] = useState(productData?.summary_en || "");
    const [description, setDescription] = useState(productData?.desc_vi || "");
    const [descriptionEn, setDescriptionEn] = useState(productData?.desc_en || "");
    const [price, setPrice] = useState(productData?.price || "");
    const [supplier, setSupplier] = useState(productData?.supplier || "");
    const [industry, setIndustry] = useState(catIndustry);
    const [nature, setNature] = useState(catNature);
    const [status, setStatus] = useState(productData?.status || "PUBLISHED");
    const [isDirty, setIsDirty] = useState(false);
    const [isSaved, setIsSaved] = useState(false);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const formElement = document.getElementById('edit-p-form') as HTMLFormElement;
            const formData = new FormData(formElement);
            formData.append("id", productData.id.toString());
            formData.append("category", `${industry}:${nature}`);

            const res = await updateProduct(formData);
            if (res.success) { 
                setIsSaved(true);
                setIsDirty(false);
                toast.success(language === 'en' ? "Product updated successfully!" : "Cập nhật thành công!"); 
                router.push("/admin/cms/products"); 
                router.refresh(); 
            } else {
                toast.error(res.error || (language === 'en' ? "Update failed!" : "Lỗi cập nhật!"));
            }
        } catch (error) {
            toast.error(language === 'en' ? "Connection to server lost!" : "Mất kết nối với máy chủ!");
        }
        setLoading(false);
    };

    const renderSubcategoryOptions = () => {
        if (industry === "THIET_BI_FB") {
            return (
                <>
                    <option value="BOM_THUC_PHAM">{language === 'en' ? 'Food Pumps' : 'Bơm thực phẩm'}</option>
                    <option value="VAN_VI_SINH">{language === 'en' ? 'Sanitary Valves' : 'Van vi sinh'}</option>
                    <option value="BON_CHUA">{language === 'en' ? 'Storage Tanks' : 'Bồn chứa'}</option>
                    <option value="DUONG_ONG_INOX">{language === 'en' ? 'Stainless Steel Pipes' : 'Đường ống inox'}</option>
                    <option value="MAY_CHIET_ROT">{language === 'en' ? 'Filling Machines' : 'Máy chiết rót'}</option>
                </>
            );
        }
        if (industry === "THIET_BI_CAU") {
            return (
                <>
                    <option value="CAU_TRUC">{language === 'en' ? 'Overhead Crane' : 'Cẩu trục'}</option>
                    <option value="PALANG">{language === 'en' ? 'Hoist' : 'Palang'}</option>
                    <option value="RAY_DIEN">{language === 'en' ? 'Conductor Rails' : 'Ray điện'}</option>
                    <option value="TOI_NANG">{language === 'en' ? 'Winches' : 'Tời nâng'}</option>
                    <option value="BIEN_TAN">{language === 'en' ? 'Inverters' : 'Biến tần'}</option>
                </>
            );
        }
        if (industry === "THIET_BI_NANG_HA") {
            return (
                <>
                    <option value="XE_NANG_TAY">{language === 'en' ? 'Hand Pallet Trucks' : 'Xe nâng tay'}</option>
                    <option value="XE_NANG_DIEN">{language === 'en' ? 'Electric Forklifts' : 'Xe nâng điện'}</option>
                    <option value="BAN_NANG">{language === 'en' ? 'Lift Tables' : 'Bàn nâng'}</option>
                    <option value="DOCK_LEVELER">{language === 'en' ? 'Dock Levelers' : 'Dock leveler'}</option>
                    <option value="LIFT_TABLE">{language === 'en' ? 'Lift Tables (High)' : 'Lift table'}</option>
                </>
            );
        }
        if (industry === "LINH_KIEN_PHU_KIEN") {
            return (
                <>
                    <option value="MOTOR">{language === 'en' ? 'Motors' : 'Motor'}</option>
                    <option value="PLC">{language === 'en' ? 'PLCs' : 'PLC'}</option>
                    <option value="CAM_BIEN">{language === 'en' ? 'Sensors' : 'Cảm biến'}</option>
                    <option value="BAC_DAN">{language === 'en' ? 'Bearings' : 'Bạc đạn'}</option>
                    <option value="DAY_CAP">{language === 'en' ? 'Cables' : 'Dây cáp'}</option>
                </>
            );
        }
        return null;
    };

    const renderHorizontalStatusBar = () => {
        const isPublic = status === "PUBLISHED";
        const publicText = isPublic 
            ? (language === 'en' ? "Will display" : "Sẽ hiển thị") 
            : (language === 'en' ? "Hidden" : "Ẩn");
        const publicColor = isPublic ? "text-emerald-600 dark:text-emerald-400" : "text-slate-400 dark:text-slate-500";

        const viComplete = name.trim().length > 0 && description.trim().length > 0;
        const enComplete = nameEn.trim().length > 0 && descriptionEn.trim().length > 0;
        let langText = "";
        let langColor = "";
        if (viComplete && enComplete) {
            langText = language === 'en' ? "Full bilingual" : "Song ngữ đầy đủ";
            langColor = "text-emerald-600 dark:text-emerald-400";
        } else if (viComplete) {
            langText = language === 'en' ? "EN missing" : "Thiếu tiếng Anh";
            langColor = "text-amber-500 dark:text-amber-400";
        } else {
            langText = language === 'en' ? "Missing details" : "Thiếu thông tin";
            langColor = "text-red-500 dark:text-red-400";
        }

        const hasImage = !!imagePreview;
        const imageText = hasImage 
            ? (language === 'en' ? "Attached" : "Đã có") 
            : (language === 'en' ? "Not attached" : "Chưa có");
        const imageColor = hasImage ? "text-emerald-600 dark:text-emerald-400" : "text-amber-500 dark:text-amber-400";

        let priceText = "";
        let priceColor = "";
        if (!price || price.trim() === "" || price.toLowerCase() === "contact" || price.toLowerCase() === "liên hệ") {
            priceText = language === 'en' ? "Quote/Contact" : "Liên hệ";
            priceColor = "text-amber-500 dark:text-amber-400";
        } else if (price.toUpperCase() === "HIDDEN" || price.toUpperCase() === "AN_GIA" || price.toLowerCase() === "ẩn giá" || price.toLowerCase() === "ẩn") {
            priceText = language === 'en' ? "Hidden" : "Ẩn giá";
            priceColor = "text-blue-500 dark:text-blue-400";
        } else {
            priceText = language === 'en' ? "Entered" : "Đã nhập";
            priceColor = "text-emerald-600 dark:text-emerald-400";
        }

        let dbText = "";
        let dbColor = "";
        if (!name || name.trim() === "") {
            dbText = language === 'en' ? "Enter product name" : "Thiếu tên sản phẩm";
            dbColor = "text-red-500 dark:text-red-400 font-bold";
        } else if (isDirty) {
            dbText = language === 'en' ? "Unsaved changes" : "Có thay đổi chưa lưu";
            dbColor = "text-amber-500 dark:text-amber-400 font-bold";
        } else if (isSaved) {
            dbText = language === 'en' ? "Saved successfully" : "Đã lưu thành công";
            dbColor = "text-emerald-600 dark:text-emerald-400 font-bold";
        } else {
            dbText = language === 'en' ? "Ready to save" : "Sẵn sàng lưu";
            dbColor = "text-indigo-500 dark:text-indigo-400 font-bold";
        }

        return (
            <div className="mt-3 h-10 shrink-0 overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-0 flex items-center shadow-sm transition-colors w-full select-none">
                <div className="flex items-center gap-x-6 text-[11px] text-slate-500 dark:text-slate-400 w-full overflow-hidden whitespace-nowrap">
                    <div className="flex items-center gap-1.5 font-bold text-slate-800 dark:text-slate-200 shrink-0">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                        </span>
                        <span>{language === 'en' ? "DISPLAY STATUS" : "TRẠNG THÁI HIỂN THỊ"}</span>
                    </div>

                    <div className="hidden sm:block h-3 w-px bg-slate-200 dark:bg-slate-800 shrink-0" />

                    <div className="shrink-0">
                        <span>Public Page: </span>
                        <span className={`font-semibold ${publicColor}`}>{publicText}</span>
                    </div>

                    <div className="hidden sm:block h-3 w-px bg-slate-200 dark:bg-slate-800 shrink-0" />

                    <div className="shrink-0">
                        <span>{language === 'en' ? "Bilingual" : "Song ngữ"}: </span>
                        <span className={`font-semibold ${langColor}`}>{langText}</span>
                    </div>

                    <div className="hidden sm:block h-3 w-px bg-slate-200 dark:bg-slate-800 shrink-0" />

                    <div className="shrink-0">
                        <span>{language === 'en' ? "Cover Image" : "Ảnh bìa"}: </span>
                        <span className={`font-semibold ${imageColor}`}>{imageText}</span>
                    </div>

                    <div className="hidden sm:block h-3 w-px bg-slate-200 dark:bg-slate-800 shrink-0" />

                    <div className="shrink-0">
                        <span>{language === 'en' ? "Price" : "Giá bán"}: </span>
                        <span className={`font-semibold ${priceColor}`}>{priceText}</span>
                    </div>

                    <div className="hidden sm:block h-3 w-px bg-slate-200 dark:bg-slate-800 shrink-0" />

                    <div className="shrink-0">
                        <span>{language === 'en' ? "Data" : "Dữ liệu"}: </span>
                        <span className={`font-semibold ${dbColor}`}>{dbText}</span>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="h-full w-full overflow-hidden bg-slate-50 dark:bg-slate-950">
            <div className="mx-auto flex h-full max-w-[1500px] flex-col px-5 pt-3 pb-8 overflow-hidden">
                
                {/* Clean Top Action Header Bar */}
                <div className="flex h-[72px] shrink-0 items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div>
                            <div className="flex items-center gap-2">
                                <h1 className="text-xl font-bold text-slate-900 dark:text-white uppercase tracking-tight">
                                    {language === 'en' ? 'EDIT PRODUCT' : 'CHỈNH SỬA SẢN PHẨM'}
                                </h1>
                                <span className="bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-[9px] font-bold px-1.5 py-0.5 rounded shadow-sm">ID: #{productData?.id}</span>
                            </div>
                            <p className="text-xs text-slate-450 dark:text-slate-400">
                                {language === 'en' ? 'Modify this bilingual industrial catalog entry' : 'Chỉnh sửa mục sản phẩm kỹ thuật song ngữ'}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                        <Link href="/admin/cms/products" className="flex-1 sm:flex-none text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 px-4 py-2 rounded-lg font-semibold text-[12px] shadow-sm uppercase tracking-tight transition-all">
                            {language === 'en' ? 'Cancel' : 'Hủy Bỏ'}
                        </Link>
                        <button onClick={handleSave} disabled={loading} className="flex-1 sm:flex-none bg-indigo-600 text-white hover:bg-indigo-700 dark:bg-indigo-650 dark:hover:bg-indigo-700 px-5 py-2 rounded-lg font-bold text-[12px] shadow-md flex items-center justify-center gap-2 disabled:opacity-50 uppercase tracking-widest transition-all">
                            {loading ? (
                                <><Loader2 size={12} className="animate-spin" /> {language === 'en' ? 'SAVING...' : 'ĐANG LƯU...'}</>
                            ) : (
                                language === 'en' ? 'UPDATE PRODUCT' : 'CẬP NHẬT'
                            )}
                        </button>
                    </div>
                </div>

                <form id="edit-p-form" onSubmit={handleSave} className="grid flex-1 min-h-0 grid-cols-1 xl:grid-cols-[1fr_360px] gap-4 overflow-hidden">
                        
                        {/* Left Main Form Section */}
                        <div className="flex flex-col gap-4 overflow-hidden">
                            
                            {/* 1. Main Product Content (Bilingual) */}
                            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm p-4 shrink-0 transition-colors">
                                <div className="flex items-center gap-2 mb-3 border-b border-slate-100 dark:border-slate-800 pb-2">
                                    <Box size={14} className="text-indigo-500 dark:text-indigo-400" />
                                    <h2 className="text-[12px] font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                                        {language === 'en' ? 'Product Content (VN & EN)' : 'Nội dung sản phẩm (VN & EN)'}
                                    </h2>
                                </div>
                                
                                <div className="space-y-3">
                                    {/* Title inputs */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-[10px] font-bold uppercase text-slate-400 dark:text-slate-500 block mb-1 tracking-wider">
                                                {language === 'en' ? 'Product Name (VN)' : 'Tên sản phẩm (VN)'} <span className="text-red-500">*</span>
                                            </label>
                                            <input 
                                                name="name" 
                                                required 
                                                placeholder={language === 'en' ? 'Enter name...' : 'Nhập tên...'} 
                                                value={name} 
                                                onChange={(e) => { setName(e.target.value); setIsDirty(true); }}
                                                className="w-full h-11 px-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-sm text-slate-900 dark:text-slate-100 outline-none focus:border-indigo-500 dark:focus:border-indigo-650 transition-colors font-medium" 
                                            />
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-bold uppercase text-slate-400 dark:text-slate-500 block mb-1 tracking-wider">
                                                Product Name (EN)
                                            </label>
                                            <input 
                                                name="name_en" 
                                                placeholder="English name..." 
                                                value={nameEn} 
                                                onChange={(e) => { setNameEn(e.target.value); setIsDirty(true); }}
                                                className="w-full h-11 px-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-sm text-slate-900 dark:text-slate-100 outline-none focus:border-indigo-500 dark:focus:border-indigo-650 transition-colors font-medium" 
                                            />
                                        </div>
                                    </div>
 
                                    {/* Summary inputs */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-[10px] font-bold uppercase text-slate-400 dark:text-slate-500 block mb-1 tracking-wider">
                                                {language === 'en' ? 'Feature Summary (VN)' : 'Tóm tắt tính năng (VN)'}
                                            </label>
                                            <textarea
                                                name="summary"
                                                placeholder={language === 'en' ? 'Short summary...' : 'Mô tả tóm tắt tính năng...'}
                                                value={summary}
                                                onChange={(e) => { setSummary(e.target.value); setIsDirty(true); }}
                                                className="w-full h-[96px] resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:focus:ring-indigo-900/30 transition-colors custom-scrollbar"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-bold uppercase text-slate-400 dark:text-slate-500 block mb-1 tracking-wider">
                                                Feature Summary (EN)
                                            </label>
                                            <textarea
                                                name="summary_en"
                                                placeholder="English summary..."
                                                value={summaryEn}
                                                onChange={(e) => { setSummaryEn(e.target.value); setIsDirty(true); }}
                                                className="w-full h-[96px] resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:focus:ring-indigo-900/30 transition-colors custom-scrollbar"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
 
                            {/* 2. Detailed Technical Specifications */}
                            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm flex-1 min-h-0 p-4 flex flex-col overflow-hidden transition-colors">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1 min-h-0 overflow-hidden">
                                    <div className="flex flex-col h-full min-h-0">
                                        <label className="text-[10px] font-bold uppercase text-slate-400 dark:text-slate-500 block mb-1.5 tracking-wider shrink-0">
                                            {language === 'en' ? 'Technical Specifications (VN)' : 'Thông số kỹ thuật (VN)'}
                                        </label>
                                        <textarea
                                            name="description"
                                            placeholder={language === 'en' ? 'Enter technical spec sheets...' : 'Nhập bảng thông số kỹ thuật...'}
                                            value={description}
                                            onChange={(e) => { setDescription(e.target.value); setIsDirty(true); }}
                                            className="flex-1 w-full min-h-[230px] resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:focus:ring-indigo-900/30 transition-colors custom-scrollbar"
                                        />
                                    </div>
                                    <div className="flex flex-col h-full min-h-0">
                                        <label className="text-[10px] font-bold uppercase text-slate-400 dark:text-slate-500 block mb-1.5 tracking-wider shrink-0">
                                            Technical Specifications (EN)
                                        </label>
                                        <textarea
                                            name="description_en"
                                            placeholder="English specs..."
                                            value={descriptionEn}
                                            onChange={(e) => { setDescriptionEn(e.target.value); setIsDirty(true); }}
                                            className="flex-1 w-full min-h-[230px] resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:focus:ring-indigo-900/30 transition-colors custom-scrollbar"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right Column Section (Price, Image upload) */}
                        <div className="h-full">
                            
                            {/* Price & Image Card */}
                            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm h-full p-4 flex flex-col overflow-hidden transition-colors">
                                <div className="flex items-center gap-2 mb-3 border-b border-slate-100 dark:border-slate-800 pb-2 shrink-0">
                                    <Tag size={14} className="text-indigo-500 dark:text-indigo-400" />
                                    <h2 className="text-[12px] font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                                        {language === 'en' ? 'Specifications' : 'Thông số bán hàng'}
                                    </h2>
                                </div>
                                <div className="space-y-3 mb-3 shrink-0">
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="text-[10px] font-bold uppercase text-slate-400 dark:text-slate-500 block mb-1 tracking-wider">
                                                {language === 'en' ? 'Price' : 'Giá bán'}
                                            </label>
                                            <input 
                                                name="price" 
                                                placeholder={language === 'en' ? 'Contact' : 'Liên hệ'} 
                                                value={price}
                                                onChange={(e) => { setPrice(e.target.value); setIsDirty(true); }}
                                                className="w-full h-10 px-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-sm text-slate-900 dark:text-slate-100 outline-none focus:border-indigo-500 transition-all font-bold" 
                                            />
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-bold uppercase text-slate-400 dark:text-slate-500 block mb-1 tracking-wider">
                                                {language === 'en' ? 'Brand' : 'Hãng'}
                                            </label>
                                            <input 
                                                name="supplier" 
                                                placeholder="Maintech" 
                                                value={supplier}
                                                onChange={(e) => { setSupplier(e.target.value); setIsDirty(true); }}
                                                className="w-full h-10 px-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-sm text-slate-900 dark:text-slate-100 outline-none focus:border-indigo-500 transition-colors font-medium" 
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-3">
                                        <div>
                                            <label className="text-[10px] font-bold uppercase text-slate-400 dark:text-slate-500 block mb-1 tracking-wider">
                                                {language === 'en' ? 'Category' : 'Hạng mục'}
                                            </label>
                                            <select 
                                                name="industry" 
                                                value={industry}
                                                onChange={(e) => { 
                                                    setIndustry(e.target.value); 
                                                    const firstNatureOf = {
                                                        THIET_BI_FB: "BOM_THUC_PHAM",
                                                        THIET_BI_CAU: "CAU_TRUC",
                                                        THIET_BI_NANG_HA: "XE_NANG_TAY",
                                                        LINH_KIEN_PHU_KIEN: "MOTOR"
                                                    }[e.target.value] || "XE_NANG_TAY";
                                                    setNature(firstNatureOf);
                                                    setIsDirty(true); 
                                                }}
                                                className="w-full h-10 px-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-sm text-slate-900 dark:text-slate-100 outline-none cursor-pointer focus:border-indigo-500 transition-colors font-semibold"
                                            >
                                                <option value="THIET_BI_FB">{language === 'en' ? 'F&B Equipment' : 'Thiết bị F&B'}</option>
                                                <option value="THIET_BI_CAU">{language === 'en' ? 'Crane Equipment' : 'Thiết bị cẩu'}</option>
                                                <option value="THIET_BI_NANG_HA">{language === 'en' ? 'Lifting Equipment' : 'Thiết bị nâng hạ'}</option>
                                                <option value="LINH_KIEN_PHU_KIEN">{language === 'en' ? 'Components & Accessories' : 'Linh kiện & phụ kiện'}</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-bold uppercase text-slate-400 dark:text-slate-500 block mb-1 tracking-wider">
                                                {language === 'en' ? 'Subcategory' : 'Phân nhóm'}
                                            </label>
                                            <select 
                                                name="nature" 
                                                value={nature}
                                                onChange={(e) => { setNature(e.target.value); setIsDirty(true); }}
                                                className="w-full h-10 px-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-sm text-slate-900 dark:text-slate-100 outline-none cursor-pointer focus:border-indigo-500 transition-colors font-semibold"
                                            >
                                                {renderSubcategoryOptions()}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-bold uppercase text-slate-400 dark:text-slate-500 block mb-1 tracking-wider">
                                                {language === 'en' ? 'Status' : 'Trạng thái'}
                                            </label>
                                            <select 
                                                name="status" 
                                                value={status}
                                                onChange={(e) => { setStatus(e.target.value); setIsDirty(true); }}
                                                className="w-full h-10 px-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-sm text-slate-900 dark:text-slate-100 outline-none cursor-pointer focus:border-indigo-500 transition-colors font-semibold"
                                            >
                                                <option value="PUBLISHED">{language === 'en' ? 'Active / Visible' : 'Hoạt động / Hiển thị'}</option>
                                                <option value="DRAFT">{language === 'en' ? 'Hidden' : 'Ẩn'}</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex-1 min-h-0 flex flex-col gap-3 mt-3">
                                    <div className="relative group/cover flex-1 min-h-[220px] flex flex-col">
                                        <label className="relative flex flex-col items-center justify-center w-full flex-1 min-h-[220px] bg-slate-50 dark:bg-slate-950 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl cursor-pointer hover:border-indigo-400 dark:hover:border-indigo-500 transition-all overflow-hidden shadow-inner">
                                            {imagePreview ? (
                                                <img src={imagePreview} className="w-full h-full object-cover group-hover/cover:scale-105 transition-transform duration-500" />
                                            ) : (
                                                <div className="text-center p-3">
                                                    <CloudUpload size={24} className="text-slate-300 dark:text-slate-500 mx-auto mb-2 group-hover/cover:text-indigo-500 transition-colors" />
                                                    <p className="text-[9px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">
                                                        {language === 'en' ? 'Upload Cover Image' : 'Tải ảnh bìa sản phẩm'}
                                                    </p>
                                                </div>
                                            )}
                                            <input 
                                                type="file" 
                                                name="image_file" 
                                                className="hidden" 
                                                onChange={(e) => {
                                                    if (e.target.files?.[0]) {
                                                        setImagePreview(URL.createObjectURL(e.target.files[0]));
                                                        setIsDirty(true);
                                                        const delInput = document.getElementById('image-deleted-flag') as HTMLInputElement;
                                                        if (delInput) delInput.value = "false";
                                                    }
                                                }} 
                                            />
                                        </label>
                                        {imagePreview && (
                                            <button 
                                                type="button"
                                                onClick={() => {
                                                    setImagePreview(null);
                                                    setIsDirty(true);
                                                    const delInput = document.getElementById('image-deleted-flag') as HTMLInputElement;
                                                    if (delInput) delInput.value = "true";
                                                }}
                                                className="absolute -top-2 -right-2 w-6 h-6 bg-red-600 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-red-700 transition-all z-10"
                                            >
                                                <Trash2 size={11} />
                                            </button>
                                        )}
                                        <input type="hidden" id="image-deleted-flag" name="imageDeleted" value="false" />
                                    </div>
                                    <input type="hidden" name="gallery_json" value={JSON.stringify(galleryPreviews)} />
                                    <GalleryManager 
                                        images={galleryPreviews}
                                        onChange={(urls) => { setGalleryPreviews(urls); setIsDirty(true); }}
                                        language={language === 'en' ? 'en' : 'vi'}
                                    />
                                </div>
                            </div>

                        </div>
                    </form>

                    {/* Real-time Dynamic Horizontal Status Bar Widget */}
                    {renderHorizontalStatusBar()}
                </div>
            </div>
    );
}