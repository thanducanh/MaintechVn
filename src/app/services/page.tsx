import { Phone } from "lucide-react";
import PageBanner from "@/components/PageBanner";
import { getDisplayServicesAction, getServicesPageConfigAction } from "@/actions/services";
import Services from "@/components/Services";

const SERVICES_BANNER_FALLBACK = "/images/maintech-page-banner.png";

export const dynamic = "force-dynamic";

export default async function ServicesPage() {
    // Fetch data directly on the server
    const dbServices = await getDisplayServicesAction() || [];
    const bannerConfig = await getServicesPageConfigAction() || null;

    const displayServices = [...dbServices];

    // Banner config with fallback
    const hero = bannerConfig?.hero || {};
    const backgroundImage = hero.backgroundImage || SERVICES_BANNER_FALLBACK;
    const overlayOpacity = hero.overlayOpacity !== undefined ? hero.overlayOpacity : 1.0;

    return (
        <main className="min-h-screen bg-white font-sans flex flex-col">
            <PageBanner 
                pageKey="BANNER_SERVICES"
                centered
                customImage={backgroundImage}
                overlayOpacity={overlayOpacity}
                vi={{
                    badge: hero.badge?.vi || "Portfolio",
                    title: hero.title?.vi ?? "DỊCH VỤ & GIẢI PHÁP",
                    desc: ""
                }}
                en={{
                    badge: hero.badge?.en || "Portfolio",
                    title: hero.title?.en ?? "SERVICES & SOLUTIONS",
                    desc: ""
                }}
            />

            <Services
                services={displayServices}
                config={{ services: {
                    badge_vi: "DỊCH VỤ KỸ THUẬT",
                    badge_en: "TECHNICAL SERVICES",
                    title_vi: "DỊCH VỤ KỸ THUẬT NỔI BẬT",
                    title_en: "FEATURED TECHNICAL SERVICES",
                    desc_vi: "Cung cấp các giải pháp tối ưu cho hệ thống thiết bị nâng hạ cảng biển và công nghiệp nặng.",
                    desc_en: "Optimal solutions for port lifting systems and heavy industry."
                }}}
            />
        </main>
    );
}
