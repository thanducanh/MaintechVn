// ðŸ“ File: src/app/admin/cms/about/page.tsx
import prisma from "@/lib/prisma";
import { requireRole } from "@/lib/auth";
import { ArrowRight } from "lucide-react";
import AboutManager from "@/components/admin/AboutManager";

export const dynamic = 'force-dynamic';

export default async function CMSAboutPage() {
    await requireRole("ADMIN", "GIAM_DOC", "QUAN_LY");

    const [aboutData, rawCertificates, rawPartners] = await Promise.all([
        prisma.article.findFirst({
            where: { category: "GIOI_THIEU" },
            orderBy: { updatedAt: 'desc' }
        }),
        prisma.service.findMany({
            where: { category: "CHUNG_CHI" },
            orderBy: [{ order: 'asc' }, { createdAt: 'desc' }]
        }),
        prisma.service.findMany({
            where: { category: "DOI_TAC" },
            orderBy: [{ order: 'asc' }, { createdAt: 'desc' }]
        })
    ]);

    // ðŸš€ SELF-HEAL: Migrate existing categories if none exist in the database
    let rawCategories = await prisma.service.findMany({
        where: { category: "CHUNG_CHI_LOAI" },
        orderBy: [{ order: 'asc' }, { createdAt: 'desc' }]
    });

    if (rawCategories.length === 0 && rawCertificates.length > 0) {
        const uniqueCats = Array.from(new Set(rawCertificates.map(c => c.category || "Uncategorized")));
        if (uniqueCats.length > 0) {
            const creations = uniqueCats.map((cat, idx) => {
                return prisma.service.create({
                    data: {
                        title: cat,
                        slug: "chung-chi-loai-" + Math.random().toString(36).substring(7),
                        content: cat,
                        category: "CHUNG_CHI_LOAI",
                        status: "HIá»‚N THá»Š",
                        order: idx
                    }
                });
            });
            await prisma.$transaction(creations);
            // Re-fetch migrated categories
            rawCategories = await prisma.service.findMany({
                where: { category: "CHUNG_CHI_LOAI" },
                orderBy: [{ order: 'asc' }, { createdAt: 'desc' }]
            });
        }
    }

    const certificates = JSON.parse(JSON.stringify(rawCertificates));
    const partners = JSON.parse(JSON.stringify(rawPartners));
    const categories = JSON.parse(JSON.stringify(rawCategories));
    const safeAboutData = aboutData ? JSON.parse(JSON.stringify(aboutData)) : null;

    return (
        <div className="w-full bg-[#f8fafc] min-h-screen font-sans text-slate-600 animate-in fade-in duration-500 pb-10">

            <AboutManager 
                initialAbout={safeAboutData ?? { title: "", summary: "", content: "", imageUrl: null, hero_bg_path: null }} 
                initialCertificates={certificates} 
                initialPartners={partners} 
                initialCategories={categories}
            />
        </div>
    );
}

