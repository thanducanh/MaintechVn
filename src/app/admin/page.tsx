// ðŸ“ File: src/app/admin/page.tsx
import { getCurrentUser } from "@/lib/auth";
import { getVisitorGeoStatsAction } from "@/actions/system-health";
import { getInquiryAndCallStatsAction } from "@/actions/contact";
import Link from "next/link";
import { Globe2, Inbox, PhoneCall, Users2, ArrowUpRight } from "lucide-react";

export const dynamic = "force-dynamic";
export const revalidate = 0;

function StatCard({ icon: Icon, label, value, href }: { icon: any; label: string; value: number | string; href: string }) {
    return (
        <Link
            href={href}
            className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex items-center justify-between hover:border-[#C8102E]/40 hover:shadow-md transition-all group"
        >
            <div>
                <p className="text-3xl font-black text-slate-900 leading-none">{value}</p>
                <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mt-2">{label}</p>
            </div>
            <div className="w-11 h-11 rounded-xl bg-slate-50 flex items-center justify-center group-hover:bg-[#C8102E] transition-colors">
                <Icon size={20} className="text-slate-400 group-hover:text-white transition-colors" />
            </div>
        </Link>
    );
}

const QUICK_LINKS = [
    { title: "Trang chá»§", href: "/admin/cms/homepage" },
    { title: "Giá»›i thiá»‡u", href: "/admin/cms/about" },
    { title: "Dá»‹ch vá»¥", href: "/admin/cms/services" },
    { title: "Tin tá»©c", href: "/admin/cms/articles" },
    { title: "LiÃªn há»‡ (cÃ i Ä‘áº·t)", href: "/admin/cms/contact" },
    { title: "áº¢nh website", href: "/admin/cms/images" },
];

export default async function AdminDashboardPage() {
    const currentUser = await getCurrentUser();
    const [visitorRes, inquiryRes] = await Promise.all([
        getVisitorGeoStatsAction(30),
        getInquiryAndCallStatsAction(),
    ]);

    const visitorData: any = visitorRes.success ? visitorRes.data : { totalVisits: 0, todayVisits: 0, topCountries: [], topCities: [] };
    const inquiryData: any = inquiryRes.success ? inquiryRes.data : { inquiryStats: { total: 0, today: 0, last7Days: 0 }, callStats: { total: 0, today: 0, last7Days: 0 } };

    return (
        <div className="animate-in fade-in duration-500 pb-10">
            <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tight mb-1">
                ChÃ o {currentUser?.displayName || currentUser?.username} ðŸ‘‹
            </h1>
            <p className="text-sm text-slate-500 font-medium mb-6">
                Tá»•ng quan website Maintech Vietnam.
            </p>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <StatCard icon={Globe2} label="LÆ°á»£t truy cáº­p (30 ngÃ y)" value={visitorData.totalVisits} href="/admin/monitoring" />
                <StatCard icon={Users2} label="LÆ°á»£t truy cáº­p hÃ´m nay" value={visitorData.todayVisits} href="/admin/monitoring" />
                <StatCard icon={Inbox} label="LiÃªn há»‡ (7 ngÃ y)" value={inquiryData.inquiryStats.last7Days} href="/admin/cms/inquiries" />
                <StatCard icon={PhoneCall} label="LÆ°á»£t gá»i (7 ngÃ y)" value={inquiryData.callStats.last7Days} href="/admin/cms/inquiries" />
            </div>

            <div className="grid md:grid-cols-2 gap-6 mb-8">
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                    <h2 className="font-black uppercase text-xs text-slate-400 tracking-widest mb-4">KhÃ¡ch truy cáº­p theo quá»‘c gia</h2>
                    {visitorData.topCountries.length === 0 ? (
                        <p className="text-sm text-slate-400 py-6 text-center">ChÆ°a cÃ³ dá»¯ liá»‡u.</p>
                    ) : (
                        <div className="space-y-2">
                            {visitorData.topCountries.map((c: any) => (
                                <div key={c.country} className="flex items-center justify-between text-sm">
                                    <span className="font-bold text-slate-700">{c.country}</span>
                                    <span className="font-black text-slate-900">{c.count}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                    <h2 className="font-black uppercase text-xs text-slate-400 tracking-widest mb-4">KhÃ¡ch truy cáº­p theo thÃ nh phá»‘</h2>
                    {visitorData.topCities.length === 0 ? (
                        <p className="text-sm text-slate-400 py-6 text-center">ChÆ°a cÃ³ dá»¯ liá»‡u.</p>
                    ) : (
                        <div className="space-y-2">
                            {visitorData.topCities.map((c: any) => (
                                <div key={c.city} className="flex items-center justify-between text-sm">
                                    <span className="font-bold text-slate-700">{c.city}</span>
                                    <span className="font-black text-slate-900">{c.count}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                <h2 className="font-black uppercase text-xs text-slate-400 tracking-widest mb-4">Chá»‰nh sá»­a nhanh</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {QUICK_LINKS.map((l) => (
                        <Link
                            key={l.href}
                            href={l.href}
                            className="flex items-center justify-between px-4 py-3 rounded-xl border border-slate-100 hover:border-[#C8102E]/40 hover:bg-slate-50 transition-all text-sm font-bold text-slate-700"
                        >
                            {l.title}
                            <ArrowUpRight size={14} className="text-slate-300" />
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
}

