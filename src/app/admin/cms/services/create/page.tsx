// 📍 File: src/app/admin/cms/services/create/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CloudUpload, Box, Tag, FileText, Save, Trash2 } from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";

// 🚀 GỌI ĐÚNG HÀM CỦA DỊCH VỤ
// @ts-ignore
import { upsertServiceAction } from "@/actions/services";

export default function CreateServicePage() {
    const router = useRouter();
    useEffect(() => { router.replace("/admin/cms/services"); }, [router]);
    if (typeof window !== "undefined") return null;
    const [loading, setLoading] = useState(false);
    const [imagePreview, setImagePreview] = useState<string | null>(null);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) setImagePreview(URL.createObjectURL(file));
    };

    const handleRemoveImage = () => {
        setImagePreview(null);
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        const formData = new FormData(e.currentTarget);

        const result = await upsertServiceAction(formData as any);
        if (result?.error) {
            toast.error(result.error);
        } else {
            toast.success("Thêm dịch vụ thành công!");
            router.push("/admin/cms/services");
            router.refresh();
        }
        setLoading(false);
    };

    return (
        <div className="w-full bg-white font-sans text-slate-600 animate-in fade-in duration-500 pb-10 px-4">
            {/* HEADER LAYOUT (LIKE IMAGE 1) */}
            <div className="pt-6 pb-4 flex justify-between items-center border-b border-slate-50 mb-4">
                <div className="flex items-center gap-3">
                    <h1 className="text-[18px] font-black text-[#1e293b] tracking-tighter leading-none uppercase">THÊM DỊCH VỤ MỚI</h1>
                    <span className="bg-indigo-50 text-indigo-600 text-[9px] font-black px-2 py-0.5 rounded shadow-sm">NEW</span>
                </div>
                <div className="flex items-center gap-2">
                    <Link href="/admin/cms/services" className="bg-white border border-slate-200 text-slate-500 hover:bg-slate-50 px-4 py-2 rounded-lg font-bold text-[11px] shadow-sm uppercase tracking-tight transition-all">Hủy Bỏ</Link>
                    <button onClick={() => (document.getElementById('create-svc-form') as HTMLFormElement).requestSubmit()} disabled={loading} className="bg-indigo-600 text-white hover:bg-indigo-700 px-6 py-2 rounded-lg font-black text-[11px] shadow-lg shadow-indigo-500/10 flex items-center gap-2 disabled:opacity-50 uppercase tracking-widest transition-all">
                        <Save size={14} />{loading ? "ĐANG XỬ LÝ..." : "LƯU DỊCH VỤ"}
                    </button>
                </div>
            </div>

            <form id="create-svc-form" onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">
                    
                    {/* LEFT SECTION */}
                    <div className="xl:col-span-8">
                        <div className="bg-white border border-slate-100 rounded-xl shadow-sm p-6 h-full">
                            <div className="flex items-center gap-2 mb-6 border-b border-slate-50 pb-2">
                                <Box size={14} className="text-indigo-500" />
                                <h2 className="text-[11px] font-black text-slate-800 uppercase tracking-widest">Nội dung dịch vụ (VN & EN)</h2>
                            </div>
                            
                            <div className="space-y-6">
                                {/* 1. TIÊU ĐỀ */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="text-[10px] font-black uppercase text-slate-400 block mb-1.5 tracking-wider">Tên dịch vụ (VN) <span className="text-red-500">*</span></label>
                                        <input name="title_vi" required placeholder="Nhập tên dịch vụ..." className="w-full px-4 py-2.5 bg-[#f8fafc] border border-slate-200 rounded-lg font-bold text-[14px] text-slate-800 outline-none focus:border-indigo-500 shadow-inner" />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-black uppercase text-slate-400 block mb-1.5 tracking-wider">Service Name (EN)</label>
                                        <input name="title_en" placeholder="English name..." className="w-full px-4 py-2.5 bg-[#f8fafc] border border-slate-200 rounded-lg font-bold text-[14px] text-slate-800 outline-none focus:border-indigo-500 shadow-inner" />
                                    </div>
                                </div>

                                {/* 2. MÔ TẢ DỊCH VỤ */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="text-[10px] font-black uppercase text-slate-400 block mb-1.5 tracking-wider">Mô tả dịch vụ (VN) <span className="text-red-500">*</span></label>
                                        <textarea name="desc_vi" required rows={5} placeholder="Mô tả ngắn gọn về dịch vụ..." className="w-full px-4 py-3 bg-[#f8fafc] border border-slate-200 rounded-lg font-medium text-[13px] outline-none focus:border-indigo-500 resize-none shadow-inner custom-scrollbar" />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-black uppercase text-slate-400 block mb-1.5 tracking-wider">Mô tả dịch vụ (EN)</label>
                                        <textarea name="desc_en" rows={5} placeholder="Short service description in English..." className="w-full px-4 py-3 bg-[#f8fafc] border border-slate-200 rounded-lg font-medium text-[13px] outline-none focus:border-indigo-500 resize-none shadow-inner custom-scrollbar" />
                                    </div>
                                </div>

                                {/* 3. NỘI DUNG CHI TIẾT */}
                                {false && <div className="pt-6 border-t border-slate-50">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <div className="flex items-center gap-2 mb-4">
                                                <FileText size={14} className="text-indigo-500" />
                                                <h2 className="text-[11px] font-black text-slate-800 uppercase tracking-widest">Nội dung chi tiết (VN)</h2>
                                            </div>
                                            <textarea name="desc_vi" required placeholder="Nhập mô tả chi tiết..." className="w-full h-[400px] px-6 py-6 bg-[#fcfdfe] rounded-xl border border-slate-100 font-medium text-[15px] text-slate-800 outline-none custom-scrollbar leading-relaxed resize-none" />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2 mb-4">
                                                <FileText size={14} className="text-indigo-500" />
                                                <h2 className="text-[11px] font-black text-slate-800 uppercase tracking-widest">Detailed Content (EN)</h2>
                                            </div>
                                            <textarea name="desc_en" placeholder="English description..." className="w-full h-[400px] px-6 py-6 bg-[#fcfdfe] rounded-xl border border-slate-100 font-medium text-[15px] text-slate-800 outline-none custom-scrollbar leading-relaxed resize-none" />
                                        </div>
                                    </div>
                                </div>}
                            </div>
                        </div>
                    </div>

                    {/* RIGHT SECTION */}
                    <div className="xl:col-span-4 space-y-4">
                        <div className="bg-white border border-slate-100 rounded-xl shadow-sm p-6 flex flex-col">
                            <div className="flex items-center gap-2 mb-6 border-b border-slate-50 pb-2">
                                <Tag size={14} className="text-indigo-500" />
                                <h2 className="text-[11px] font-black text-slate-800 uppercase tracking-widest">Phân Loại & Ảnh</h2>
                            </div>
                            <div className="space-y-4 mb-4">
                                <div>
                                    <label className="text-[9px] font-black uppercase text-slate-400 block mb-1">Phân loại</label>
                                    <select name="category" className="w-full px-3 py-2 bg-[#f8fafc] border border-slate-200 rounded-lg font-bold text-[12px] outline-none cursor-pointer shadow-sm">
                                        <option value="DỊCH VỤ">Dịch vụ</option>
                                        <option value="BẢO TRÌ SỬA CHỮA">Bảo Trì Sửa Chữa</option>
                                        <option value="THIẾT KẾ THI CÔNG">Thiết Kế Thi Công</option>
                                        <option value="CUNG CẤP THIẾT BỊ">Cung Cấp Thiết Bị</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-[9px] font-black uppercase text-slate-400 block mb-1">Trạng thái</label>
                                    <select name="status" className="w-full px-3 py-2 bg-[#f8fafc] border border-slate-200 rounded-lg font-bold text-[12px] outline-none cursor-pointer shadow-sm">
                                        <option value="HIỂN THỊ">Hoạt động</option>
                                        <option value="ẨN">Đã ẩn</option>
                                    </select>
                                </div>
                            </div>

                            <div className="relative group">
                                <label className="relative flex flex-col items-center justify-center w-full h-[140px] bg-[#f8fafc] border-2 border-dashed border-slate-200 rounded-xl cursor-pointer overflow-hidden shadow-inner transition-all hover:border-indigo-400">
                                    {imagePreview ? (
                                        <img src={imagePreview} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="text-center">
                                            <CloudUpload size={24} className="text-slate-300 mx-auto group-hover:text-indigo-500" />
                                            <p className="text-[8px] text-slate-400 font-bold uppercase mt-1">Tải ảnh lên</p>
                                        </div>
                                    )}
                                    <input type="file" name="image_file" className="hidden" onChange={handleImageChange} />
                                </label>
                                {imagePreview && (
                                    <button type="button" onClick={handleRemoveImage} className="absolute -top-2 -right-2 w-7 h-7 bg-red-500 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-red-600 transition-all z-10">
                                        <Trash2 size={14} />
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>


                </div>
            </form>
        </div>
    );
}
