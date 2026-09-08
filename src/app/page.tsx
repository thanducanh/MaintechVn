// 📍 File: src/app/page.tsx
import Image from "next/image";
import prisma from "@/lib/prisma";
import Link from "next/link";
import Hero from "@/components/Hero";
import Mission from "@/components/Mission";
import Services from "@/components/Services";
import { getDisplayServicesAction } from "@/actions/services";
import OurHistory from "@/components/OurHistory";
import OurExpertTeam from "@/components/OurExpertTeam";
import CompanyCapabilities from "@/components/CompanyCapabilities";
import Process from "@/components/Process";
import NewsSection from "@/components/NewsSection";
import PartnersStrip from "@/components/PartnersStrip";
import FeaturedProducts from "@/components/FeaturedProducts";
import ClientOnly from "@/components/ClientOnly";

export const dynamic = 'force-dynamic';

const sampleTeam = [
    { name: "Nguyễn Đình Thanh", name_en: "Nguyen Dinh Thanh", role_vi: "Tổng giám đốc (CEO)", role_en: "Chief Executive Officer (CEO)", image: "/uploads/services/ceo-maintech.png", credentials: [{name:"PAT-Krüger Crane Systems Maintenance",year:"2015",image:"/uploads/certificates/certificate-9.png"},{name:"Bromma Spreader, PLC & SCS2 System",year:"2009",image:"/uploads/certificates/certificate-10.png"},{name:"Kalmar RG E-One Advanced Level",year:"2011",image:"/uploads/certificates/certificate-12.png"},{name:"Hänel Service and Product Training",year:"2015",image:"/uploads/certificates/certificate-13.png"}] },
    { name: "Trịnh Hoàn Vũ", name_en: "Trinh Hoan Vu", role_vi: "Kỹ sư trưởng", role_en: "Chief Engineer", image: "/uploads/services/1778233643155_TrinhHoanVu_KalmarAsia.png", credentials: [{name:"Kalmar DRF 450-60S5K & DCE 80-45E",year:"2006",image:"/uploads/certificates/certificate-1.png"},{name:"Kalmar Rubber Tyred Gantry Crane",year:"2000",image:"/uploads/certificates/certificate-2.png"},{name:"Gottwald Mobile Harbour Crane Advanced Training",year:"2010",image:"/uploads/certificates/certificate-11.png"},{name:"Krones E-Learning",year:"2015",image:"/uploads/certificates/certificate-6.png"}] },
    { name: "Đồng Văn Ý", name_en: "Dong Van Y", role_vi: "Chuyên gia thiết bị nâng hạ", role_en: "Lifting Equipment Specialist", image: "/uploads/services/1778670933630_Screenshot2026-05-13173620.png", credentials: [{name:"Kalmar Reach Stackers Technical Training",year:"2009",image:"/uploads/certificates/certificate-3.png"}] },
    { name: "Mai Duy Thái", name_en: "Mai Duy Thai", role_vi: "Kỹ sư tự động hóa", role_en: "Automation Engineer", image: "/uploads/services/1778671098437_Screenshot2026-05-13181742.png", credentials: [{name:"Kalmar Empty Stackers Technical Training",year:"2008",image:"/uploads/certificates/certificate-4.png"}] }
];

export default async function Home() {
    // 🚀 1. LẤY CẤU HÌNH TRANG CHỦ
    const homeConfigRecord = await prisma.article.findFirst({
        where: { category: "TRANG_CHU" },
        orderBy: { updatedAt: 'desc' }
    });

    let config: any = null;
    if (homeConfigRecord?.content) {
        try {
            config = JSON.parse(homeConfigRecord.content);
        } catch (e) {
            console.error("Failed to parse homepage content JSON:", e);
        }
    }

    // 🚀 LẤY LOGO MẶC ĐỊNH ĐỂ LÀM ẢNH FALLBACK
    const siteLogo = await prisma.siteSetting.findUnique({
        where: { key: "SITE_LOGO" }
    });
    const defaultFallbackImage = siteLogo?.value || "/images/site-logo-maintech.png";

    // 2. LẤY DỮ LIỆU TIN TỨC (Dựa trên config hoặc auto)
    let latestArticles: any[] = [];
    const newsLimit = Math.max(4, Number(config?.news?.limit) || 0);
    latestArticles = await prisma.article.findMany({
        where: {
            status: "PUBLISHED",
            isActive: true,
            category: { notIn: ["GIOI_THIEU", "CAU_HINH", "TRANG_CHU"] }
        },
        orderBy: { createdAt: "desc" },
        take: newsLimit,
    });

    // 3. LẤY DỮ LIỆU DỊCH VỤ (Dựa trên config hoặc auto)
    // Keep the homepage and /services page on the same normalized CMS source.
    // This prevents different filters/localization from producing different cards.
    const activeServices = await getDisplayServicesAction();

    /* Fallback nếu không có dịch vụ nào trong DB
    if (activeServices.length === 0) {
        activeServices = [
            {
                id: 10001,
                title_vi: "Bảo trì & Sửa chữa Thiết bị Nâng hạ",
                title_en: "Maintenance & Repair of Lifting Equipment",
                desc_vi: "Dịch vụ bảo trì phòng ngừa, kiểm tra định kỳ và sửa chữa khẩn cấp hệ thống thiết bị nâng hạ công nghiệp (cầu trục, cổng trục, xe nâng, v.v.), đảm bảo an toàn tuyệt đối và hiệu suất hoạt động liên tục.",
                desc_en: "Preventive maintenance, periodic inspection, and emergency repair services for industrial lifting systems (overhead cranes, gantry cranes, forklifts, etc.), ensuring absolute safety and continuous performance.",
                summary: "Bảo trì chuyên sâu hệ thống cầu trục, cổng trục, thiết bị nâng hạ công nghiệp.",
                summary_en: "In-depth maintenance of overhead cranes, gantry cranes, and industrial lifting equipment.",
                category: "BẢO TRÌ SỬA CHỮA",
                imageUrl: "/images/services-hero-bg.jpg",
                status: "HIỂN THỊ"
            },
            {
                id: 10002,
                title_vi: "Thiết kế & Thi công Hệ thống Điện điều khiển",
                title_en: "Design & Installation of Electrical Control Systems",
                desc_vi: "Giải pháp thiết kế bản vẽ và thi công lắp đặt tủ điện điều khiển công nghiệp, tích hợp biến tần, PLC, nâng cấp hệ thống điều khiển tự động hóa cho nhà máy và dây chuyền sản xuất hiện đại.",
                desc_en: "Design and installation solutions for industrial electrical control panels, integrating inverters, PLCs, and upgrading automation control systems for modern factories and production lines.",
                summary: "Thiết kế tủ điện, tủ điều khiển PLC, nâng cấp hệ thống tự động hóa nhà máy.",
                summary_en: "Electrical panel design, PLC control panels, upgrading factory automation systems.",
                category: "THIẾT KẾ THI CÔNG",
                imageUrl: "/images/services-hero-bg.jpg",
                status: "HIỂN THỊ"
            },
            {
                id: 10003,
                title_vi: "Cung cấp Thiết bị & Phụ tùng Công nghiệp",
                title_en: "Supply of Industrial Equipment & Spare Parts",
                desc_vi: "Phân phối chính hãng các thiết bị phụ tùng công nghiệp chất lượng cao từ các thương hiệu hàng đầu thế giới: động cơ, hộp giảm tốc, thiết bị đóng cắt, cảm biến và linh kiện cầu trục chuyên dụng.",
                desc_en: "Genuine distribution of high-quality industrial spare parts and equipment from leading global brands: motors, gearboxes, switchgear, sensors, and specialized crane components.",
                summary: "Cung cấp thiết bị đóng cắt, động cơ, biến tần và phụ tùng cầu trục chính hãng.",
                summary_en: "Supply of switchgear, motors, inverters, and genuine crane spare parts.",
                category: "CUNG CẤP THIẾT BỊ",
                imageUrl: "/images/services-hero-bg.jpg",
                status: "HIỂN THỊ"
            }
        ];
    } */

    // 4. LẤY DỮ LIỆU SẢN PHẨM (Dựa trên config hoặc auto)
    let activeProducts: any[] = [];
    const productsLimit = config?.products?.limit || 4;
    const productsSelectedIds = (config?.products?.selected_ids || []).map(Number).filter(Boolean);

    if (productsSelectedIds && productsSelectedIds.length > 0) {
        const fetched = await prisma.service.findMany({
            where: { id: { in: productsSelectedIds }, status: "HIỂN THỊ" }
        });
        // Sắp xếp đúng thứ tự chọn
        activeProducts = productsSelectedIds
            .map((id: number) => fetched.find(p => p.id === id))
            .filter(Boolean);
    } else {
        activeProducts = await prisma.service.findMany({
            where: { 
                status: "HIỂN THỊ",
                OR: [
                    { category: { contains: "THIET_BI_NANG_HA" } },
                    { category: { contains: "THIET_BI_FB" } },
                    { category: { contains: "THIET_BI_NGANH_CANG" } },
                    { category: { in: ["SẢN PHẨM", "SẢN PHẨM NÂNG HẠ", "PHỤ TÙNG VẬT TƯ"] } }
                ]
            },
            orderBy: { createdAt: 'desc' },
            take: productsLimit, 
        });
    }

    // 5. LẤY DỮ LIỆU "VỀ CHÚNG TÔI" (Vẫn giữ để fallback)
    // latestArticles đã được lấy theo cấu hình Tin tức trong CMS ở phía trên.
    activeProducts = await prisma.product.findMany({
        where: { isActive: true },
        take: 4,
    });

    const aboutData = await prisma.article.findFirst({
        where: { category: "GIOI_THIEU" },
        orderBy: { updatedAt: 'desc' }
    });

    // 6. LẤY ĐỐI TÁC
    let partners: any[] = [];
    try {
        partners = await prisma.service.findMany({
            where: { status: "HIỂN THỊ", category: "DOI_TAC" },
            orderBy: { order: 'asc' },
            take: 20,
        });
    } catch {}
    if (partners.length === 0) {
        const partnerFiles = [
            "1778230145024_partner_CNB.jpg", "1778230145470_partner_CTCPVanTaivsDVHHCangSaiGon.jpg",
            "1778230145619_partner_giannamlogistic.png", "1778230146132_partner_KMSvina.png",
            "1778230146299_partner_lcfoods.jpg", "1778230146452_partner_PPAP.png",
            "1778230146608_partner_rieckermann.jpg", "1778230146769_partner_SITC.png",
            "1778230146920_partner_SPCT.png", "1778230147102_partner_TanCangLogistic.jpg",
            "1778230147287_partner_TanCangWarehousing.jpg", "1778230147433_partner_THtrueMILK2.png",
        ];
        partners = partnerFiles.map((file, index) => ({ id: `sample-partner-${index}`, status: "HIỂN THỊ", order: index, title_vi: "Đối tác Maintech", imageUrl: `/uploads/partners/${file}` }));
    }

    // Determine visibilities
    const heroContent = config?.hero;
    const showHero = config
        ? Boolean(heroContent && [
            heroContent.badge_vi,
            heroContent.badge_en,
            heroContent.title1_vi,
            heroContent.title1_en,
            heroContent.title2_vi,
            heroContent.title2_en,
            heroContent.desc_vi,
            heroContent.desc_en,
        ].some((value) => typeof value === "string" && value.trim() !== ""))
        : true;
    const showIntro = config ? config.intro?.active !== false : true;
    const servicesContent = config?.services;
    const showServices = config
        ? Boolean(servicesContent && [
            servicesContent.badge_vi,
            servicesContent.badge_en,
            servicesContent.title_vi,
            servicesContent.title_en,
            servicesContent.desc_vi,
            servicesContent.desc_en,
            ...(Array.isArray(servicesContent.cards) ? servicesContent.cards.flatMap((card: any) => [card?.title_vi, card?.title_en, card?.desc_vi, card?.desc_en]) : []),
        ].some((value) => typeof value === "string" && value.trim() !== ""))
        : true;
    // Tạm ẩn toàn bộ khu vực sản phẩm theo cấu hình hiện tại của website.
    const showProducts = false;
    const showPartners = config ? config.partners?.active !== false : true;

    return (
        <main className="w-full min-h-screen overflow-x-clip bg-[#0B0F19] font-sans text-slate-100">
            <ClientOnly>
            
            {/* HERO / BANNER CHÍNH */}
            {showHero && <Hero config={config} />}
            
            {/* GIỚI THIỆU NHANH (Mission) */}
            {showIntro && <Mission aboutData={aboutData} config={config} homeImageUrl={homeConfigRecord?.imageUrl || null} />}

            {/* DỊCH VỤ */}
            {showServices && <Services services={activeServices} config={config} />}
            <OurHistory config={config} />
            <CompanyCapabilities />
            <OurExpertTeam config={{ ...(config || {}), team: { ...(config?.team || {}), badge_vi: "ĐỘI NGŨ CHUYÊN GIA", badge_en: "EXPERT TEAM", title_vi: "NĂNG LỰC NHÂN SỰ", title_en: "OUR EXPERT TEAM", members: config?.team?.members?.length ? config.team.members : sampleTeam } }} />

            {/* TIN TỨC & DỰ ÁN: nằm ngay dưới Đội ngũ chuyên gia và trước Quy trình */}
            <NewsSection articles={latestArticles as any} config={config} />
            
            {/* SẢN PHẨM NỔI BẬT */}
            {showProducts && <FeaturedProducts products={activeProducts} config={config} defaultFallbackImage={defaultFallbackImage} />}

            {/* QUY TRÌNH CHUYÊN NGHIỆP */}
            <Process config={config} />

            {/* ĐỐI TÁC CHIẾN LƯỢC (Render ở đây nếu được bật) */}
            {showPartners && <PartnersStrip partners={partners} config={config} />}

            </ClientOnly>
        </main>
    );
}
