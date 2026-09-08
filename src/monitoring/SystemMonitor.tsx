// 📍 File: src/monitoring/SystemMonitor.tsx
"use client";

import { useState, useEffect } from "react";
import { Database, Server, Users, Zap, AlertTriangle, CheckCircle2, X, Maximize2, Globe, Cpu, UserCheck } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function SystemMonitor() {
    const [mounted, setMounted] = useState(false);
    const [showDetail, setShowDetail] = useState(false);
    
    const metrics = {
        traffic: { 
            onlineStaff: [
                { id: "1", name: "Thân Đức Anh", role: "Super Admin" }
            ],
            onlineGuests: [
                { id: "g1", name: "Khách #7a2b" },
                { id: "g2", name: "Khách #1f5e" }
            ],
            totalOnline: 3,
            dailyTotal: 1250
        },
        database: { usagePercent: "2.8", sizeMB: 14.38 },
        latency: { web: 79, vercel: 59, db: 50 },
        server: { cpuUsage: 5, ramUsedMB: 139, ramMaxMB: 1024 }
    };

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return null;

    return (
        <div className="w-full">
            {/* 🚀 COMPACT BAR */}
            <motion.div 
                whileHover={{ scale: 1.002, translateY: -2 }}
                onClick={() => setShowDetail(true)}
                className="cursor-pointer p-5 rounded-[2.5rem] bg-white border-2 border-slate-50 shadow-sm transition-all group relative overflow-hidden"
            >
                <div className="flex flex-col xl:flex-row items-center gap-6 relative z-10">
                    <div className="flex items-center gap-4 px-4 py-2 bg-slate-50 rounded-3xl border border-slate-100 shrink-0">
                        <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600 shadow-sm shrink-0">
                            <CheckCircle2 size={24} />
                        </div>
                        <div className="min-w-[140px]">
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1.5">Infrastructure</p>
                            <p className="text-[13px] font-black uppercase tracking-tight text-emerald-600">Vận hành tốt</p>
                        </div>
                    </div>

                    <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-4 w-full">
                        <div className="flex flex-col items-center justify-center p-3 rounded-[1.5rem] hover:bg-slate-50 transition-colors">
                            <span className="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Đang truy cập</span>
                            <div className="flex items-center gap-2">
                                <span className="text-3xl font-black text-slate-900 tracking-tighter">{metrics.traffic.totalOnline}</span>
                                <div className="flex flex-col leading-none">
                                    <span className="text-[8px] font-black text-blue-600 uppercase">Staff: {metrics.traffic.onlineStaff.length}</span>
                                    <span className="text-[8px] font-black text-slate-400 uppercase">Guest: {metrics.traffic.onlineGuests.length}</span>
                                </div>
                            </div>
                        </div>
                        <div className="flex flex-col items-center justify-center p-3 rounded-[1.5rem] hover:bg-slate-50 transition-colors">
                            <span className="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Storage</span>
                            <span className="text-3xl font-black tracking-tighter text-slate-900">{metrics.database.usagePercent}%</span>
                        </div>
                        <div className="flex flex-col items-center justify-center p-3 rounded-[1.5rem] hover:bg-slate-50 transition-colors">
                            <span className="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Latency</span>
                            <span className="text-3xl font-black tracking-tighter text-slate-900">{metrics.latency.web}ms</span>
                        </div>
                        <div className="flex flex-col items-center justify-center p-3 rounded-[1.5rem] hover:bg-slate-50 transition-colors">
                            <span className="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">CPU/RAM</span>
                            <span className="text-2xl font-black tracking-tighter text-slate-900">{metrics.server.cpuUsage}%/{metrics.server.ramUsedMB}MB</span>
                        </div>
                    </div>

                    <div className="w-12 h-12 rounded-2xl bg-slate-900 text-white flex items-center justify-center shadow-lg shrink-0">
                        <Maximize2 size={20} />
                    </div>
                </div>
            </motion.div>
        </div>
    );
}