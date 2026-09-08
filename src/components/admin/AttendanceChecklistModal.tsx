"use client";

import { useState, useEffect } from "react";
import { X, CheckCircle2, Clock, Calendar, XCircle, Save, Info, AlertCircle, ChevronRight, User as UserIcon, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

interface Props {
    isOpen: boolean;
    onClose: () => void;
    selectedDate: string;
    activeStaff: any[];
    currentSchedules: any[];
    attendances: any[];
    onSave: (userId: number, data: any, shouldMutate?: boolean) => Promise<boolean>;
    onSaved?: () => void;
    SHIFT_DEFS: any;
}

export default function AttendanceChecklistModal({ 
    isOpen, 
    onClose, 
    selectedDate, 
    activeStaff, 
    currentSchedules, 
    attendances,
    onSave,
    onSaved,
    SHIFT_DEFS
}: Props) {
    const [checklistData, setChecklistData] = useState<Record<number, any>>({});
    const [isSaving, setIsSaving] = useState(false);

    // Danh sách dòng lịch làm việc (Từng dòng là 1 ca của nhân viên)
    const scheduleRows = currentSchedules
        .filter(s => s.shiftCode !== 'OFF')
        .map(s => {
            const user = s.user || activeStaff.find(u => u.id === s.userId);
            return { ...s, user };
        })
        .filter(row => row.user);

    // Nhóm theo ca: HC -> S -> C -> D
    const shiftsOrder = ["HC", "S", "C", "D"];
    const groupedByShift = shiftsOrder.reduce((acc, code) => {
        const rows = scheduleRows.filter(r => r.shiftCode === code);
        if (rows.length > 0) acc.push({ code, rows });
        return acc;
    }, [] as { code: string; rows: any[] }[]);

    useEffect(() => {
        if (isOpen) {
            const initialData: Record<string, any> = {};
            scheduleRows.forEach(row => {
                const att = attendances.find(a => a.userId === row.userId && a.shiftCode === row.shiftCode);
                const shift = SHIFT_DEFS[row.shiftCode || "HC"];
                const key = `${row.userId}_${row.shiftCode}`;

                initialData[key] = {
                    status: att?.status || "CHUA_CHAM",
                    checkIn: att?.checkIn || shift?.in || "",
                    checkOut: att?.checkOut || shift?.out || "",
                    lateMinutes: att?.lateMinutes || 0,
                    note: att?.note || "",
                    reason: att?.reason || "",
                    isApprovedLeave: !!att?.isApprovedLeave,
                };
            });
            setChecklistData(initialData);
        }
    }, [isOpen, selectedDate, currentSchedules]);

    const handleStatusChange = (userId: number, shiftCode: string, status: string) => {
        const key = `${userId}_${shiftCode}`;
        setChecklistData(prev => {
            const current = prev[key];
            const shift = SHIFT_DEFS[shiftCode || "HC"];
            
            let updates: any = { status, isDirty: true };
            
            if (status === "CO_MAT") {
                updates.checkIn = shift?.in || "08:00";
                updates.checkOut = shift?.out || "17:00";
            } else if (status === "VANG" || status === "NGHI_KHONG_PHEP") {
                updates.checkIn = "";
                updates.checkOut = "";
            }

            return { ...prev, [key]: { ...current, ...updates } };
        });
    };

    const router = useRouter();

    const handleSaveAll = async () => {
        const rowsToSave = Object.keys(checklistData).filter(key => checklistData[key].isDirty);
        
        if (rowsToSave.length === 0) {
            toast("Chưa có thay đổi để lưu.", { icon: "ℹ️" });
            return;
        }

        setIsSaving(true);
        let successCount = 0;
        
        for (const key of rowsToSave) {
            const [userIdStr, shiftCode] = key.split('_');
            const userId = Number(userIdStr);
            const data = checklistData[key];
            
            const success = await onSave(userId, { ...data, shiftCode }, false);
            if (success) successCount++;
        }

        toast.success(`Đã lưu chấm công cho ${successCount} dòng.`);
        setIsSaving(false);
        onClose();
        onSaved?.();
        router.refresh();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-0 md:p-6 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-white dark:bg-slate-900 w-full max-w-5xl h-full md:h-auto md:max-h-[90vh] rounded-none md:rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden">
                
                {/* Header */}
                <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-white dark:bg-slate-900 sticky top-0 z-10">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-slate-900 flex items-center justify-center text-white shadow-lg shadow-slate-200 dark:shadow-none">
                            <Fingerprint size={24} />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white">Bảng điểm danh hằng ngày</h3>
                            <p className="text-sm text-slate-500 font-medium">
                                {new Date(selectedDate).toLocaleDateString("vi-VN", { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                            </p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all active:scale-90">
                        <X size={22} className="text-slate-400" />
                    </button>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto bg-slate-50/30 dark:bg-slate-900/50">
                    {groupedByShift.length === 0 ? (
                        <div className="py-24 text-center">
                            <div className="w-20 h-20 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
                                <Calendar size={40} />
                            </div>
                            <p className="text-slate-500 font-medium italic">Không có nhân sự nào có lịch làm việc trong ngày này.</p>
                        </div>
                    ) : (
                        <div className="p-6 space-y-8">
                            {groupedByShift.map((group) => {
                                const shift = SHIFT_DEFS[group.code];
                                return (
                                    <div key={group.code} className="space-y-4">
                                        <div className="flex items-center gap-3">
                                            <div className="h-px flex-1 bg-slate-200 dark:bg-slate-800" />
                                            <div className="flex items-center gap-2 px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                                                <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                                                    Ca {group.code}
                                                </span>
                                                <span className="text-[10px] font-bold text-slate-400">
                                                    {shift?.in} - {shift?.out}
                                                </span>
                                            </div>
                                            <div className="h-px flex-1 bg-slate-200 dark:bg-slate-800" />
                                        </div>

                                        <div className="grid grid-cols-1 gap-3">
                                            {group.rows.map((row, idx) => {
                                                const u = row.user;
                                                const key = `${u.id}_${group.code}`;
                                                const data = checklistData[key] || { status: "CHUA_CHAM", note: "", lateMinutes: 0 };

                                                return (
                                                    <div key={`${u.id}-${group.code}`} className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row md:items-center gap-4">
                                                        {/* User Info */}
                                                        <div className="flex items-center gap-3 min-w-[200px]">
                                                            <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 font-bold border border-slate-200 dark:border-slate-700 shrink-0 uppercase">
                                                                {u.name?.charAt(0)}
                                                            </div>
                                                            <div>
                                                                <p className="text-sm font-bold text-slate-900 dark:text-white truncate max-w-[150px]">{u.name}</p>
                                                                <p className="text-[11px] text-slate-500 font-medium">ID: {u.employeeId || "MT-000"}</p>
                                                            </div>
                                                        </div>

                                                        {/* Status Buttons */}
                                                        <div className="flex flex-wrap items-center gap-1.5 md:flex-1">
                                                            {[
                                                                { id: "CO_MAT", label: "Có mặt", icon: CheckCircle2 },
                                                                { id: "DI_TRE", label: "Đi trễ", icon: Clock },
                                                                { id: "NGHI_CO_PHEP", label: "Nghỉ phép", icon: Calendar },
                                                                { id: "VANG", label: "Vắng", icon: XCircle }
                                                            ].map(st => (
                                                                <button
                                                                    key={st.id}
                                                                    onClick={() => handleStatusChange(u.id, group.code, st.id)}
                                                                    className={cn(
                                                                        "px-3 py-1.5 rounded-xl text-[11px] font-bold transition-all flex items-center gap-1.5 border",
                                                                        data.status === st.id
                                                                            ? "bg-slate-900 text-white border-slate-900 shadow-lg shadow-slate-200 dark:shadow-none"
                                                                            : "bg-white dark:bg-slate-900 text-slate-500 border-slate-200 dark:border-slate-700 hover:bg-slate-50"
                                                                    )}
                                                                >
                                                                    <st.icon size={12} />
                                                                    {st.label}
                                                                </button>
                                                            ))}
                                                        </div>

                                                        {/* Inputs */}
                                                        <div className="flex items-center gap-3 md:w-64">
                                                            {data.status === "DI_TRE" && (
                                                                <div className="flex items-center gap-1.5">
                                                                    <span className="text-[10px] font-bold text-slate-400 uppercase">Phút:</span>
                                                                    <input 
                                                                        type="number"
                                                                        value={data.lateMinutes ?? 0}
                                                                        onChange={(e) => setChecklistData(prev => ({ ...prev, [key]: { ...prev[key], lateMinutes: e.target.value, isDirty: true } }))}
                                                                        className="w-12 h-8 px-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-bold text-center focus:ring-1 focus:ring-slate-300 outline-none"
                                                                    />
                                                                </div>
                                                            )}
                                                            <input 
                                                                type="text"
                                                                placeholder="Ghi chú..."
                                                                value={data.note ?? ""}
                                                                onChange={(e) => setChecklistData(prev => ({ ...prev, [key]: { ...prev[key], note: e.target.value, isDirty: true } }))}
                                                                className="flex-1 h-8 px-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-medium focus:ring-1 focus:ring-slate-300 outline-none"
                                                            />
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="px-6 py-5 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-slate-500">
                        <AlertCircle size={16} />
                        <p className="text-[11px] font-medium italic">Sau khi lưu, dữ liệu sẽ được cập nhật vào bảng tổng hợp và dashboard.</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <button 
                            onClick={onClose}
                            className="px-6 py-2.5 text-sm font-bold text-slate-600 hover:text-slate-900 transition-colors"
                        >
                            Hủy bỏ
                        </button>
                        <button 
                            disabled={isSaving || !Object.values(checklistData).some(d => d.status !== "CHUA_CHAM")}
                            onClick={handleSaveAll}
                            className="px-8 py-2.5 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 rounded-2xl text-sm font-bold flex items-center gap-2 hover:bg-slate-800 dark:hover:bg-white transition-all shadow-xl shadow-slate-200 dark:shadow-none disabled:opacity-50 disabled:bg-slate-300 active:scale-95"
                        >
                            {isSaving ? (
                                <Loader2 className="animate-spin" size={18} />
                            ) : (
                                <Save size={18} />
                            )}
                            Xác nhận Chấm công
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

function Fingerprint({ size }: { size: number }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M2 12a10 10 0 0 1 10-10"/>
            <path d="M7 12a5 5 0 0 1 5-5"/>
            <path d="M12 2a10 10 0 0 1 10 10"/>
            <path d="M12 7a5 5 0 0 1 5 5"/>
            <path d="M5 20a10 10 0 0 0 14 0"/>
            <path d="M10 15a5 5 0 0 0 4 0"/>
        </svg>
    );
}

