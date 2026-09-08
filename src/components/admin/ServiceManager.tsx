// 📍 File: src/components/admin/ServiceManager.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { GripVertical, Trash2, Edit2, X, PlusCircle, Image as ImageIcon, ChevronLeft, ChevronRight, UploadCloud, Wrench } from "lucide-react";
import { upsertServiceAction, deleteServiceAction, updateServiceOrderAction } from "@/actions/services";
import toast from "react-hot-toast";

const ITEMS_PER_PAGE = 6; // 🚀 Hiển thị 6 mục lấp đầy trang

export default function ServiceManager({ initialServices }: { initialServices: any[] }) {
    const router = useRouter();
    const [services, setServices] = useState(initialServices);
    const [editingItem, setEditingItem] = useState<any>(null); 
    const [isLoading, setIsLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(1); 
    const [imagePreview, setImagePreview] = useState<string | null>(null);

    useEffect(() => { setServices(initialServices); }, [initialServices]);

    useEffect(() => {
        setImagePreview(editingItem?.imageUrl || null);
    }, [editingItem]);

    const totalPages = Math.ceil(services.length / ITEMS_PER_PAGE) || 1;
    const currentServices = services.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) setImagePreview(URL.createObjectURL(file));
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);
        const form = e.currentTarget;
        const formData = new FormData(form);
        if (editingItem) formData.append("id", editingItem.id); 
        
        const result = await upsertServiceAction(formData as any);
        if (result?.error) {
            toast.error(result.error);
        } else {
            setEditingItem(null); 
            setImagePreview(null);
            form.reset();
            router.refresh();
            toast.success("Đã lưu dữ liệu thành công!");
        }
        setIsLoading(false);
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Chủ tịch có chắc muốn xóa dịch vụ này?")) return;
        setIsLoading(true);
        await deleteServiceAction(id);
        toast.success("Đã xóa vĩnh viễn!");
        router.refresh();
        setIsLoading(false);
    };

    // Logic kéo thả đồng bộ vị trí
    const handleDragStart = (e: React.DragEvent, index: number) => {
        e.dataTransfer.effectAllowed = "move";
        e.dataTransfer.setData("dragIndex", index.toString());
    };

    const handleDrop = async (e: React.DragEvent, relativeDropIndex: number) => {
        e.preventDefault();
        const relativeDragIndex = parseInt(e.dataTransfer.getData("dragIndex"));
        if (relativeDragIndex === relativeDropIndex) return;
        const absoluteDragIndex = (currentPage - 1) * ITEMS_PER_PAGE + relativeDragIndex;
        const absoluteDropIndex = (currentPage - 1) * ITEMS_PER_PAGE + relativeDropIndex;
        const newServices = [...services];
        const [draggedItem] = newServices.splice(absoluteDragIndex, 1);
        newServices.splice(absoluteDropIndex, 0, draggedItem);
        setServices(newServices);
        setIsLoading(true);
        await updateServiceOrderAction(newServices.map(s => s.id));
        router.refresh();
        setIsLoading(false);
    };

    return (
        <div className="flex flex-col lg:flex-row gap-5 h-full min-h-0 relative">
            
            {/* OVERLAY LOADING KHI XỬ LÝ */}
            {isLoading && (
                <div className="absolute inset-0 z-50 bg-white/60 backdrop-blur-[1px] flex items-center justify-center rounded-[2rem]">
                    <div className="bg-purple-600 text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest shadow-2xl flex items-center gap-3 animate-pulse">
                        <Wrench size={20} className="animate-spin"/> ĐANG XỬ LÝ...
                    </div>
                </div>
            )}

            {/* 🌟 CỘT TRÁI - FORM (Mô tả to, không lăn) */}
            <div className="w-full lg:w-[35%] xl:w-[30%] bg-white rounded-[2rem] border border-slate-200 shadow-md flex flex-col h-full overflow-hidden transition-all">
                <div className="p-4 border-b border-slate-100 flex items-center justify-between shrink-0 bg-slate-50/50">
                    <h2 className={`text-[11px] font-black uppercase tracking-widest flex items-center gap-2 ${editingItem ? 'text-orange-600' : 'text-purple-600'}`}>
                        {editingItem ? <><Edit2 size={16} /> Sửa Dịch Vụ</> : <><PlusCircle size={16}/> Thêm Mới</>}
                    </h2>
                    {editingItem && (
                        <button type="button" onClick={() => { setEditingItem(null); setImagePreview(null); }} className="p-1 text-slate-400 hover:text-red-500 rounded-lg">
                            <X size={18}/>
                        </button>
                    )}
                </div>

                <div className="p-5 flex-1 overflow-y-auto custom-scrollbar flex flex-col">
                    {/* 🚀 BÍ KÍP: Dùng key để reset form khi đổi Item cần sửa */}
                    <form 
                        id="service-form" 
                        key={editingItem ? editingItem.id : 'new'} 
                        onSubmit={handleSubmit} 
                        className="space-y-4 flex-1 flex flex-col min-h-0"
                    >
                        <div className="shrink-0">
                            <label className="text-[10px] font-black uppercase text-slate-400 block mb-1.5 tracking-widest ml-1">Tên dịch vụ</label>
                            <input name="title_vi" defaultValue={editingItem?.title_vi} required placeholder="Nhập tên dịch vụ..." className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-sm text-slate-800 focus:ring-2 focus:border-purple-500 outline-none transition-all" />
                        </div>
                        <div className="shrink-0">
                            <label className="text-[10px] font-black uppercase text-slate-400 block mb-1.5 tracking-widest ml-1">Service name (EN)</label>
                            <input name="title_en" defaultValue={editingItem?.title_en || ""} placeholder="Enter service name in English..." className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-sm text-slate-800 focus:ring-2 focus:border-purple-500 outline-none transition-all" />
                        </div>
                        
                        <div className="shrink-0">
                            <label className="text-[10px] font-black uppercase text-slate-400 block mb-1.5 tracking-widest ml-1">Phân loại</label>
                            <select name="category" defaultValue={editingItem?.category || "BẢO TRÌ SỬA CHỮA"} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-sm focus:ring-2 focus:border-purple-500 outline-none transition-all cursor-pointer">
                                <option value="BẢO TRÌ SỬA CHỮA">Bảo Trì Sửa Chữa</option>
                                <option value="THIẾT KẾ THI CÔNG">Thiết Kế Thi Công</option>
                                <option value="CUNG CẤP THIẾT BỊ">Cung Cấp Thiết Bị</option>
                            </select>
                        </div>

                        <div className="shrink-0">
                            <label className="text-[10px] font-black uppercase text-slate-400 block mb-1.5 tracking-widest ml-1 flex items-center gap-2"><ImageIcon size={14}/> Hình minh họa</label>
                            <label className="relative flex flex-col items-center justify-center w-full h-32 bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl hover:bg-slate-100 hover:border-purple-400 transition-all cursor-pointer overflow-hidden group">
                                {imagePreview ? (
                                    <img src={imagePreview} alt="Preview" className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity" />
                                ) : (
                                    <div className="flex flex-col items-center justify-center">
                                        <UploadCloud size={28} className="text-slate-300 mb-1" />
                                        <p className="text-[9px] text-slate-400 font-black uppercase">Chọn ảnh</p>
                                    </div>
                                )}
                                <input type="file" name="image_file" accept="image/*" className="hidden" onChange={handleImageChange} />
                                <input type="hidden" name="imageUrl" value={editingItem?.imageUrl || ""} />
                            </label>
                        </div>
                        
                        {/* 🚀 KHUNG MÔ TẢ TO RÕ, TỰ CHIẾM CHỖ CÒN LẠI */}
                        <div className="flex-1 flex flex-col min-h-0">
                            <label className="text-[10px] font-black uppercase text-slate-400 block mb-1.5 tracking-widest ml-1">Mô tả chi tiết</label>
                            <textarea name="desc_vi" defaultValue={editingItem?.desc_vi} required placeholder="Nhập nội dung mô tả..." className="w-full flex-1 px-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-medium text-sm leading-relaxed text-slate-700 focus:ring-2 focus:border-purple-500 outline-none transition-all resize-none custom-scrollbar" />
                        </div>
                        <div className="flex-1 flex flex-col min-h-0">
                            <label className="text-[10px] font-black uppercase text-slate-400 block mb-1.5 tracking-widest ml-1">Detailed description (EN)</label>
                            <textarea name="desc_en" defaultValue={editingItem?.desc_en || ""} placeholder="Enter service description in English..." className="w-full flex-1 px-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-medium text-sm leading-relaxed text-slate-700 focus:ring-2 focus:border-purple-500 outline-none transition-all resize-none custom-scrollbar" />
                        </div>
                        <input type="hidden" name="status" value="HIỂN THỊ" />
                    </form>
                </div>

                <div className="p-5 border-t border-slate-100 shrink-0 bg-slate-50/50">
                    <button form="service-form" type="submit" className={`w-full text-white py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all shadow-lg active:scale-95 ${editingItem ? 'bg-orange-500 hover:bg-orange-600 shadow-orange-500/20' : 'bg-purple-600 hover:bg-purple-700 shadow-purple-600/20'}`}>
                        {editingItem ? 'CẬP NHẬT NGAY' : 'LƯU DỊCH VỤ'}
                    </button>
                </div>
            </div>

            {/* 🌟 CỘT PHẢI - DANH SÁCH 6 MỤC (Chữ thẳng, không lăn ngoài) */}
            <div className="flex-1 flex flex-col h-full gap-4 overflow-hidden">
                <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar pr-2">
                    <div className="grid grid-cols-1 xl:grid-cols-2 grid-rows-3 gap-4 h-full">
                        {currentServices.map((svc, idx) => (
                            <div
                                key={svc.id} draggable
                                onDragStart={(e) => handleDragStart(e, idx)}
                                onDragOver={(e) => e.preventDefault()}
                                onDrop={(e) => handleDrop(e, idx)}
                                className={`flex flex-col h-full bg-white p-5 rounded-[2rem] border transition-all group ${editingItem?.id === svc.id ? 'border-orange-400 ring-4 ring-orange-50' : 'border-slate-100 shadow-sm hover:border-purple-300 cursor-grab active:cursor-grabbing'}`}
                            >
                                <div className="flex items-start justify-between gap-4 mb-2 shrink-0">
                                    <div className="flex gap-4 items-center flex-1 overflow-hidden">
                                        <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center shrink-0 border border-slate-100 overflow-hidden shadow-inner">
                                            {svc.imageUrl ? <img src={svc.imageUrl} alt="" className="w-full h-full object-cover" /> : <ImageIcon size={24} className="text-slate-200" />}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <span className="text-[9px] font-black text-purple-600 bg-purple-50 px-2.5 py-1 rounded-xl uppercase tracking-widest inline-block mb-1">{svc.category || "DỊCH VỤ"}</span>
                                            {/* 🚀 CHỮ THẲNG TẮP (Bỏ italic) */}
                                            <h4 className="font-black text-slate-900 text-sm uppercase leading-tight group-hover:text-purple-600 transition-colors line-clamp-1 tracking-tight">{svc.title_vi}</h4>
                                        </div>
                                    </div>
                                    <div className="p-1.5 text-slate-200 group-hover:text-purple-300 transition-colors cursor-grab"><GripVertical size={18} /></div>
                                </div>

                                <div className="flex-1 overflow-hidden">
                                    {/* 🚀 CHỮ THẲNG TẮP (Bỏ italic) */}
                                    <p className="text-[12px] text-slate-500 font-medium leading-relaxed opacity-90 line-clamp-2">{svc.desc_vi}</p>
                                </div>

                                <div className="flex items-center justify-end gap-5 pt-3 border-t border-slate-50 mt-3 shrink-0">
                                    <button onClick={() => setEditingItem(svc)} className="flex items-center gap-1.5 text-[10px] font-black uppercase text-slate-400 hover:text-orange-600 transition-colors"><Edit2 size={14} /> Sửa</button>
                                    <button onClick={() => handleDelete(svc.id)} className="flex items-center gap-1.5 text-[10px] font-black uppercase text-slate-400 hover:text-premium-red drop-shadow-md transition-colors"><Trash2 size={14} /> Xóa</button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* THANH PHÂN TRANG (Cố định ở đáy) */}
                <div className="bg-white px-6 py-3.5 rounded-[1.5rem] border border-slate-200 shadow-sm shrink-0 flex items-center justify-between">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Hiển thị <span className="text-slate-900 font-black">{services.length === 0 ? 0 : (currentPage - 1) * ITEMS_PER_PAGE + 1} - {Math.min(currentPage * ITEMS_PER_PAGE, services.length)}</span> / {services.length}</p>
                    <div className="flex items-center gap-4">
                        <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)} className="flex items-center gap-2 text-[10px] font-black uppercase text-slate-400 hover:text-purple-600 disabled:opacity-20"><ChevronLeft size={18} /> Trước</button>
                        <div className="bg-purple-600 text-white w-7 h-7 flex items-center justify-center rounded-xl text-[11px] font-black shadow-lg shadow-purple-500/30">{currentPage}</div>
                        <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)} className="flex items-center gap-2 text-[10px] font-black uppercase text-slate-400 hover:text-purple-600 disabled:opacity-20">Sau <ChevronRight size={18} /></button>
                    </div>
                </div>
            </div>
        </div>
    );
}
