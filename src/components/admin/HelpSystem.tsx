"use client";

import React, { useState } from "react";
import { 
  HelpCircle, 
  Sparkles, 
  Activity, 
  ShieldAlert, 
  BookOpen, 
  Info, 
  ChevronDown, 
  ChevronUp, 
  AlertTriangle,
  Lock,
  Terminal
} from "lucide-react";
import { useAdminSettings } from "@/context/AdminSettingsContext";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

// Types
export type HelpModule = "payroll" | "accounting" | "legal" | "projects" | "CMS" | "HR";

// Role mapping
const MODULE_ROLES: Record<HelpModule, string[]> = {
    payroll: ["ADMIN", "GIAM_DOC", "TRUONG_PHONG_KE_TOAN", "NV_KE_TOAN", "TRUONG_PHONG_NHAN_SU", "NV_NHAN_SU"],
    accounting: ["ADMIN", "GIAM_DOC", "TRUONG_PHONG_KE_TOAN", "NV_KE_TOAN"],
    legal: ["ADMIN", "GIAM_DOC", "TRUONG_PHONG_KE_TOAN", "NV_KE_TOAN"],
    projects: ["ADMIN", "GIAM_DOC", "TRUONG_PHONG_KE_TOAN", "NV_KE_TOAN", "TRUONG_PHONG_NHAN_SU", "NV_NHAN_SU", "CHUYEN_VIEN_KY_THUAT", "NV_KY_THUAT"],
    CMS: ["ADMIN", "GIAM_DOC"],
    HR: ["ADMIN", "GIAM_DOC", "TRUONG_PHONG_NHAN_SU", "NV_NHAN_SU"]
};

// Helper to determine if user has access to a module
export function hasModuleAccess(userRole: string | undefined | null, moduleName: HelpModule): boolean {
    const role = userRole?.toUpperCase() || "NHAN_VIEN";
    if (role === "ADMIN" || role === "GIAM_DOC") return true;
    const allowed = MODULE_ROLES[moduleName];
    return allowed ? allowed.includes(role) : false;
}

// Helper to determine if a specific help block is visible based on user and block roles
export function isHelpVisible(
    userRole: string | undefined | null,
    moduleName: HelpModule,
    allowedRoles?: string[]
): boolean {
    const role = userRole?.toUpperCase() || "NHAN_VIEN";

    // Check if the user has access to this module
    if (!hasModuleAccess(role, moduleName)) {
        return false;
    }

    // If there are specific roles allowed for this block, check against userRole
    if (allowedRoles && allowedRoles.length > 0) {
        // Expand general groups like 'KE_TOAN', 'NHAN_SU', 'KY_THUAT'
        const expandedAllowedRoles = allowedRoles.flatMap(r => {
            const up = r.toUpperCase();
            if (up === "KE_TOAN") return ["TRUONG_PHONG_KE_TOAN", "NV_KE_TOAN"];
            if (up === "NHAN_SU") return ["TRUONG_PHONG_NHAN_SU", "NV_NHAN_SU"];
            if (up === "KY_THUAT") return ["CHUYEN_VIEN_KY_THUAT", "NV_KY_THUAT"];
            return [up];
        });

        // ADMIN and GIAM_DOC always bypass block-level restrictions unless they explicitly shouldn't
        if (role === "ADMIN" || role === "GIAM_DOC") {
            return true;
        }

        return expandedAllowedRoles.includes(role);
    }

    return true;
}

interface CommonHelpProps {
    module: HelpModule;
    userRole: string | undefined | null;
    roles?: string[];
    className?: string;
}

// ==========================================
// 1. HELP TOOLTIP COMPONENT
// ==========================================
interface HelpTooltipProps extends CommonHelpProps {
    textKey: "generalHelp" | "permissionNote" | "adminTip" | "workflowNote" | "securityWarning";
    customText?: string;
}

export function HelpTooltip({ module, userRole, roles, textKey, customText, className }: HelpTooltipProps) {
    const { t } = useAdminSettings();
    
    if (!isHelpVisible(userRole, module, roles)) {
        return null;
    }

    const dict = t.helpSystem?.modules?.[module];
    const tooltipText = customText || dict?.[textKey] || "Help information";

    return (
        <Tooltip>
            <TooltipTrigger asChild>
                <button 
                    type="button"
                    className={cn(
                        "inline-flex items-center justify-center text-muted-foreground hover:text-slate-900 dark:hover:text-slate-100 transition-colors focus:outline-none focus:ring-2 focus:ring-slate-300 dark:focus:ring-slate-700 rounded-full p-0.5",
                        className
                    )}
                >
                    <HelpCircle size={14} className="stroke-[2.2]" />
                </button>
            </TooltipTrigger>
            <TooltipContent 
                side="top" 
                className="max-w-xs bg-slate-900 dark:bg-slate-950 text-slate-100 border border-slate-800 p-2.5 shadow-xl rounded-lg text-xs leading-relaxed"
            >
                {tooltipText}
            </TooltipContent>
        </Tooltip>
    );
}

// ==========================================
// 2. INLINE HINT COMPONENT
// ==========================================
interface InlineHintProps extends CommonHelpProps {
    textKey: "generalHelp" | "permissionNote" | "adminTip" | "workflowNote" | "securityWarning";
    customText?: string;
}

export function InlineHint({ module, userRole, roles, textKey, customText, className }: InlineHintProps) {
    const { t } = useAdminSettings();
    
    if (!isHelpVisible(userRole, module, roles)) {
        return null;
    }

    const dict = t.helpSystem?.modules?.[module];
    const hintText = customText || dict?.[textKey];

    if (!hintText) return null;

    return (
        <p className={cn("mt-1.5 text-[11px] text-muted-foreground flex items-start gap-1.5 leading-normal", className)}>
            <Info size={12} className="shrink-0 text-slate-400 dark:text-slate-500 mt-0.5" />
            <span>{hintText}</span>
        </p>
    );
}

// ==========================================
// 3. WARNING NOTICE COMPONENT
// ==========================================
interface WarningNoticeProps extends CommonHelpProps {
    textKey?: "generalHelp" | "permissionNote" | "adminTip" | "workflowNote" | "securityWarning";
    customText?: string;
    type?: "warning" | "destructive" | "info";
}

export function WarningNotice({ module, userRole, roles, textKey, customText, type = "warning", className }: WarningNoticeProps) {
    const { t } = useAdminSettings();
    
    if (!isHelpVisible(userRole, module, roles)) {
        return null;
    }

    const dict = t.helpSystem?.modules?.[module];
    const noticeText = customText || (textKey ? dict?.[textKey] : null);

    if (!noticeText) return null;

    const isDestructive = type === "destructive";
    const isInfo = type === "info";

    return (
        <div 
            className={cn(
                "rounded-xl border p-4 text-xs flex items-start gap-3 shadow-sm transition-all duration-300",
                isDestructive
                    ? "bg-rose-50/50 dark:bg-rose-950/10 border-rose-500/20 text-rose-800 dark:text-rose-300"
                    : isInfo
                        ? "bg-blue-50/50 dark:bg-blue-950/10 border-blue-500/20 text-blue-800 dark:text-blue-300"
                        : "bg-amber-50/50 dark:bg-amber-950/10 border-amber-500/20 text-amber-800 dark:text-amber-300",
                className
            )}
        >
            {isDestructive ? (
                <ShieldAlert size={16} className="shrink-0 text-rose-500 dark:text-rose-400 mt-0.5" />
            ) : isInfo ? (
                <Info size={16} className="shrink-0 text-blue-500 dark:text-blue-400 mt-0.5" />
            ) : (
                <AlertTriangle size={16} className="shrink-0 text-amber-500 dark:text-amber-400 mt-0.5" />
            )}
            <div className="space-y-0.5">
                <span className="font-semibold block uppercase tracking-wider text-[10px]">
                    {isDestructive 
                        ? t.helpSystem?.securityWarningsTitle || "Security Warning" 
                        : isInfo 
                            ? "Information" 
                            : t.helpSystem?.adminTipsTitle || "Notice"}
                </span>
                <p className="leading-relaxed font-medium">{noticeText}</p>
            </div>
        </div>
    );
}

// ==========================================
// 4. MODULE INTRO CARD COMPONENT
// ==========================================
export function ModuleIntroCard({ module, userRole, roles, className }: CommonHelpProps) {
    const { t } = useAdminSettings();
    const role = userRole?.toUpperCase() || "NHAN_VIEN";
    const isAdmin = role === "ADMIN" || role === "GIAM_DOC";
    
    if (!isHelpVisible(userRole, module, roles)) {
        return null;
    }

    const dict = t.helpSystem?.modules?.[module];
    if (!dict) return null;

    return (
        <div 
            className={cn(
                "rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-900/10 p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all duration-300 hover:shadow-sm relative overflow-hidden",
                className
            )}
        >
            {/* Subtle light effect for Premium feel */}
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-slate-200/20 to-transparent dark:from-slate-800/10 pointer-events-none rounded-bl-full" />
            
            <div className="flex items-start gap-4">
                <div className="h-10 w-10 shrink-0 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200/50 dark:border-slate-700/50 flex items-center justify-center text-slate-600 dark:text-slate-400">
                    <BookOpen size={20} className="stroke-[1.8]" />
                </div>
                <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="text-sm font-semibold tracking-tight text-foreground">{dict.introTitle}</h4>
                        {isAdmin && (
                            <span className="text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider bg-slate-200/50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                                Admin View
                            </span>
                        )}
                    </div>
                    <p className="text-xs text-muted-foreground max-w-2xl leading-relaxed">{dict.introDesc}</p>
                </div>
            </div>
        </div>
    );
}

// ==========================================
// 5. HELP ACCORDION COMPONENT
// ==========================================
export function HelpAccordion({ module, userRole, roles, className }: CommonHelpProps) {
    const { t } = useAdminSettings();
    const [openIndex, setOpenIndex] = useState<number | null>(null);
    const role = userRole?.toUpperCase() || "NHAN_VIEN";
    const isAdmin = role === "ADMIN" || role === "GIAM_DOC";

    if (!isHelpVisible(userRole, module, roles)) {
        return null;
    }

    const dict = t.helpSystem?.modules?.[module];
    const devNote = t.helpSystem?.devNotes?.[module];
    if (!dict) return null;

    // Define items to render in accordion
    const items = [
        {
            title: t.sidebar?.dashboard || "General Information",
            content: dict.generalHelp,
            icon: Info,
            visible: true
        },
        {
            title: t.helpSystem?.workflowNotesTitle || "Workflow Guidelines",
            content: dict.workflowNote,
            icon: Activity,
            // Visible to Admin/Giám Đốc or roles that have access
            visible: isAdmin || hasModuleAccess(role, module)
        },
        {
            title: t.helpSystem?.permissionNotesTitle || "Permission & Settings",
            content: dict.permissionNote,
            icon: Lock,
            visible: true
        },
        {
            title: t.helpSystem?.adminTipsTitle || "Admin Tips",
            content: dict.adminTip,
            icon: Sparkles,
            // Only visible to ADMIN and GIAM_DOC
            visible: isAdmin
        },
        {
            title: t.helpSystem?.securityWarningsTitle || "Security Warning",
            content: dict.securityWarning,
            icon: ShieldAlert,
            // Only visible to ADMIN and GIAM_DOC
            visible: isAdmin
        },
        {
            title: t.helpSystem?.devNotesTitle || "Developer Notes",
            content: devNote,
            icon: Terminal,
            // Developer stack is highly private, strictly hidden from normal users
            visible: isAdmin
        }
    ].filter(item => item.visible && item.content);

    if (items.length === 0) return null;

    const toggleItem = (index: number) => {
        setOpenIndex(openIndex === index ? null : index);
    };

    return (
        <div className={cn("border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden bg-card transition-all duration-300", className)}>
            {items.map((item, idx) => {
                const isOpen = openIndex === idx;
                const Icon = item.icon;
                const isDevNote = item.title === t.helpSystem?.devNotesTitle;
                const isSecurity = item.title === t.helpSystem?.securityWarningsTitle;

                return (
                    <div key={idx} className="border-b border-slate-200 dark:border-slate-800 last:border-b-0">
                        <button
                            type="button"
                            onClick={() => toggleItem(idx)}
                            className={cn(
                                "w-full px-5 py-3.5 flex items-center justify-between text-left text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors focus:outline-none",
                                isOpen ? "bg-slate-50/50 dark:bg-slate-900/30" : ""
                            )}
                        >
                            <span className="flex items-center gap-2.5">
                                <Icon size={14} className={cn(
                                    "shrink-0",
                                    isDevNote 
                                        ? "text-blue-500" 
                                        : isSecurity 
                                            ? "text-rose-500" 
                                            : "text-slate-400 dark:text-slate-500"
                                )} />
                                <span>{item.title}</span>
                            </span>
                            {isOpen ? (
                                <ChevronUp size={14} className="text-slate-400" />
                            ) : (
                                <ChevronDown size={14} className="text-slate-400" />
                            )}
                        </button>
                        
                        {isOpen && (
                            <div className={cn(
                                "px-5 py-4 text-xs leading-relaxed border-t border-slate-200/50 dark:border-slate-800/50 font-medium",
                                isDevNote 
                                    ? "bg-slate-950 font-mono text-blue-400 border-slate-950 p-4 rounded-b-none" 
                                    : "text-muted-foreground bg-white dark:bg-slate-900/10"
                            )}>
                                {item.content}
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
}
