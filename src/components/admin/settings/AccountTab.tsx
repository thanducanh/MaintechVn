"use client";

import { useState } from "react";
import { ShieldCheck, Lock, Calendar, Key, Loader2, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { toast } from "react-hot-toast";
import { changeAdminPassword } from "@/actions/profile";

export default function AccountTab({ user }: { user: any }) {
    const [isChangingPassword, setIsChangingPassword] = useState(false);
    const [passwordData, setPasswordData] = useState({
        current: "",
        new: "",
        confirm: ""
    });
    const [isUpdating, setIsUpdating] = useState(false);
    const [showPassword, setShowPassword] = useState({ current: false, new: false, confirm: false });

    const canEditUsername = user.role === "ADMIN" || user.role === "SUPERADMIN" || user.role === "GIAM_DOC" || user.role === "QUAN_TRI";

    const labelClass = "text-sm font-semibold text-slate-900 dark:text-white block mb-1.5";
    const infoValueClass = "text-sm text-slate-600 dark:text-slate-400 py-2.5 px-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 rounded-lg block w-full transition-colors";
    const inputClass = "text-sm text-slate-900 dark:text-white py-2.5 px-4 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10 outline-none rounded-lg block w-full transition-all shadow-sm";

    const handlePasswordChange = async () => {
        if (!passwordData.current || !passwordData.new || !passwordData.confirm) {
            toast.error("Vui lÃ²ng Ä‘iá»n Ä‘áº§y Ä‘á»§ thÃ´ng tin máº­t kháº©u.");
            return;
        }
        if (passwordData.new !== passwordData.confirm) {
            toast.error("Máº­t kháº©u má»›i khÃ´ng khá»›p.");
            return;
        }
        if (passwordData.new.length < 6) {
            toast.error("Máº­t kháº©u pháº£i cÃ³ Ã­t nháº¥t 6 kÃ½ tá»±.");
            return;
        }

        setIsUpdating(true);
        try {
            // Mock call to change password
            const result = await changeAdminPassword({ currentPassword: passwordData.current, newPassword: passwordData.new });
            if (!result.success) {
                toast.error(result.message || "Lỗi");
                return;
            }
            toast.success("Äá»•i máº­t kháº©u thÃ nh cÃ´ng!");
            setIsChangingPassword(false);
            setPasswordData({ current: "", new: "", confirm: "" });
        } catch (error) {
            toast.error("CÃ³ lá»—i xáº£y ra khi Ä‘á»•i máº­t kháº©u.");
        } finally {
            setIsUpdating(false);
        }
    };

    return (
        <div className="w-full space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
            {/* Header - EXACT SAME STRUCTURE AS ATTENDANCE/PAYROLL */}
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">TÃ i khoáº£n & Báº£o máº­t</h3>
                    <p className="text-xs text-slate-500 mt-1">Quáº£n lÃ½ cÃ¡c thiáº¿t láº­p Ä‘Äƒng nháº­p vÃ  thÃ´ng tin Ä‘á»‹nh danh cá»§a báº¡n.</p>
                </div>
            </div>

            {/* Account Overview Grid - gap-6 matching Payroll */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                    { label: "Tráº¡ng thÃ¡i", value: "Äang hoáº¡t Ä‘á»™ng", icon: ShieldCheck, status: true },
                    { label: "Vai trÃ²", value: user.role?.replace(/_/g, " ") || "NHÃ‚N VIÃŠN", icon: ShieldCheck, color: "text-blue-500" },
                    { label: "ÄÄƒng nháº­p", value: "HÃ´m nay, 08:30", icon: Calendar, color: "text-slate-400" },
                ].map((item, idx) => (
                    <div key={idx} className="p-4 rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950 shadow-sm flex flex-col gap-1 transition-all hover:shadow-md">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{item.label}</span>
                        <div className={cn(
                            "text-sm font-bold flex items-center gap-2",
                            item.status ? "text-emerald-600" : "text-slate-900 dark:text-white"
                        )}>
                            {item.status && <div className="size-2 rounded-full bg-emerald-500" />}
                            {!item.status && <item.icon size={14} className={item.color} />}
                            {item.value}
                        </div>
                    </div>
                ))}
            </div>

            {/* Content Body - Removed top-level separator to match others */}
            <div className="space-y-8 w-full">
                {/* Username Section */}
                <div className="space-y-4">
                    <div className="flex items-center gap-2 px-1">
                        <Key size={16} className="text-slate-400" />
                        <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-widest">TÃªn Ä‘Äƒng nháº­p</h4>
                    </div>
                    <div className="space-y-2">
                        {canEditUsername ? (
                            <div className="flex gap-2">
                                <input className={inputClass} defaultValue={user.username} />
                                <Button variant="outline" className="h-10 px-4 text-xs font-bold border-slate-200">Cáº­p nháº­t</Button>
                            </div>
                        ) : (
                            <>
                                <div className={cn(infoValueClass, "bg-slate-100/50 dark:bg-slate-800/50 opacity-80 cursor-not-allowed")}>
                                    @{user.username}
                                </div>
                                <p className="text-[10px] text-slate-400 italic">TÃªn Ä‘Äƒng nháº­p do quáº£n trá»‹ há»‡ thá»‘ng quáº£n lÃ½.</p>
                            </>
                        )}
                    </div>
                </div>

                {/* Password Section */}
                <div className="space-y-4">
                    <div className="flex items-center gap-2 px-1">
                        <Lock size={16} className="text-slate-400" />
                        <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-widest">Äá»•i máº­t kháº©u</h4>
                    </div>

                    {!isChangingPassword ? (
                        <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 flex items-center justify-between shadow-sm">
                            <p className="text-xs text-slate-500">NÃªn Ä‘á»•i máº­t kháº©u Ä‘á»‹nh ká»³ 3 thÃ¡ng/láº§n Ä‘á»ƒ báº£o máº­t tá»‘t nháº¥t.</p>
                            <Button 
                                onClick={() => setIsChangingPassword(true)}
                                variant="outline" 
                                className="h-9 px-4 text-xs font-bold border-slate-200 hover:border-red-600 hover:text-red-600 transition-colors"
                            >
                                Äá»•i máº­t kháº©u
                            </Button>
                        </div>
                    ) : (
                        <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-900/10 space-y-4 shadow-sm">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 uppercase px-1">Máº­t kháº©u hiá»‡n táº¡i</label>
                                <div className="relative">
                                    <input type={showPassword.current ? "text" : "password"} className={cn(inputClass, "pr-11")} placeholder="â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢" value={passwordData.current} onChange={(e) => setPasswordData({ ...passwordData, current: e.target.value })} />
                                    <button type="button" aria-label={showPassword.current ? "áº¨n máº­t kháº©u hiá»‡n táº¡i" : "Hiá»‡n máº­t kháº©u hiá»‡n táº¡i"} onClick={() => setShowPassword((state) => ({ ...state, current: !state.current }))} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200">
                                        {showPassword.current ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase px-1">Máº­t kháº©u má»›i</label>
                                    <div className="relative">
                                        <input type={showPassword.new ? "text" : "password"} className={cn(inputClass, "pr-11")} placeholder="â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢" value={passwordData.new} onChange={(e) => setPasswordData({ ...passwordData, new: e.target.value })} />
                                        <button type="button" aria-label={showPassword.new ? "áº¨n máº­t kháº©u má»›i" : "Hiá»‡n máº­t kháº©u má»›i"} onClick={() => setShowPassword((state) => ({ ...state, new: !state.new }))} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200">
                                            {showPassword.new ? <EyeOff size={16} /> : <Eye size={16} />}
                                        </button>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase px-1">XÃ¡c nháº­n máº­t kháº©u</label>
                                    <div className="relative">
                                        <input type={showPassword.confirm ? "text" : "password"} className={cn(inputClass, "pr-11")} placeholder="â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢" value={passwordData.confirm} onChange={(e) => setPasswordData({ ...passwordData, confirm: e.target.value })} />
                                        <button type="button" aria-label={showPassword.confirm ? "áº¨n xÃ¡c nháº­n máº­t kháº©u" : "Hiá»‡n xÃ¡c nháº­n máº­t kháº©u"} onClick={() => setShowPassword((state) => ({ ...state, confirm: !state.confirm }))} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200">
                                            {showPassword.confirm ? <EyeOff size={16} /> : <Eye size={16} />}
                                        </button>
                                    </div>
                                </div>
                            </div>
                            <div className="pt-2 flex justify-end gap-2">
                                <Button 
                                    onClick={() => setIsChangingPassword(false)}
                                    variant="ghost" 
                                    className="h-9 px-4 text-xs font-bold text-slate-500"
                                >
                                    Há»§y
                                </Button>
                                <Button 
                                    onClick={handlePasswordChange}
                                    disabled={isUpdating}
                                    className="h-9 px-6 text-xs font-bold bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-600/20"
                                >
                                    {isUpdating ? <Loader2 size={14} className="animate-spin mr-2" /> : null}
                                    Cáº­p nháº­t máº­t kháº©u
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}


