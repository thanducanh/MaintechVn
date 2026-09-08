"use client";

import { useState, useEffect } from "react";
import { useTheme } from "@/context/ThemeContext";
import { useAdminSettings } from "@/context/AdminSettingsContext";
import { Sun, Moon, Monitor, Languages, Bell, Check, ChevronDown, Info, Type, Settings2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { toast } from "react-hot-toast";

export default function InterfaceTab() {
    const { theme, setTheme } = useTheme();
    const { language, setLanguage, font, setFont, fontSize, setFontSize, t } = useAdminSettings();
    const [isNotificationEnabled, setIsNotificationEnabled] = useState(true);

    // Load notification state from localStorage
    useEffect(() => {
        const savedNotif = localStorage.getItem("admin-notifications-enabled");
        if (savedNotif !== null) {
            setIsNotificationEnabled(savedNotif === "true");
        }
    }, []);

    const handleApply = () => {
        localStorage.setItem("admin-theme", theme);
        localStorage.setItem("admin-notifications-enabled", isNotificationEnabled.toString());
        
        toast.success(t.common.save);
    };

    const Toggle = ({ enabled, onClick }: { enabled: boolean; onClick: () => void }) => (
        <button 
            onClick={onClick}
            className={cn(
                "relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full transition-colors outline-none",
                enabled ? "bg-blue-600" : "bg-slate-200 dark:bg-slate-800"
            )}
        >
            <span className={cn(
                "inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform shadow-sm",
                enabled ? "translate-x-5" : "translate-x-0.5"
            )} />
        </button>
    );

    const SelectWrapper = ({ label, icon: Icon, children }: { label: string, icon: any, children: React.ReactNode }) => (
        <div className="space-y-2">
            <label className="text-[13px] font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                <Icon size={14} className="text-slate-400" />
                {label}
            </label>
            <div className="relative">
                {children}
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={14} />
            </div>
        </div>
    );

    return (
        <div className="w-full space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                        {t.common.settings}
                    </h3>
                    <p className="text-xs text-slate-500 mt-1">{t.profile.pageSubtitle}</p>
                </div>
            </div>

            {/* Theme Selection */}
            <div className="space-y-6">
                <h3 className="text-[13px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">{t.common.appearance}</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {[
                        { id: 'light', label: language === 'en' ? 'Light' : 'Cháº¿ Ä‘á»™ SÃ¡ng', icon: Sun },
                        { id: 'dark', label: language === 'en' ? 'Dark' : 'Cháº¿ Ä‘á»™ Tá»‘i', icon: Moon },
                        { id: 'system', label: language === 'en' ? 'System' : 'Há»‡ thá»‘ng', icon: Monitor },
                    ].map((item) => (
                        <button
                            key={item.id}
                            onClick={() => {
                                setTheme(item.id as any);
                                localStorage.setItem("admin-theme", item.id);
                            }}
                            className={cn(
                                "flex items-center gap-4 p-4 rounded-2xl border transition-all relative group",
                                theme === item.id 
                                    ? "border-blue-600 bg-blue-50/30 dark:bg-blue-500/5 ring-1 ring-blue-600/20 shadow-sm" 
                                    : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-500 hover:border-slate-300 dark:hover:border-slate-700 shadow-sm"
                            )}
                        >
                            <div className={cn(
                                "size-10 rounded-lg flex items-center justify-center transition-colors",
                                theme === item.id ? "bg-blue-600 text-white" : "bg-slate-100 dark:bg-slate-900 text-slate-400"
                            )}>
                                <item.icon size={20} />
                            </div>
                            <span className={cn(
                                "text-sm font-bold",
                                theme === item.id ? "text-slate-900 dark:text-white" : "text-slate-500"
                            )}>{item.label}</span>
                            {theme === item.id && (
                                <div className="absolute top-3 right-3 size-4 bg-blue-600 rounded-full flex items-center justify-center text-white shadow-sm">
                                    <Check size={10} strokeWidth={4} />
                                </div>
                            )}
                        </button>
                    ))}
                </div>
            </div>

            {/* Config Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
                <SelectWrapper label={t.common.language} icon={Languages}>
                    <select 
                        value={language}
                        onChange={(e) => setLanguage(e.target.value as any)}
                        className="w-full h-10 px-3 appearance-none bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-sm font-medium text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all cursor-pointer"
                    >
                        <option value="vi">Tiáº¿ng Viá»‡t</option>
                        <option value="en">English (US)</option>
                    </select>
                </SelectWrapper>

                <SelectWrapper label={t.common.font} icon={Type}>
                    <select 
                        value={font}
                        onChange={(e) => setFont(e.target.value as any)}
                        className="w-full h-10 px-3 appearance-none bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-sm font-medium text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all cursor-pointer"
                    >
                        <option value="System">System Default</option>
                        <option value="Inter">Inter</option>
                        <option value="Roboto">Roboto</option>
                    </select>
                </SelectWrapper>

                <SelectWrapper label={t.common.fontSize} icon={Settings2}>
                    <select 
                        value={fontSize}
                        onChange={(e) => setFontSize(e.target.value as any)}
                        className="w-full h-10 px-3 appearance-none bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-sm font-medium text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all cursor-pointer"
                    >
                        <option value="small">{t.fontSize.small}</option>
                        <option value="standard">{t.fontSize.standard}</option>
                        <option value="large">{t.fontSize.large}</option>
                    </select>
                </SelectWrapper>
            </div>

            {/* Notifications */}
            <div className="space-y-6 pt-4">
                <h3 className="text-[13px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">{t.common.notifications}</h3>
                <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 divide-y divide-slate-100 dark:divide-slate-800 overflow-hidden shadow-sm">
                    <div className="flex items-center justify-between p-5 hover:bg-slate-50/50 dark:hover:bg-slate-900/20 transition-colors">
                        <div className="flex items-center gap-4">
                            <div className="size-10 rounded-xl bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center text-blue-600">
                                <Bell size={20} />
                            </div>
                            <div>
                                <p className="text-sm font-bold text-slate-900 dark:text-white">
                                    {language === 'en' ? "Enable system notifications" : "Báº­t thÃ´ng bÃ¡o há»‡ thá»‘ng"}
                                </p>
                                <p className="text-xs text-slate-500">
                                    {language === 'en' ? "Receive updates, tasks and HR information." : "Nháº­n thÃ´ng tin cáº­p nháº­t, cÃ´ng viá»‡c vÃ  nhÃ¢n sá»±."}
                                </p>
                            </div>
                        </div>
                        <Toggle 
                            enabled={isNotificationEnabled} 
                            onClick={() => setIsNotificationEnabled(!isNotificationEnabled)} 
                        />
                    </div>
                </div>
                <div className="px-1 flex items-start gap-2">
                    <Info size={14} className="text-slate-400 shrink-0 mt-0.5" />
                    <p className="text-[11px] text-slate-500 italic leading-relaxed">
                        {language === 'en' 
                            ? "Detailed notification types will be added when the module is complete." 
                            : "Chi tiáº¿t tá»«ng loáº¡i thÃ´ng bÃ¡o sáº½ Ä‘Æ°á»£c bá»• sung khi module thÃ´ng bÃ¡o hoÃ n thiá»‡n."}
                    </p>
                </div>
            </div>

            <div className="pt-8 border-t border-slate-100 dark:border-slate-800 flex justify-end">
                <Button 
                    onClick={handleApply}
                    className="bg-red-600 hover:bg-red-700 text-white font-bold px-10 h-11 rounded-xl shadow-lg shadow-red-600/20 transition-all hover:-translate-y-0.5 active:translate-y-0"
                >
                    {t.common.save}
                </Button>
            </div>
        </div>
    );
}

