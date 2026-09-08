"use client";

import * as React from "react";
import { ShieldAlert, CheckCircle2, Eye, XCircle } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { resolveSystemAlertAction, ignoreSystemAlertAction } from "@/actions/system-health";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export function SystemAlertsPanel({ initialAlerts, recentErrors }: { initialAlerts: any[], recentErrors: any[] }) {
    const [alerts, setAlerts] = React.useState(initialAlerts || []);
    const [filter, setFilter] = React.useState<"OPEN" | "RESOLVED" | "ALL">("OPEN");
    const [selectedAlert, setSelectedAlert] = React.useState<any>(null);
    const [isProcessing, setIsProcessing] = React.useState(false);

    React.useEffect(() => {
        if (initialAlerts) {
            setAlerts(initialAlerts);
        }
    }, [initialAlerts]);

    const handleResolve = async (id: number) => {
        setIsProcessing(true);
        try {
            const res = await resolveSystemAlertAction(id);
            if (res.success) {
                toast.success("Đã xử lý cảnh báo");
                setAlerts(prev => prev.map(a => a.id === id ? { ...a, status: "RESOLVED" } : a));
                if (selectedAlert?.id === id) setSelectedAlert(null);
            } else {
                toast.error(res.message);
            }
        } finally {
            setIsProcessing(false);
        }
    };

    const handleIgnore = async (id: number) => {
        setIsProcessing(true);
        try {
            const res = await ignoreSystemAlertAction(id);
            if (res.success) {
                toast.success("Đã bỏ qua cảnh báo");
                setAlerts(prev => prev.map(a => a.id === id ? { ...a, status: "IGNORED" } : a));
                if (selectedAlert?.id === id) setSelectedAlert(null);
            } else {
                toast.error(res.message);
            }
        } finally {
            setIsProcessing(false);
        }
    };

    const filteredAlerts = alerts.filter(a => {
        if (filter === "ALL") return true;
        if (filter === "OPEN") return a.status === "OPEN";
        if (filter === "RESOLVED") return a.status === "RESOLVED" || a.status === "IGNORED";
        return true;
    });

    const hasActiveAlerts = alerts.some(a => a.status === "OPEN") || recentErrors?.length > 0;

    if (!hasActiveAlerts && filter === "OPEN" && alerts.length === 0) return null;

    return (
        <Card className={`shadow-sm ${hasActiveAlerts ? 'bg-red-500/5 border-red-500/20' : 'bg-card border-border'}`}>
            <CardHeader className="pb-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-border/50">
                <div className={`flex items-center gap-2 ${hasActiveAlerts ? 'text-red-500' : 'text-slate-500'}`}>
                    <ShieldAlert size={16} className={hasActiveAlerts ? "animate-bounce" : ""} />
                    <CardTitle className="text-xs font-extrabold uppercase tracking-wide">
                        Cảnh báo & Lỗi hệ thống
                    </CardTitle>
                </div>
                <div className="flex bg-muted/50 p-1 rounded-md">
                    <button 
                        onClick={() => setFilter("OPEN")}
                        className={`text-[10px] font-bold px-2.5 py-1 rounded transition-colors ${filter === "OPEN" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
                    >
                        Đang cảnh báo
                    </button>
                    <button 
                        onClick={() => setFilter("RESOLVED")}
                        className={`text-[10px] font-bold px-2.5 py-1 rounded transition-colors ${filter === "RESOLVED" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
                    >
                        Đã xử lý
                    </button>
                    <button 
                        onClick={() => setFilter("ALL")}
                        className={`text-[10px] font-bold px-2.5 py-1 rounded transition-colors ${filter === "ALL" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
                    >
                        Tất cả
                    </button>
                </div>
            </CardHeader>
            <CardContent className="space-y-2.5 pt-3 max-h-[500px] overflow-y-auto">
                {filteredAlerts.length === 0 && filter !== "OPEN" && (
                    <div className="text-center py-6 text-xs text-muted-foreground italic">
                        Không có dữ liệu
                    </div>
                )}
                
                {filteredAlerts.map((alert: any, i: number) => (
                    <div key={`alert-${alert.id}-${i}`} className={`text-xs border-l-2 pl-3 py-2 rounded-r flex flex-col gap-2 ${
                        alert.severity === "CRITICAL" ? "border-red-500 bg-red-500/10" : 
                        alert.severity === "WARNING" ? "border-amber-500 bg-amber-500/10" : "border-blue-500 bg-blue-500/10"
                    } ${alert.status !== "OPEN" ? "opacity-60 grayscale" : ""}`}>
                        <div className="flex justify-between items-start gap-2">
                            <div>
                                <span className={`font-extrabold ${
                                    alert.severity === "CRITICAL" ? "text-red-500" : 
                                    alert.severity === "WARNING" ? "text-amber-500" : "text-blue-500"
                                }`}>
                                    {alert.title}
                                </span>
                                <p className="text-muted-foreground mt-1 text-[11px] font-medium leading-relaxed">{alert.message}</p>
                            </div>
                            <span className="text-[10px] text-muted-foreground font-black bg-muted px-1.5 py-0.5 rounded shrink-0">
                                {new Date(alert.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(alert.createdAt).toLocaleDateString('vi-VN')}
                            </span>
                        </div>
                        
                        <div className="flex items-center justify-between mt-1 pt-2 border-t border-border/10">
                            <span className="text-[9px] font-bold uppercase tracking-wider block opacity-70">
                                Tác nhân: {alert.module || "Hệ thống"} 
                                {alert.status === "RESOLVED" && alert.resolvedBy && ` • Xử lý bởi: ${alert.resolvedBy}`}
                            </span>
                            
                            {alert.status === "OPEN" && (
                                <div className="flex items-center gap-1">
                                    <button 
                                        disabled={isProcessing}
                                        onClick={() => setSelectedAlert(alert)}
                                        className="flex items-center gap-1 text-[10px] font-bold px-2 py-1 bg-background hover:bg-muted rounded text-foreground transition-colors border border-border"
                                    >
                                        <Eye size={12} /> Chi tiết
                                    </button>
                                    <button 
                                        disabled={isProcessing}
                                        onClick={() => handleResolve(alert.id)}
                                        className="flex items-center gap-1 text-[10px] font-bold px-2 py-1 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 rounded transition-colors"
                                    >
                                        <CheckCircle2 size={12} /> Xử lý
                                    </button>
                                    <button 
                                        disabled={isProcessing}
                                        onClick={() => handleIgnore(alert.id)}
                                        className="flex items-center gap-1 text-[10px] font-bold px-2 py-1 bg-slate-500/10 hover:bg-slate-500/20 text-slate-600 rounded transition-colors"
                                    >
                                        <XCircle size={12} /> Bỏ qua
                                    </button>
                                </div>
                            )}
                            {alert.status !== "OPEN" && (
                                <Badge variant="outline" className="text-[9px] uppercase font-bold px-1.5 py-0">
                                    {alert.status}
                                </Badge>
                            )}
                        </div>
                    </div>
                ))}

                {/* Show recent errors only in OPEN or ALL tabs if they exist */}
                {(filter === "OPEN" || filter === "ALL") && recentErrors?.map((err: any, i: number) => (
                    <div key={`err-${i}`} className="text-xs border-l-2 border-red-500 pl-3 py-2 bg-red-500/5 rounded-r">
                        <div className="flex justify-between items-start gap-2">
                            <div>
                                <span className="font-extrabold text-foreground">{err.action}</span>
                                <p className="text-muted-foreground mt-1 text-[11px] font-medium leading-relaxed">{err.details}</p>
                            </div>
                            <span className="text-[10px] text-muted-foreground font-black bg-muted px-1.5 py-0.5 rounded shrink-0">
                                {new Date(err.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(err.createdAt).toLocaleDateString('vi-VN')}
                            </span>
                        </div>
                        <span className="text-[9px] text-red-500 font-bold uppercase tracking-wider mt-2 block">Tác nhân: {err.user}</span>
                    </div>
                ))}
            </CardContent>

            {selectedAlert && (
                <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={() => setSelectedAlert(null)}>
                    <div className="bg-background rounded-lg shadow-lg w-full max-w-lg overflow-hidden border border-border" onClick={e => e.stopPropagation()}>
                        <div className="p-4 border-b border-border">
                            <div className="flex flex-col gap-1">
                                <h3 className="text-base font-bold flex items-center gap-2">
                                    <ShieldAlert className={selectedAlert?.severity === "CRITICAL" ? "text-red-500" : "text-amber-500"} size={18} />
                                    Chi tiết cảnh báo
                                </h3>
                                <p className="text-xs text-muted-foreground">Thông tin chi tiết về sự cố và các gợi ý xử lý</p>
                            </div>
                        </div>
                        <div className="p-4 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-xs text-muted-foreground font-bold uppercase">Loại lỗi</p>
                                    <p className="text-sm font-medium">{selectedAlert.type}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground font-bold uppercase">Mức độ</p>
                                    <Badge variant="outline" className={selectedAlert.severity === "CRITICAL" ? "text-red-500 border-red-200 bg-red-50" : "text-amber-500 border-amber-200 bg-amber-50"}>
                                        {selectedAlert.severity}
                                    </Badge>
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground font-bold uppercase">Thời gian</p>
                                    <p className="text-sm font-medium">{new Date(selectedAlert.createdAt).toLocaleString('vi-VN')}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground font-bold uppercase">Module</p>
                                    <p className="text-sm font-medium">{selectedAlert.module}</p>
                                </div>
                            </div>
                            
                            <div className="p-3 bg-muted rounded-md border border-border">
                                <p className="text-xs text-muted-foreground font-bold uppercase mb-1">Nội dung đầy đủ</p>
                                <p className="text-sm font-medium">{selectedAlert.message}</p>
                            </div>

                            <div className="p-3 bg-emerald-500/10 rounded-md border border-emerald-500/20">
                                <p className="text-xs text-emerald-600 font-bold uppercase mb-1">Gợi ý xử lý</p>
                                <p className="text-sm font-medium text-emerald-700 dark:text-emerald-400">
                                    {selectedAlert.type === "DATABASE_SIZE" && "Xóa bớt dữ liệu rác, log cũ hoặc nâng cấp gói dung lượng của Supabase."}
                                    {selectedAlert.type === "LATENCY" && "Kiểm tra kết nối mạng của server, tối ưu hóa các query nặng hoặc tăng cấu hình Database."}
                                    {(!["DATABASE_SIZE", "LATENCY"].includes(selectedAlert.type)) && "Kiểm tra lại log chi tiết của hệ thống để xác định nguyên nhân gốc rễ."}
                                </p>
                            </div>

                            <div className="flex items-center justify-end gap-2 pt-2">
                                <Button variant="outline" onClick={() => setSelectedAlert(null)}>Đóng</Button>
                                {selectedAlert.status === "OPEN" && (
                                    <>
                                        <Button variant="secondary" onClick={() => handleIgnore(selectedAlert.id)} disabled={isProcessing}>Bỏ qua</Button>
                                        <Button onClick={() => handleResolve(selectedAlert.id)} disabled={isProcessing}>Đã xử lý</Button>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </Card>
    );
}
