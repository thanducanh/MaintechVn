"use client";

// 📍 File: src/app/admin/cms/inquiries/InquiriesClient.tsx

import { useState, useTransition } from "react";
import { Phone, Mail, MessageSquareText, PhoneCall, Inbox, Loader2, Trash2, Eye, X, User, Clock, MapPin, Tag, ChevronLeft, ChevronRight, AlertTriangle } from "lucide-react";
import { updateInquiryStatusAction, deleteInquiryAction, getInquiriesPageAction } from "@/actions/contact";
import toast from "react-hot-toast";

type Inquiry = {
    id: number;
    name: string;
    email: string;
    phone: string;
    service_interest: string | null;
    message: string;
    status: string;
    createdAt: string | Date;
};

type Data = {
    inquiries: Inquiry[];
    pagination: { total: number; page: number; limit: number; totalPages: number };
    inquiryStats: { total: number; today: number; last7Days: number };
    callStats: { total: number; today: number; last7Days: number };
};

const STATUS_OPTIONS = ["Mới", "Đã liên hệ", "Đã đóng"];

function StatCard({ icon: Icon, label, value, accent, bg }: { icon: any; label: string; value: number; accent: string, bg: string }) {
    return (
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-4 flex items-center gap-3">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${bg}`}>
                <Icon size={18} className={accent} />
            </div>
            <div>
                <p className="text-xl font-bold text-slate-800 leading-tight">{value}</p>
                <p className="text-[10px] font-semibold uppercase text-slate-500 mt-0.5">{label}</p>
            </div>
        </div>
    );
}

export default function InquiriesClient({ initialData }: { initialData: Data }) {
    const [inquiries, setInquiries] = useState(initialData.inquiries);
    const [currentPage, setCurrentPage] = useState(initialData.pagination?.page || 1);
    const [totalPages, setTotalPages] = useState(initialData.pagination?.totalPages || 1);
    
    const [isPending, startTransition] = useTransition();
    const [updatingId, setUpdatingId] = useState<number | null>(null);
    const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null);
    
    // State cho Custom Delete Modal
    const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);

    const loadPage = (page: number) => {
        if (page < 1 || page > totalPages) return;
        startTransition(async () => {
            const res = await getInquiriesPageAction(page, 20);
            if (res.success) {
                setInquiries(res.inquiries || []);
                setCurrentPage(page);
                setTotalPages(res.totalPages || 1);
            } else {
                toast.error("Không thể tải dữ liệu");
            }
        });
    };

    const handleStatusChange = (id: number, status: string) => {
        setUpdatingId(id);
        startTransition(async () => {
            const res = await updateInquiryStatusAction(id, status);
            if ((res as any)?.success) {
                setInquiries((prev) => prev.map((i) => (i.id === id ? { ...i, status } : i)));
                if (selectedInquiry?.id === id) {
                    setSelectedInquiry({ ...selectedInquiry, status });
                }
                toast.success("Đã cập nhật trạng thái");
            } else {
                toast.error((res as any)?.error || "Có lỗi xảy ra");
            }
            setUpdatingId(null);
        });
    };

    const confirmDelete = () => {
        if (!deleteConfirmId) return;
        const id = deleteConfirmId;
        
        setUpdatingId(id);
        setDeleteConfirmId(null); // Đóng modal ngay
        
        startTransition(async () => {
            const res = await deleteInquiryAction(id);
            if ((res as any)?.success) {
                setInquiries((prev) => prev.filter((i) => i.id !== id));
                if (selectedInquiry?.id === id) setSelectedInquiry(null);
                toast.success("Đã xóa tin nhắn");
            } else {
                toast.error((res as any)?.error || "Lỗi khi xóa tin nhắn");
            }
            setUpdatingId(null);
        });
    };

    return (
        <div className="animate-in fade-in duration-500 pb-10 relative">
            {/* THỐNG KÊ COMPACT */}
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3 mb-6">
                <StatCard icon={Inbox} label="Tổng liên hệ" value={initialData.inquiryStats.total} bg="bg-red-50" accent="text-red-600" />
                <StatCard icon={MessageSquareText} label="Liên hệ hôm nay" value={initialData.inquiryStats.today} bg="bg-slate-50" accent="text-slate-800" />
                <StatCard icon={Mail} label="Liên hệ 7 ngày" value={initialData.inquiryStats.last7Days} bg="bg-slate-50" accent="text-slate-600" />
                <StatCard icon={PhoneCall} label="Tổng bấm gọi" value={initialData.callStats.total} bg="bg-blue-50" accent="text-blue-600" />
                <StatCard icon={Phone} label="Gọi hôm nay" value={initialData.callStats.today} bg="bg-blue-50" accent="text-blue-500" />
                <StatCard icon={Phone} label="Gọi 7 ngày" value={initialData.callStats.last7Days} bg="bg-blue-50" accent="text-blue-400" />
            </div>

            {/* DANH SÁCH COMPACT - REDESIGNED */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
                {inquiries.length === 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center py-20 text-slate-400 font-medium text-sm">
                        <Inbox size={48} className="text-slate-200 mb-4" />
                        Chưa có liên hệ nào.
                    </div>
                ) : (
                    <div className="flex flex-col relative">
                        {isPending && !updatingId && (
                            <div className="absolute inset-0 bg-white/50 backdrop-blur-[1px] z-20 flex items-center justify-center">
                                <Loader2 className="w-8 h-8 text-premium-red animate-spin" />
                            </div>
                        )}
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-slate-50 border-b border-slate-200">
                                    <tr>
                                        <th className="px-5 py-3 text-[11px] font-black uppercase text-slate-500 tracking-wider w-[20%]">Khách hàng</th>
                                        <th className="px-5 py-3 text-[11px] font-black uppercase text-slate-500 tracking-wider w-[20%]">Liên hệ</th>
                                        <th className="px-5 py-3 text-[11px] font-black uppercase text-slate-500 tracking-wider w-[35%]">Nội dung</th>
                                        <th className="px-5 py-3 text-[11px] font-black uppercase text-slate-500 tracking-wider w-[15%]">Thời gian</th>
                                        <th className="px-5 py-3 text-[11px] font-black uppercase text-slate-500 tracking-wider w-[10%] text-right">Thao tác</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {inquiries.map((iq) => {
                                        return (
                                            <tr 
                                                key={iq.id} 
                                                className="hover:bg-slate-50/80 cursor-pointer transition-colors group"
                                                onClick={() => setSelectedInquiry(iq)}
                                            >
                                                <td className="px-5 py-3 align-top">
                                                    <div className="font-bold text-slate-900 text-sm mb-1">{iq.name}</div>
                                                    {iq.service_interest && (
                                                        <span className="inline-block px-2 py-0.5 bg-red-50 text-premium-red text-[10px] font-bold uppercase rounded border border-red-100">
                                                            {iq.service_interest}
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-5 py-3 align-top">
                                                    <div className="flex flex-col gap-1 text-[13px]">
                                                        <div className="font-semibold text-slate-700 flex items-center gap-1.5">
                                                            <Phone size={13} className="text-slate-400" /> {iq.phone}
                                                        </div>
                                                        <div className="text-slate-500 flex items-center gap-1.5 truncate max-w-[200px]" title={iq.email}>
                                                            <Mail size={13} className="text-slate-400 shrink-0" /> <span className="truncate">{iq.email}</span>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-5 py-3 align-top">
                                                    <div className="text-[13px] text-slate-600 line-clamp-2 leading-relaxed">
                                                        {iq.message || <span className="italic text-slate-400">Không có nội dung</span>}
                                                    </div>
                                                </td>
                                                <td className="px-5 py-3 align-top">
                                                    <div className="text-[13px] font-medium text-slate-900">
                                                        {new Date(iq.createdAt).toLocaleDateString("vi-VN", { day: '2-digit', month: '2-digit', year: 'numeric' })}
                                                    </div>
                                                    <div className="text-[11px] text-slate-500 mt-0.5">
                                                        {new Date(iq.createdAt).toLocaleTimeString("vi-VN", { hour: '2-digit', minute: '2-digit' })}
                                                    </div>
                                                </td>
                                                <td className="px-5 py-3 align-top text-right" onClick={(e) => e.stopPropagation()}>
                                                    <div className="flex items-center justify-end gap-3">
                                                        {isPending && updatingId === iq.id && <Loader2 size={14} className="animate-spin text-premium-red" />}
                                                        <select
                                                            value={iq.status}
                                                            disabled={isPending && updatingId === iq.id}
                                                            onChange={(e) => handleStatusChange(iq.id, e.target.value)}
                                                            className={`text-[11px] font-bold border rounded-md px-2 py-1 outline-none transition-all cursor-pointer
                                                                ${iq.status === 'Mới' ? 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100' : 
                                                                  iq.status === 'Đã liên hệ' ? 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100' : 
                                                                  'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'}`}
                                                        >
                                                            {STATUS_OPTIONS.map((s) => (
                                                                <option key={s} value={s}>{s}</option>
                                                            ))}
                                                        </select>
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setDeleteConfirmId(iq.id);
                                                            }}
                                                            disabled={isPending && updatingId === iq.id}
                                                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-all disabled:opacity-50"
                                                            title="Xoá tin nhắn"
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                        
                        {/* PAGINATION CONTROLS */}
                        {totalPages > 1 && (
                            <div className="border-t border-slate-100 p-4 flex items-center justify-between bg-slate-50/50">
                                <span className="text-xs font-semibold text-slate-500">
                                    Trang {currentPage} / {totalPages}
                                </span>
                                <div className="flex gap-2">
                                    <button 
                                        onClick={() => loadPage(currentPage - 1)}
                                        disabled={currentPage === 1 || isPending}
                                        className="p-1.5 border border-slate-200 rounded-md text-slate-600 hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors bg-white shadow-sm"
                                    >
                                        <ChevronLeft size={16} />
                                    </button>
                                    <button 
                                        onClick={() => loadPage(currentPage + 1)}
                                        disabled={currentPage === totalPages || isPending}
                                        className="p-1.5 border border-slate-200 rounded-md text-slate-600 hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors bg-white shadow-sm"
                                    >
                                        <ChevronRight size={16} />
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* CUSTOM DELETE CONFIRMATION MODAL */}
            {deleteConfirmId && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="p-6 text-center">
                            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                <AlertTriangle className="w-8 h-8 text-red-500" />
                            </div>
                            <h3 className="text-lg font-bold text-slate-900 mb-2">Xóa liên hệ này?</h3>
                            <p className="text-sm text-slate-500">
                                Bạn có chắc chắn muốn xóa tin nhắn này vĩnh viễn? Hành động này không thể hoàn tác.
                            </p>
                        </div>
                        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center gap-3 justify-center">
                            <button
                                onClick={() => setDeleteConfirmId(null)}
                                className="px-5 py-2.5 text-sm font-semibold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors flex-1"
                            >
                                Hủy bỏ
                            </button>
                            <button
                                onClick={confirmDelete}
                                className="px-5 py-2.5 text-sm font-semibold text-white bg-premium-red rounded-xl hover:bg-red-700 transition-colors flex-1"
                            >
                                Đồng ý xóa
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* MODAL CHI TIẾT */}
            {selectedInquiry && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
                        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
                            <h3 className="font-bold text-lg text-slate-900">Chi tiết liên hệ</h3>
                            <button onClick={() => setSelectedInquiry(null)} className="p-2 text-slate-400 hover:bg-slate-100 rounded-full transition-colors">
                                <X size={20} />
                            </button>
                        </div>
                        <div className="p-6 space-y-6 flex-1 overflow-auto">
                            
                            <div className="grid grid-cols-2 gap-6 bg-slate-50 p-5 rounded-xl border border-slate-100">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2 text-xs font-bold uppercase text-slate-400"><User size={12}/> Khách hàng</div>
                                    <div className="font-semibold text-slate-900 text-base">{selectedInquiry.name}</div>
                                </div>
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2 text-xs font-bold uppercase text-slate-400"><Clock size={12}/> Thời gian</div>
                                    <div className="font-medium text-slate-700 text-sm">{new Date(selectedInquiry.createdAt).toLocaleString("vi-VN")}</div>
                                </div>
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2 text-xs font-bold uppercase text-slate-400"><Phone size={12}/> Điện thoại</div>
                                    <div className="font-medium text-slate-700 text-sm"><a href={`tel:${selectedInquiry.phone}`} className="hover:text-premium-red">{selectedInquiry.phone}</a></div>
                                </div>
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2 text-xs font-bold uppercase text-slate-400"><Mail size={12}/> Email</div>
                                    <div className="font-medium text-slate-700 text-sm"><a href={`mailto:${selectedInquiry.email}`} className="hover:text-premium-red">{selectedInquiry.email}</a></div>
                                </div>
                                {selectedInquiry.service_interest && (
                                    <div className="space-y-1 col-span-2">
                                        <div className="flex items-center gap-2 text-xs font-bold uppercase text-slate-400"><Tag size={12}/> Dịch vụ quan tâm</div>
                                        <div className="inline-block px-3 py-1 bg-red-50 text-premium-red text-xs font-bold uppercase rounded-md">{selectedInquiry.service_interest}</div>
                                    </div>
                                )}
                            </div>

                            <div className="space-y-3">
                                <div className="flex items-center gap-2 text-xs font-bold uppercase text-slate-400">
                                    <MessageSquareText size={14} /> Nội dung tin nhắn
                                </div>
                                <div className="p-5 bg-white border border-slate-200 rounded-xl text-slate-700 text-sm leading-relaxed whitespace-pre-wrap">
                                    {selectedInquiry.message || <span className="text-slate-400 italic">Không có nội dung.</span>}
                                </div>
                            </div>
                        </div>
                        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <span className="text-xs font-bold text-slate-500 uppercase">Trạng thái:</span>
                                <select
                                    value={selectedInquiry.status}
                                    onChange={(e) => handleStatusChange(selectedInquiry.id, e.target.value)}
                                    className="text-sm font-semibold border border-slate-200 rounded-lg px-3 py-1.5 outline-none focus:border-premium-red bg-white"
                                >
                                    {STATUS_OPTIONS.map((s) => (
                                        <option key={s} value={s}>{s}</option>
                                    ))}
                                </select>
                                {isPending && updatingId === selectedInquiry.id && <Loader2 size={16} className="animate-spin text-slate-400" />}
                            </div>
                            <button
                                onClick={() => { setDeleteConfirmId(selectedInquiry.id); setSelectedInquiry(null); }}
                                className="flex items-center gap-2 px-4 py-2 bg-white border border-red-200 text-red-600 hover:bg-red-50 rounded-lg text-sm font-semibold transition-colors"
                            >
                                <Trash2 size={16} /> Xóa tin
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
