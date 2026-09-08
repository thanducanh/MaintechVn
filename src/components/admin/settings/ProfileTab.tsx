"use client";

import { useState, useRef } from "react";
import { Camera, Loader2, UserCircle2, Mail, Phone, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { updateAdminProfile } from "@/actions/profile";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

export default function ProfileTab({ user }: { user: any }) {
    const [isEditing, setIsEditing] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);
    const [isUpdatingAvatar, setIsUpdatingAvatar] = useState(false);
    const [avatarPreview, setAvatarPreview] = useState(user.avatar || "");
    const [formData, setFormData] = useState({
        name: user.displayName || "",
        username: user.username || "",
        email: user.email || "",
        phone: user.phone || "",
        address: user.address || "",
    });
    
    const fileInputRef = useRef<HTMLInputElement>(null);
    const router = useRouter();

    const labelClass = "text-sm font-semibold text-slate-900 dark:text-white block mb-1.5";
    const infoValueClass = "text-sm text-slate-600 dark:text-slate-400 py-2.5 px-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 rounded-lg block w-full transition-all";
    const inputClass = "text-sm text-slate-900 dark:text-white py-2.5 px-4 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10 outline-none rounded-lg block w-full transition-all shadow-sm";

    const handleAvatarClick = () => {
        if (!isEditing) return;
        fileInputRef.current?.click();
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onloadend = () => setAvatarPreview(reader.result as string);
        reader.readAsDataURL(file);

        setIsUpdatingAvatar(true);
        try {
            const base64 = await toBase64(file) as string;
            const res = await updateAdminProfile({ displayName: formData.name, username: formData.username, email: formData.email, phone: formData.phone, address: formData.address, avatar: base64 });
            if (res.success) {
                toast.success("ÄÃ£ cáº­p nháº­t áº£nh Ä‘áº¡i diá»‡n!");
                router.refresh();
            } else {
                toast.error(res.message || "Lỗi");
            }
        } catch (error) {
            console.error("Profile avatar update error:", error);
            toast.error("Lá»—i khi táº£i áº£nh lÃªn.");
        } finally {
            setIsUpdatingAvatar(false);
        }
    };

    const toBase64 = (file: File) => new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
    });

    const handleSave = async () => {
        setIsUpdating(true);
        try {
            const res = await updateAdminProfile({ displayName: formData.name, username: formData.username, email: formData.email, phone: formData.phone, address: formData.address, avatar: avatarPreview || null });
            if (res.success) {
                toast.success("ÄÃ£ lÆ°u thay Ä‘á»•i há»“ sÆ¡!");
                setIsEditing(false);
                router.refresh();
            } else {
                toast.error(res.message || "Lỗi");
            }
        } catch (error) {
            console.error("Profile update error:", error);
            toast.error("CÃ³ lá»—i xáº£y ra khi lÆ°u.");
        } finally {
            setIsUpdating(false);
        }
    };

    const handleCancel = () => {
        setFormData({
            name: user.displayName || "",
            username: user.username || "",
            email: user.email || "",
            phone: user.phone || "",
            address: user.address || "",
        });
        setAvatarPreview(user.avatar || "");
        setIsEditing(false);
    };

    return (
        <div className="w-full space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
            {/* Header - UNIFIED STRUCTURE */}
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">ThÃ´ng tin cÃ¡ nhÃ¢n</h3>
                    <p className="text-xs text-slate-500 mt-1">Quáº£n lÃ½ cÃ¡c thÃ´ng tin cÆ¡ báº£n vÃ  áº£nh Ä‘áº¡i diá»‡n cá»§a báº¡n.</p>
                </div>
                {!isEditing ? (
                    <Button 
                        onClick={() => setIsEditing(true)}
                        variant="outline" 
                        className="h-9 px-4 text-xs font-bold border-slate-200 hover:border-red-600 hover:text-red-600 transition-colors"
                    >
                        Chá»‰nh sá»­a
                    </Button>
                ) : (
                    <div className="flex gap-2">
                        <Button 
                            onClick={handleCancel}
                            variant="ghost" 
                            className="h-9 px-4 text-xs font-bold text-slate-500"
                        >
                            Há»§y
                        </Button>
                        <Button 
                            onClick={handleSave}
                            disabled={isUpdating}
                            className="h-9 px-6 text-xs font-bold bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-600/20"
                        >
                            {isUpdating ? <Loader2 size={14} className="animate-spin mr-2" /> : null}
                            LÆ°u thay Ä‘á»•i
                        </Button>
                    </div>
                )}
            </div>

            {/* Avatar Section - gap-6 matching overview grids */}
            <div className="flex flex-col sm:flex-row items-center gap-6 p-6 rounded-2xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 shadow-sm">
                <div className={cn("relative group", isEditing && "cursor-pointer")} onClick={handleAvatarClick}>
                    <div className={cn(
                        "size-24 rounded-xl bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 shadow-md overflow-hidden relative flex items-center justify-center transition-transform",
                        isEditing && "group-hover:scale-[1.02] border-blue-600/50"
                    )}>
                        {avatarPreview ? (
                            <img src={avatarPreview} className="size-full object-cover" alt={user.name} />
                        ) : (
                            <div className="size-full flex items-center justify-center bg-slate-100 dark:bg-slate-700 text-slate-300 dark:text-slate-500 text-3xl font-bold">
                                {formData.name.charAt(0)}
                            </div>
                        )}
                        {isEditing && (
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white gap-1">
                                {isUpdatingAvatar ? <Loader2 size={20} className="animate-spin" /> : <Camera size={20} />}
                                <span className="text-[10px] font-bold">Äá»•i áº£nh</span>
                            </div>
                        )}
                    </div>
                    <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
                    {isEditing && avatarPreview && (
                        <button type="button" onClick={async () => { setAvatarPreview(""); await updateAdminProfile({ displayName: formData.name, username: formData.username, avatar: null }); router.refresh(); }} className="mt-2 text-xs font-semibold text-red-600 hover:text-red-700">XÃ³a avatar</button>
                    )}
                </div>
                <div className="flex-1 text-center sm:text-left space-y-1">
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">{formData.name}</h3>
                    <p className="text-sm text-slate-500">{formData.email || "ChÆ°a cáº­p nháº­t email"}</p>
                </div>
            </div>

            {/* Basic Info Body */}
            <div className="w-full space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-2">
                        <label className={labelClass}>Há» vÃ  tÃªn</label>
                        {isEditing ? (
                            <input 
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className={inputClass}
                            />
                        ) : (
                            <div className={infoValueClass}>{formData.name}</div>
                        )}
                    </div>
                    <div className="space-y-2">
                        <label className={labelClass}>MÃ£ nhÃ¢n viÃªn</label>
                        <div className={cn(infoValueClass, "font-mono text-xs opacity-70 bg-slate-100/50")}>
                            {isEditing ? (
                                <input value={formData.username} onChange={(e) => setFormData({ ...formData, username: e.target.value })} className={inputClass} />
                            ) : `@${formData.username}`}
                        </div>
                        <p className="text-[10px] text-slate-400 italic">MÃ£ nhÃ¢n viÃªn do há»‡ thá»‘ng quáº£n lÃ½.</p>
                    </div>
                    <div className="space-y-2">
                        <label className={labelClass}>Äá»‹a chá»‰ Email</label>
                        {isEditing ? (
                            <input 
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                className={inputClass}
                            />
                        ) : (
                            <div className={infoValueClass}>{formData.email || "---"}</div>
                        )}
                    </div>
                    <div className="space-y-2">
                        <label className={labelClass}>Sá»‘ Ä‘iá»‡n thoáº¡i</label>
                        {isEditing ? (
                            <input 
                                value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                className={inputClass}
                            />
                        ) : (
                            <div className={infoValueClass}>{formData.phone || "---"}</div>
                        )}
                    </div>
                </div>

                <div className="space-y-2">
                    <label className={labelClass}>TÃªn Ä‘Äƒng nháº­p</label>
                    {isEditing ? (
                        <input value={formData.username} onChange={(e) => setFormData({ ...formData, username: e.target.value })} className={inputClass} />
                    ) : (
                        <div className={infoValueClass}>@{formData.username}</div>
                    )}
                </div>

                {/* Address */}
                <div className="space-y-2">
                    <label className={labelClass}>Äá»‹a chá»‰ liÃªn há»‡</label>
                    <div className="relative">
                        {isEditing ? (
                            <input 
                                value={formData.address}
                                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                className={cn(inputClass, "pl-11")}
                            />
                        ) : (
                            <div className={cn(infoValueClass, "pl-11")}>{formData.address || "ChÆ°a cáº­p nháº­t Ä‘á»‹a chá»‰"}</div>
                        )}
                        <MapPin size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                    </div>
                </div>
            </div>
        </div>
    );
}

