// 📍 File: src/app/admin/cms/products/page.tsx
import prisma from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { ArrowRight } from "lucide-react";
import ProductClient from "./ProductClient";
import { getProductPageConfigAction } from "@/actions/product";

export default async function CMSProductsPage() {
    await requireAuth();

    // 2. Lấy dữ liệu sản phẩm từ Database bao gồm cả các ngành hàng mới
    const products = await prisma.service.findMany({
        where: { 
            OR: [
                { category: { contains: "THIET_BI_NANG_HA" } },
                { category: { contains: "THIET_BI_FB" } },
                { category: { contains: "THIET_BI_NGANH_CANG" } },
                { category: { contains: "THIET_BI_CAU" } },
                { category: { contains: "LINH_KIEN_PHU_KIEN" } },
                { category: { in: ["SẢN PHẨM NÂNG HẠ", "MÁY MÓC XÂY DỰNG", "PHỤ TÙNG VẬT TƯ", "SẢN PHẨM KHÁC", "CẨU TRỤC & PALANG"] } }
            ]
        },
        orderBy: { createdAt: 'desc' }
    });

    const pageConfig = await getProductPageConfigAction() || {
        badgeVi: "SẢN PHẨM & THIẾT BỊ",
        badgeEn: "PRODUCTS & EQUIPMENT",
        titleVi: "SẢN PHẨM & THIẾT BỊ CÔNG NGHIỆP",
        titleEn: "INDUSTRIAL PRODUCTS & EQUIPMENT",
        descVi: "Maintech chuyên cung cấp thiết bị F&B, thiết bị nâng hạ và phụ tùng công nghiệp.",
        descEn: "Maintech specializes in providing high-quality F&B, lifting equipment and industrial components.",
        backgroundImage: "/images/bg-banner.jpg",
        overlayOpacity: 60
    };

    // 3. Ép kiểu dữ liệu chuẩn xác để chống lỗi giao tiếp giữa Server và Client
    const safeProducts: any[] = JSON.parse(JSON.stringify(products));
    const safePageConfig = JSON.parse(JSON.stringify(pageConfig));

    return (
        <>
            {/* @ts-ignore */}
            <ProductClient products={safeProducts} initialPageConfig={safePageConfig} />
        </>
    );
}