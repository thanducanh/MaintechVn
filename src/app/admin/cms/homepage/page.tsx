import prisma from "@/lib/prisma";
import HomeForm from "./HomeForm";
import { getHomepageConfigAction } from "@/actions/home";

export const dynamic = 'force-dynamic';

export default async function CMSHomePage() {
    // 🚀 1. Lấy cấu hình JSON mới
    const config = await getHomepageConfigAction();

    // 🚀 2. Lấy danh sách để chọn Featured
    const [articles, rawServices] = await Promise.all([
        prisma.article.findMany({
            where: { status: "PUBLISHED" },
            select: { id: true, title: true, category: true },
            orderBy: { createdAt: 'desc' }
        }),
        prisma.service.findMany({
            where: {
                isActive: true,
                status: "HIỂN THỊ",
                title: { not: "" },
                category: { notIn: ["CHUNG_CHI", "CHUNG_CHI_LOAI", "DOL_TAC", "DOI_TAC"] }
            },
            select: { id: true, title: true, category: true },
            orderBy: [{ createdAt: 'asc' }, { id: 'asc' }]
        })
    ]);

    // Keep the existing CMS form contract while reading the schema field `title`.
    const services = rawServices.map((service) => ({
        ...service,
        title_vi: service.title,
    }));

    return (
        <div className="h-full w-full p-0 bg-transparent animate-in fade-in duration-500 overflow-hidden flex flex-col">
            <div className="max-w-[1400px] w-full mx-auto flex-1 flex flex-col min-h-0 overflow-hidden pt-2">
                {/* Gọi Trình quản lý Trang chủ */}
                <HomeForm 
                    initialConfig={config} 
                    articles={articles} 
                    services={services} 
                />
            </div>
        </div>
    );
}
