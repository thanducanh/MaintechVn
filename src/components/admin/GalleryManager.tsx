// 📍 File: src/components/admin/GalleryManager.tsx
"use client";

import { useState, useRef } from "react";
import { 
    CloudUpload, 
    Trash2, 
    Maximize2, 
    Move, 
    X, 
    Loader2, 
    Image as ImageIcon,
    ChevronLeft,
    ChevronRight
} from "lucide-react";
import toast from "react-hot-toast";
import { uploadProductGalleryAction } from "@/actions/product";

interface GalleryManagerProps {
    images: string[];
    onChange: (urls: string[]) => void;
    language?: "vi" | "en";
}

export default function GalleryManager({
    images,
    onChange,
    language = "vi"
}: GalleryManagerProps) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [activeLightbox, setActiveLightbox] = useState<string | null>(null);
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const modalFileInputRef = useRef<HTMLInputElement>(null);
    const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

    // Dynamic Translations
    const t = {
        title: language === "en" ? "Manage Gallery" : "Quản lý Thư viện ảnh",
        dropzoneText: language === "en" ? "Drag & drop gallery images here" : "Kéo & thả hình ảnh vào đây",
        clickUpload: language === "en" ? "or click to upload" : "hoặc click để tải lên từ thiết bị",
        formats: language === "en" ? "Supports JPG, PNG, WEBP (Max 10MB)" : "Hỗ trợ định dạng JPG, PNG, WEBP (Tối đa 10MB)",
        uploaded: language === "en" ? "Uploaded" : "Đã tải lên",
        imagesCount: language === "en" ? "images" : "hình ảnh",
        close: language === "en" ? "Close" : "Đóng",
        deleteConfirm: language === "en" ? "Image removed!" : "Đã xóa ảnh khỏi danh sách!",
        uploadingText: language === "en" ? "Uploading..." : "Đang tải ảnh lên...",
        dragTip: language === "en" ? "Drag tiles to reorder. Hover for actions." : "Kéo thả các thẻ để sắp xếp thứ tự hiển thị.",
        empty: language === "en" ? "Gallery is empty. Add some photos!" : "Chưa có hình ảnh phụ nào. Hãy tải lên ảnh mới!",
        viewFullscreen: language === "en" ? "View Fullscreen" : "Xem ảnh phóng to"
    };

    // Upload Handler logic
    const handleFiles = async (files: FileList | null) => {
        if (!files || files.length === 0) return;
        setUploading(true);

        const newUrls: string[] = [];
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            const formData = new FormData();
            formData.append("file", file);

            try {
                const res = await uploadProductGalleryAction(formData);
                if (res.success && res.url) {
                    newUrls.push(res.url);
                } else {
                    toast.error(`${file.name}: ${res.error || "Upload failed"}`);
                }
            } catch (err) {
                toast.error(`Lỗi kết nối tải ảnh: ${file.name}`);
            }
        }

        if (newUrls.length > 0) {
            onChange([...images, ...newUrls]);
            toast.success(
                language === "en" 
                    ? `Uploaded ${newUrls.length} image(s) successfully!` 
                    : `Tải lên thành công ${newUrls.length} ảnh phụ!`
            );
        }
        setUploading(false);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        handleFiles(e.target.files);
    };

    const handleRemoveImage = (indexToRemove: number, e: React.MouseEvent) => {
        e.stopPropagation();
        const updated = images.filter((_, i) => i !== indexToRemove);
        onChange(updated);
        toast.success(t.deleteConfirm);
    };

    // HTML5 Drag and Drop Reordering Handlers
    const handleDragStart = (e: React.DragEvent, index: number) => {
        e.dataTransfer.setData("text/plain", index.toString());
        e.dataTransfer.effectAllowed = "move";
    };

    const handleDragOver = (e: React.DragEvent, index: number) => {
        e.preventDefault();
        setDragOverIndex(index);
    };

    const handleDrop = (e: React.DragEvent, targetIndex: number) => {
        e.preventDefault();
        setDragOverIndex(null);
        const sourceIndex = parseInt(e.dataTransfer.getData("text/plain"), 10);
        if (isNaN(sourceIndex) || sourceIndex === targetIndex) return;

        const updated = [...images];
        const [movedItem] = updated.splice(sourceIndex, 1);
        updated.splice(targetIndex, 0, movedItem);
        onChange(updated);
    };

    const handleDragLeave = () => {
        setDragOverIndex(null);
    };

    // Dropzone drag/drop handlers for uploading
    const [dropActive, setDropActive] = useState(false);
    const handleDropzoneDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDropActive(true);
        } else if (e.type === "dragleave") {
            setDropActive(false);
        }
    };

    const handleDropzoneDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDropActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            handleFiles(e.dataTransfer.files);
        }
    };

    // Lightbox navigation
    const handlePrevLightbox = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!activeLightbox) return;
        const idx = images.indexOf(activeLightbox);
        if (idx > 0) {
            setActiveLightbox(images[idx - 1]);
        } else {
            setActiveLightbox(images[images.length - 1]); // Loop back
        }
    };

    const handleNextLightbox = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!activeLightbox) return;
        const idx = images.indexOf(activeLightbox);
        if (idx < images.length - 1) {
            setActiveLightbox(images[idx + 1]);
        } else {
            setActiveLightbox(images[0]); // Loop back
        }
    };

    return (
        <div className="w-full flex flex-col gap-2 shrink-0">
            {/* 1. SIDEBAR COMPACT PREVIEW BLOCK */}
            <div className="flex items-center justify-between select-none">
                <label className="text-[10px] font-bold uppercase text-slate-450 dark:text-slate-500 tracking-wider">
                    {t.title}
                </label>
                <button
                    type="button"
                    onClick={() => setIsModalOpen(true)}
                    className="text-[9px] font-bold text-indigo-500 hover:text-indigo-600 dark:text-indigo-400 dark:hover:text-indigo-300 uppercase tracking-wider transition-colors"
                >
                    {language === "en" ? "Manage & Reorder" : "Cấu hình / Sắp xếp"}
                </button>
            </div>

            {/* Compact row grid */}
            <div className="flex items-center gap-2 select-none">
                <div 
                    onClick={() => setIsModalOpen(true)}
                    className="flex flex-wrap gap-2 items-center flex-1 max-h-[48px] overflow-hidden bg-slate-50 dark:bg-slate-950 p-1 border border-slate-200 dark:border-slate-800 rounded-lg cursor-pointer hover:border-slate-350 dark:hover:border-slate-700 transition-colors"
                >
                    {images.length === 0 ? (
                        <div className="flex items-center gap-1.5 px-2 py-1 text-slate-400 dark:text-slate-500 text-[10px] font-semibold">
                            <ImageIcon size={12} />
                            <span>{language === "en" ? "No photos" : "Chưa có ảnh phụ"}</span>
                        </div>
                    ) : (
                        <>
                            {images.slice(0, 5).map((url, idx) => (
                                <div 
                                    key={idx} 
                                    className="relative h-8 w-8 rounded-md overflow-visible border border-slate-200 dark:border-slate-700 shadow-sm shrink-0 group/thumb"
                                    onClick={e => e.stopPropagation()}
                                >
                                    <img src={url} alt="Gallery" className="w-full h-full object-cover rounded-md" />
                                    <button
                                        type="button"
                                        onClick={(e) => handleRemoveImage(idx, e)}
                                        className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-600 text-white shadow hover:bg-red-700 opacity-0 group-hover/thumb:opacity-100 transition-opacity z-10"
                                    >
                                        <X size={9} />
                                    </button>
                                </div>
                            ))}
                            {images.length > 5 && (
                                <div 
                                    className="w-8 h-8 rounded-md bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-[10px] font-bold text-slate-650 dark:text-slate-350 shrink-0"
                                    onClick={() => setIsModalOpen(true)}
                                >
                                    +{images.length - 5}
                                </div>
                            )}
                        </>
                    )}
                </div>

                {/* Direct uploader link */}
                <button
                    type="button"
                    disabled={uploading}
                    onClick={() => fileInputRef.current?.click()}
                    className="w-10 h-10 flex flex-col items-center justify-center bg-white hover:bg-slate-50 dark:bg-slate-900 dark:hover:bg-slate-850 border border-slate-200 dark:border-slate-800 rounded-lg hover:border-indigo-400 dark:hover:border-indigo-500 transition-colors shrink-0 text-slate-500"
                >
                    {uploading ? (
                        <Loader2 size={13} className="animate-spin text-indigo-500 dark:text-indigo-400" />
                    ) : (
                        <CloudUpload size={14} />
                    )}
                    <input 
                        ref={fileInputRef}
                        type="file" 
                        multiple 
                        accept="image/*" 
                        className="hidden" 
                        onChange={handleFileChange}
                    />
                </button>
            </div>

            {/* 2. FULL INTERACTIVE DIALOG (WORKSPACE) MODAL */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
                    <div 
                        className="w-full max-w-4xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col h-[85vh] animate-scale-up"
                        onClick={e => e.stopPropagation()}
                    >
                        {/* Modal Header */}
                        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-150 dark:border-slate-800 shrink-0 bg-slate-50 dark:bg-slate-950">
                            <div className="flex items-center gap-2.5">
                                <div className="h-8 w-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                                    <ImageIcon size={16} />
                                </div>
                                <div>
                                    <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800 dark:text-slate-100">
                                        {t.title}
                                    </h3>
                                    <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold mt-0.5 uppercase tracking-wide">
                                        {t.uploaded}: {images.length} {t.imagesCount}
                                    </p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => setIsModalOpen(false)}
                                className="h-8 w-8 flex items-center justify-center rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-650 transition-colors"
                            >
                                <X size={16} />
                            </button>
                        </div>

                        {/* Modal Content Scroll Area */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar bg-white dark:bg-slate-900 select-none">
                            {/* A. Dropzone Upload Panel */}
                            <div 
                                onDragEnter={handleDropzoneDrag}
                                onDragOver={handleDropzoneDrag}
                                onDragLeave={handleDropzoneDrag}
                                onDrop={handleDropzoneDrop}
                                onClick={() => modalFileInputRef.current?.click()}
                                className={`w-full rounded-xl border-2 border-dashed flex flex-col items-center justify-center py-6 text-center cursor-pointer transition-all duration-200 relative overflow-hidden group 
                                    ${dropActive 
                                        ? "border-indigo-500 bg-indigo-50/10 dark:border-indigo-400 dark:bg-indigo-950/10 scale-[0.99]" 
                                        : "border-slate-300 bg-slate-50 hover:bg-slate-100/50 dark:border-slate-800 dark:bg-slate-950 dark:hover:bg-slate-850/50"
                                    }
                                `}
                            >
                                {uploading ? (
                                    <div className="flex flex-col items-center justify-center py-2 animate-pulse">
                                        <Loader2 size={32} className="text-indigo-500 dark:text-indigo-400 animate-spin mb-3" />
                                        <p className="text-xs font-bold text-slate-600 dark:text-slate-350">{t.uploadingText}</p>
                                    </div>
                                ) : (
                                    <>
                                        <CloudUpload size={32} className="text-slate-400 dark:text-slate-550 mb-2 group-hover:text-indigo-500 dark:group-hover:text-indigo-400 transition-colors" />
                                        <p className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                                            {t.dropzoneText}
                                        </p>
                                        <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold mt-1 uppercase tracking-wide">
                                            {t.clickUpload}
                                        </p>
                                        <p className="text-[9px] text-slate-400 dark:text-slate-550 mt-1">
                                            {t.formats}
                                        </p>
                                    </>
                                )}
                                <input 
                                    ref={modalFileInputRef}
                                    type="file" 
                                    multiple 
                                    accept="image/*" 
                                    className="hidden" 
                                    onChange={handleFileChange}
                                />
                            </div>

                            {/* B. Drag Tip & Instructions */}
                            {images.length > 0 && (
                                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50/30 dark:bg-indigo-950/15 border border-indigo-100/40 dark:border-indigo-900/30 rounded-lg text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider shrink-0">
                                    <Move size={12} />
                                    <span>{t.dragTip}</span>
                                </div>
                            )}

                            {/* C. Grid of Images */}
                            {images.length === 0 ? (
                                <div className="h-[25vh] flex flex-col items-center justify-center text-center text-slate-400 dark:text-slate-500 py-10">
                                    <ImageIcon size={44} className="opacity-30 mb-2.5" />
                                    <p className="text-xs font-semibold">{t.empty}</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                                    {images.map((url, index) => (
                                        <div
                                            key={url + index}
                                            draggable
                                            onDragStart={(e) => handleDragStart(e, index)}
                                            onDragOver={(e) => handleDragOver(e, index)}
                                            onDrop={(e) => handleDrop(e, index)}
                                            onDragLeave={handleDragLeave}
                                            className={`relative aspect-square rounded-xl border overflow-hidden shadow-sm bg-slate-100 dark:bg-slate-950 group/item cursor-grab active:cursor-grabbing transition-all duration-200
                                                ${dragOverIndex === index 
                                                    ? "border-indigo-500 scale-[1.03] ring-2 ring-indigo-500/20" 
                                                    : "border-slate-200 hover:border-slate-350 dark:border-slate-800 dark:hover:border-slate-700"
                                                }
                                            `}
                                        >
                                            <img src={url} alt="Gallery" className="w-full h-full object-cover select-none pointer-events-none" />
                                            
                                            {/* Order Badge tag */}
                                            <div className="absolute top-2 left-2 px-1.5 py-0.5 rounded bg-black/60 text-white text-[9px] font-extrabold tracking-wider z-10">
                                                #{index + 1}
                                            </div>

                                            {/* Visual Hover Overlays */}
                                            <div className="absolute inset-0 bg-black/45 opacity-0 group-hover/item:opacity-100 transition-opacity flex items-center justify-center gap-2.5 z-20">
                                                <button
                                                    type="button"
                                                    onClick={() => setActiveLightbox(url)}
                                                    className="p-1.5 bg-white/20 hover:bg-white/40 backdrop-blur-sm rounded-lg text-white hover:scale-105 transition-all"
                                                    title={t.viewFullscreen}
                                                >
                                                    <Maximize2 size={13} />
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={(e) => handleRemoveImage(index, e)}
                                                    className="p-1.5 bg-white/20 hover:bg-red-650 backdrop-blur-sm rounded-lg text-red-200 hover:text-white hover:scale-105 transition-all"
                                                    title="Delete Image"
                                                >
                                                    <Trash2 size={13} />
                                                </button>
                                            </div>

                                            {/* Drag Indicator handle */}
                                            <div className="absolute bottom-2 right-2 p-1 rounded bg-black/35 text-white/70 opacity-0 group-hover/item:opacity-100 transition-opacity pointer-events-none">
                                                <Move size={10} />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Modal Footer */}
                        <div className="px-6 py-4 border-t border-slate-150 dark:border-slate-800 shrink-0 bg-slate-50 dark:bg-slate-950 flex items-center justify-end">
                            <button
                                type="button"
                                onClick={() => setIsModalOpen(false)}
                                className="h-9 px-5 rounded-lg bg-[#c40018] hover:bg-[#a80014] text-white text-xs font-semibold tracking-wider uppercase transition-colors"
                            >
                                {t.close}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* 3. LIGHTBOX VIEWER OVERLAY */}
            {activeLightbox && (
                <div 
                    className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-sm"
                    onClick={() => setActiveLightbox(null)}
                >
                    {/* Top-Right Control Buttons */}
                    <div className="absolute top-4 right-4 flex items-center gap-3 z-[110] select-none">
                        <span className="text-[11px] font-bold text-slate-400 tracking-wider">
                            {images.indexOf(activeLightbox) + 1} / {images.length}
                        </span>
                        <button
                            type="button"
                            onClick={() => setActiveLightbox(null)}
                            className="h-9 w-9 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    {/* Left Navigation Arrow */}
                    {images.length > 1 && (
                        <button
                            type="button"
                            onClick={handlePrevLightbox}
                            className="absolute left-6 h-12 w-12 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors z-[110]"
                        >
                            <ChevronLeft size={24} />
                        </button>
                    )}

                    {/* Big Center Image */}
                    <div className="max-w-[85vw] max-h-[85vh] relative flex items-center justify-center">
                        <img 
                            src={activeLightbox} 
                            alt="Lightbox" 
                            className="max-w-full max-h-[85vh] object-contain rounded-xl select-none"
                            onClick={e => e.stopPropagation()} 
                        />
                    </div>

                    {/* Right Navigation Arrow */}
                    {images.length > 1 && (
                        <button
                            type="button"
                            onClick={handleNextLightbox}
                            className="absolute right-6 h-12 w-12 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors z-[110]"
                        >
                            <ChevronRight size={24} />
                        </button>
                    )}
                </div>
            )}
        </div>
    );
}
