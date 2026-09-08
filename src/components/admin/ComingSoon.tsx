// 📍 File: src/components/admin/ComingSoon.tsx
"use client";

import { motion } from "framer-motion";
import { Construction, ArrowLeft } from "lucide-react";
import Link from "next/link";

interface ComingSoonProps {
    title: string;
    description?: string;
    backHref?: string;
    features?: string[];
    color?: string;
}

export default function ComingSoon({ 
    title, 
    description, 
    backHref = "/admin",
    features = [],
    color = "indigo"
}: ComingSoonProps) {
    const colorMap: Record<string, { bg: string; text: string; border: string; badge: string }> = {
        indigo:  { bg: "bg-indigo-50",  text: "text-indigo-600",  border: "border-indigo-200",  badge: "bg-indigo-600" },
        emerald: { bg: "bg-emerald-50", text: "text-emerald-600", border: "border-emerald-200", badge: "bg-emerald-600" },
        amber:   { bg: "bg-amber-50",   text: "text-amber-600",   border: "border-amber-200",   badge: "bg-amber-600" },
        violet:  { bg: "bg-violet-50",  text: "text-violet-600",  border: "border-violet-200",  badge: "bg-violet-600" },
        red:     { bg: "bg-red-50",     text: "text-premium-red drop-shadow-md",     border: "border-red-200",     badge: "bg-premium-red" },
        sky:     { bg: "bg-sky-50",     text: "text-sky-600",     border: "border-sky-200",     badge: "bg-sky-600" },
    };
    const c = colorMap[color] || colorMap.indigo;

    return (
        <div className="flex flex-col items-center justify-center min-h-[70vh] px-4 animate-in fade-in duration-500">
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="text-center max-w-xl w-full"
            >
                {/* Icon */}
                <motion.div
                    animate={{ rotate: [0, -5, 5, -5, 0] }}
                    transition={{ repeat: Infinity, repeatDelay: 3, duration: 0.5 }}
                    className={`inline-flex items-center justify-center w-24 h-24 rounded-3xl ${c.bg} ${c.border} border-2 mb-8 shadow-sm`}
                >
                    <Construction size={44} className={c.text} />
                </motion.div>

                {/* Badge */}
                <div className="flex items-center justify-center gap-2 mb-4">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-widest text-white ${c.badge} shadow-sm`}>
                        <span className="w-1.5 h-1.5 rounded-full bg-white/70 animate-pulse" />
                        Đang phát triển
                    </span>
                </div>

                {/* Title */}
                <h1 className="text-3xl md:text-4xl font-black text-slate-800 uppercase tracking-tighter mb-3">
                    {title}
                </h1>
                <p className="text-slate-500 text-sm font-medium leading-relaxed mb-8">
                    {description || "Tính năng này đang trong quá trình phát triển và sẽ ra mắt trong thời gian sớm nhất. Chúng tôi đang nỗ lực hoàn thiện để mang đến trải nghiệm tốt nhất cho bạn."}
                </p>

                {/* Feature list */}
                {features.length > 0 && (
                    <div className={`text-left rounded-2xl border ${c.border} ${c.bg} p-5 mb-8 shadow-sm`}>
                        <p className={`text-[11px] font-black uppercase tracking-widest ${c.text} mb-3`}>
                            Tính năng sẽ có:
                        </p>
                        <ul className="space-y-2">
                            {features.map((f, i) => (
                                <li key={i} className="flex items-center gap-2.5 text-slate-600 text-sm font-medium">
                                    <span className={`w-1.5 h-1.5 rounded-full ${c.badge} shrink-0`} />
                                    {f}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {/* Progress bar decoration */}
                <div className="w-full bg-slate-100 rounded-full h-1.5 mb-8 overflow-hidden">
                    <motion.div
                        className={`h-full rounded-full ${c.badge}`}
                        initial={{ width: "0%" }}
                        animate={{ width: "40%" }}
                        transition={{ duration: 1.5, ease: "easeOut", delay: 0.5 }}
                    />
                </div>

                <Link
                    href={backHref}
                    className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-800 font-bold text-sm transition-colors"
                >
                    <ArrowLeft size={16} />
                    Quay lại
                </Link>
            </motion.div>
        </div>
    );
}
