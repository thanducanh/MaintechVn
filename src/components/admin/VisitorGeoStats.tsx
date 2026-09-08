"use client";

// 📍 File: src/components/admin/VisitorGeoStats.tsx
// Widget độc lập hiển thị thống kê khách truy cập THẬT theo quốc gia/thành phố
// (dữ liệu lấy từ bảng PageViewLog, không bị xóa sau 24h như VisitorSession).

import { useEffect, useState } from "react";
import { Globe2, MapPin } from "lucide-react";
import { getVisitorGeoStatsAction } from "@/actions/system-health";

export default function VisitorGeoStats() {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getVisitorGeoStatsAction(30).then((res) => {
            if (res.success) setData(res.data);
            setLoading(false);
        });
    }, []);

    return (
        <div className="w-full overflow-hidden rounded-2xl shadow-xl border border-border bg-card flex flex-col mb-6">
            <div className="border-b border-border bg-muted/50 dark:bg-slate-900/80 px-8 py-6 flex justify-between items-center">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-background rounded-xl flex items-center justify-center border border-border shadow-inner">
                        <Globe2 size={24} className="text-blue-500" />
                    </div>
                    <div>
                        <h2 className="text-xl font-black uppercase tracking-tighter leading-none mb-1.5 text-foreground">
                            Khách truy cập website (30 ngày qua)
                        </h2>
                        <span className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground">
                            Định vị theo IP — dữ liệu thật
                        </span>
                    </div>
                </div>
                {data && (
                    <div className="text-right">
                        <p className="text-3xl font-black text-foreground leading-none">{data.totalVisits}</p>
                        <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground mt-1">Tổng lượt • Hôm nay: {data.todayVisits}</p>
                    </div>
                )}
            </div>

            <div className="p-6 lg:p-8 grid md:grid-cols-2 gap-6 bg-background">
                <div>
                    <h3 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-3">Theo quốc gia</h3>
                    {loading ? (
                        <p className="text-sm text-muted-foreground">Đang tải...</p>
                    ) : !data?.topCountries?.length ? (
                        <p className="text-sm text-muted-foreground">Chưa có dữ liệu.</p>
                    ) : (
                        <div className="space-y-2">
                            {data.topCountries.map((c: any) => (
                                <div key={c.country} className="flex items-center justify-between text-sm bg-muted/40 rounded-lg px-3 py-2">
                                    <span className="font-bold text-foreground flex items-center gap-2">
                                        <Globe2 size={13} className="text-muted-foreground" /> {c.country}
                                    </span>
                                    <span className="font-black text-foreground">{c.count}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
                <div>
                    <h3 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-3">Theo thành phố</h3>
                    {loading ? (
                        <p className="text-sm text-muted-foreground">Đang tải...</p>
                    ) : !data?.topCities?.length ? (
                        <p className="text-sm text-muted-foreground">Chưa có dữ liệu.</p>
                    ) : (
                        <div className="space-y-2">
                            {data.topCities.map((c: any) => (
                                <div key={c.city} className="flex items-center justify-between text-sm bg-muted/40 rounded-lg px-3 py-2">
                                    <span className="font-bold text-foreground flex items-center gap-2">
                                        <MapPin size={13} className="text-muted-foreground" /> {c.city}
                                    </span>
                                    <span className="font-black text-foreground">{c.count}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
