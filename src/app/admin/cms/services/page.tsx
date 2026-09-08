// 📍 File: src/app/admin/cms/services/page.tsx
import prisma from "@/lib/prisma";
import { requireRole } from "@/lib/auth";
import ServiceClient from "./ServiceClient";
import { getServicesPageConfigAction } from "@/actions/services";

export const dynamic = 'force-dynamic';

export default async function CMSServicesPage() {
    await requireRole("ADMIN", "GIAM_DOC", "QUAN_LY");

    const rawServices = await prisma.service.findMany({
        where: {
            title: { not: "" },
            category: { notIn: ["CHUNG_CHI", "CHUNG_CHI_LOAI", "DOL_TAC", "DOI_TAC"] }
        },
        // Giữ đúng thứ tự tạo dịch vụ, không để order cũ làm dịch vụ mới nhảy lên đầu.
        orderBy: [{ createdAt: 'asc' }, { id: 'asc' }]
    });

    const safeServices = JSON.parse(JSON.stringify(rawServices)).map((service: any) => {
        let localized: any = {};
        try { localized = JSON.parse(service.content || "{}"); } catch { localized = {}; }
        const descVi = typeof localized?.vi === "string" ? localized.vi : (service.content || "");
        const descEn = typeof localized?.en === "string" ? localized.en : descVi;
        return {
            ...service,
            title_vi: service.title,
            title_en: typeof localized?.title_en === "string" ? localized.title_en : service.title,
            desc_vi: descVi,
            desc_en: descEn,
            status: service.isActive ? "HIỂN THỊ" : "ẨN"
        };
    });
    const config = await getServicesPageConfigAction();

    const defaultConfig = {
        hero: {
            title: { vi: "Dịch Vụ & Giải Pháp", en: "Services & Solutions" },
            subtitle: { 
                vi: "Cung cấp giải pháp kỹ thuật công nghiệp toàn diện và chuyên sâu", 
                en: "Providing comprehensive and specialized industrial technical solutions" 
            },
            badge: { vi: "Dịch Vụ", en: "Services" },
            backgroundImage: "",
            overlayOpacity: 0.6
        }
    };

    const initialConfig = config || defaultConfig;

    return (
        <ServiceClient services={safeServices} initialConfig={initialConfig} />
    );
}
