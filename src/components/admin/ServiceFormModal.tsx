// src/components/admin/ServiceFormModal.tsx
"use client";

import { useState, useEffect } from "react";
import { Plus, Edit, X, Save, Image as ImageIcon, Globe } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion"; // Đảm bảo đã cài framer-motion
import { upsertServiceAction } from "@/actions/services";

export default function ServiceFormModal({ 
    editData, 
    defaultCategory = "DỊCH VỤ" 
}: { 
    editData?: any, 
    defaultCategory?: string 
}) {
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [previewUrl, setPreviewUrl] = useState(editData?.imageUrl || "");

    useEffect(() => {
        if (editData?.imageUrl) setPreviewUrl(editData.imageUrl);
    }, [editData]);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        try {
            const formData = new FormData(e.currentTarget);
            const res = await upsertServiceAction(formData) as any; // Ép kiểu any để hết báo đỏ .message
            
            if (res?.success) {
                setIsOpen(false);
            } else {
                alert(res?.message || "Có lỗi xảy ra");
            }
        } catch (error) {
            alert("Lỗi kết nối server");
        } finally {
            setLoading(false);
        }
    };

    const isVideo = (url: string) => {
        if (!url) return false;
        return url.match(/\.(mp4|webm|ogg)$/i);
    };

    return (
        <>
            <button 
                onClick={() => setIsOpen(true)} 
                className={editData 
                    ? "p-2 text-slate-400 hover:text-premium-red drop-shadow-md hover:bg-red-50 rounded-xl transition-all" 
                    : "flex items-center gap-2 px-6 py-3 bg-premium-red text-white rounded-2xl font-black uppercase text-[11px] tracking-widest hover:bg-black shadow-lg transition-all"
                }
            >
                {editData ? <Edit size={18} /> : <><Plus size={18} /> THÊM {defaultCategory}</>}
            </button>

            <AnimatePresence>
                {isOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white w-full max-w-4xl rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col md:flex-row h-fit max-h-[90vh]"
                        >
                            <form onSubmit={handleSubmit} className="flex flex-col md:flex-row w-full">
                                {/* CỘT TRÁI: PREVIEW */}
                                <div className="w-full md:w-2/5 bg-slate-50 border-r border-slate-100 p-8 flex flex-col items-center justify-center gap-4">
                                    <div className="w-full aspect-[4/3] rounded-[2rem] overflow-hidden bg-white shadow-inner flex items-center justify-center border-2 border-dashed border-slate-200">
                                        {previewUrl ? (
                                            isVideo(previewUrl) ? (
                                                <video src={previewUrl} autoPlay muted loop className="w-full h-full object-cover" />
                                            ) : (
                                                <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                                            )
                                        ) : (
                                            <div className="text-center p-6">
                                                <ImageIcon size={40} className="mx-auto text-slate-200 mb-2" />
                                                <p className="text-[10px] text-slate-400 font-bold uppercase">Chưa có ảnh/video</p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* CỘT PHẢI: FORM */}
                                <div className="w-full md:w-3/5 p-8 flex flex-col">
                                    <div className="flex justify-between items-center mb-6">
                                        <h2 className="text-xl font-black uppercase text-slate-900">
                                            {editData ? "Cập nhật" : "Tạo mới"}
                                        </h2>
                                        <button type="button" onClick={() => setIsOpen(false)} className="p-2 hover:bg-slate-100 rounded-full">
                                            <X size={20} />
                                        </button>
                                    </div>

                                    <div className="space-y-4 overflow-y-auto max-h-[50vh] pr-2">
                                        {editData && <input type="hidden" name="id" value={editData.id} />}
                                        <input type="hidden" name="category" value={editData?.category || defaultCategory} />

                                        <div>
                                            <label className="text-[10px] font-black uppercase text-slate-400 block mb-1">Tiêu đề (VN)</label>
                                            <input name="title_vi" defaultValue={editData?.title_vi} required className="w-full px-4 py-2 bg-slate-50 rounded-xl font-bold text-sm" />
                                        </div>

                                        <div>
                                            <label className="text-[10px] font-black uppercase text-slate-400 block mb-1">URL Hình ảnh / Video</label>
                                            <input 
                                                name="imageUrl" 
                                                defaultValue={editData?.imageUrl}
                                                onChange={(e) => setPreviewUrl(e.target.value)}
                                                placeholder="/images/example.jpg" 
                                                className="w-full px-4 py-2 bg-slate-50 rounded-xl text-xs" 
                                            />
                                        </div>

                                        <div>
                                            <label className="text-[10px] font-black uppercase text-slate-400 block mb-1">Mô tả (VN)</label>
                                            <textarea name="desc_vi" defaultValue={editData?.desc_vi} rows={3} className="w-full px-4 py-2 bg-slate-50 rounded-xl text-sm" />
                                        </div>
                                    </div>

                                    <div className="mt-8 flex justify-end">
                                        <button 
                                            type="submit" 
                                            disabled={loading} 
                                            className="flex items-center gap-2 px-8 py-3 bg-slate-900 text-white rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-premium-red transition-all"
                                        >
                                            {loading ? "ĐANG LƯU..." : "LƯU DỮ LIỆU"}
                                        </button>
                                    </div>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </>
    );
}