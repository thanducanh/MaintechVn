// 📍 File: src/app/products/page.tsx
import prisma from "@/lib/prisma";
import { getDisplayProductsAction, getProductPageConfigAction } from "@/actions/product";
import ProductsClient from "./ProductsClient";

export const revalidate = 0; // Bypass cache to ensure instant settings sync updates

export default async function ProductsPage() {
    // 1. Fetch display catalog products server-side
    const products = await getDisplayProductsAction() || [];

    // 2. Fetch page configurations server-side
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

    // 3. Serialize securely to prevent client hydration mismatches
    const safeProducts = JSON.parse(JSON.stringify(products));
    const safePageConfig = JSON.parse(JSON.stringify(pageConfig));

    return (
        <ProductsClient 
            initialProducts={safeProducts} 
            pageConfig={safePageConfig} 
        />
    );
}
