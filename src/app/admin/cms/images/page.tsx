import prisma from "@/lib/prisma";
import { Folder, Image as ImageIcon, Trash2, ChevronRight, HardDrive, UploadCloud } from "lucide-react";
import { createSiteImage, deleteSiteImage } from "@/actions/site-image";
import Link from "next/link";

export const dynamic = 'force-dynamic';

export default async function ManageImagesPage({ 
    searchParams 
}: { 
    searchParams: Promise<{ f?: string }> 
}) {
    // 1. Giải quyết params từ URL
    const resolvedSearchParams = await searchParams;
    const f = resolvedSearchParams.f;
    const activeFolder = f || "trang-chu";

    // Danh sách thư mục hệ thống
    const physicalFolders = ["trang-chu", "dich-vu", "san-pham", "tin-tuc", "logo-banner"];

    // 2. Lấy dữ liệu (Dùng 'as any' để bypass kiểm tra Prisma Client chưa cập nhật)
    const images = await prisma.siteImage.findMany({ 
        where: { location: activeFolder },
        orderBy: { id: 'desc' } 
    });

    const allImages = await prisma.siteImage.findMany();

    // 3. Đếm số lượng (Fix triệt để lỗi 'acc' implicitly has an 'any' type)
    const counts = (allImages as any[]).reduce((acc: Record<string, number>, img: any) => {
        const loc = (img.location as string) || "trang-chu";
        acc[loc] = (acc[loc] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    return (
        <div className="h-full min-h-[calc(100vh-6rem)] flex flex-col font-sans animate-in fade-in duration-500 pb-10">
            <div className="flex-1 flex flex-col bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden mt-4">
                
                {/* THANH ĐỊA CHỈ */}
                <div className="bg-slate-100 border-b border-slate-200 p-3 px-5 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-slate-500 font-medium">
                        <HardDrive size={16} className="text-blue-500" />
                        <ChevronRight size={16} />
                        <span>public</span>
                        <ChevronRight size={16} />
                        <span>images</span>
                        <ChevronRight size={16} />
                        <span className="text-slate-900 font-bold bg-white px-2 py-1 rounded shadow-sm border border-slate-200">
                            {activeFolder}
                        </span>
                    </div>
                </div>

                <div className="flex flex-1 overflow-hidden h-full">
                    {/* CỘT TRÁI: CÂY THƯ MỤC */}
                    <div className="w-64 bg-slate-50 border-r border-slate-200 p-4 flex flex-col h-full overflow-y-auto">
                        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 ml-2">Thư mục hệ thống</h3>
                        <div className="space-y-1">
                            {physicalFolders.map((folder) => {
                                const isActive = activeFolder === folder;
                                return (
                                    <Link 
                                        key={folder} 
                                        href={`?f=${folder}`}
                                        className={`flex items-center justify-between p-3 rounded-xl transition-all ${
                                            isActive 
                                            ? "bg-blue-100/50 text-blue-700 font-bold" 
                                            : "hover:bg-slate-200/50 text-slate-700 font-medium"
                                        }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <Folder size={18} className={isActive ? "text-blue-500 fill-blue-200" : "text-slate-400 fill-slate-200"} />
                                            <span className="text-sm">{folder}</span>
                                        </div>
                                        <span className={`text-[10px] px-2 py-0.5 rounded-md ${isActive ? 'bg-blue-200/50' : 'bg-slate-200'}`}>
                                            {counts[folder] || 0}
                                        </span>
                                    </Link>
                                );
                            })}
                        </div>
                    </div>

                    {/* CỘT PHẢI: KHU VỰC HIỂN THỊ */}
                    <div className="flex-1 flex flex-col min-w-0 bg-white relative">
                        <div className="border-b border-slate-100 p-4 bg-white shadow-sm z-10">
                            <form action={async (formData) => { "use server"; await createSiteImage(formData); }} className="flex flex-wrap items-center gap-3">
                                <input type="hidden" name="location" value={activeFolder} />
                                <input type="file" name="file" accept="image/*" required className="flex-1 min-w-[200px] text-sm file:mr-4 file:py-2.5 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer bg-slate-50 border border-slate-200 rounded-lg p-1" />
                                <input name="name" required placeholder="Tên file" className="w-40 bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs font-medium" />
                                <input name="key" required placeholder="Mã KEY" className="w-32 bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs font-bold uppercase" />
                                <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-lg font-bold text-xs uppercase flex items-center gap-2 transition-all active:scale-95">
                                    <UploadCloud size={16} /> Tải Lên
                                </button>
                            </form>
                        </div>

                        <div className="flex-1 overflow-y-auto p-6 bg-slate-50/30">
                            {(images as any[]).length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center text-slate-400">
                                    <Folder size={64} className="mb-4 text-slate-200 fill-slate-100" />
                                    <p className="font-bold">Thư mục trống</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                                    {(images as any[]).map((img: any) => (
                                        <div key={img.id} className="group flex flex-col">
                                            <div className="aspect-square w-full rounded-xl overflow-hidden bg-white border border-slate-200 shadow-sm relative group-hover:border-blue-400 group-hover:shadow-md transition-all">
                                                <img src={img.imageUrl} alt={img.name} className="w-full h-full object-cover" />
                                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                    <form action={async () => { "use server"; await deleteSiteImage(img.id); }}>
                                                        <button type="submit" className="bg-red-500 text-white p-3 rounded-full hover:bg-premium-red transform hover:scale-110 transition-all shadow-lg">
                                                            <Trash2 size={18} />
                                                        </button>
                                                    </form>
                                                </div>
                                            </div>
                                            <div className="mt-2 px-1 text-center">
                                                <h3 className="font-bold text-slate-800 text-xs truncate">{img.name}</h3>
                                                <p className="text-[10px] text-slate-400 font-medium truncate mt-0.5">{img.key}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
