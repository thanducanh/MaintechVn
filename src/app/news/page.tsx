import { Metadata } from "next";
import prisma from "@/lib/prisma";
import NewsPageClient from "@/components/NewsPageClient";
import PageBanner from "@/components/PageBanner";
import { getArticlePageConfigAction } from "@/actions/article";

export const metadata: Metadata = {
    title: "Tin Tức | Maintech Vietnam",
};

export const dynamic = "force-dynamic";

export default async function NewsPage() {
    // 1. Lấy dữ liệu bài viết
    let articles: any[] = [];
    try {
        articles = await prisma.article.findMany({
            where: { status: { in: ["PUBLISHED", "HIỂN THỊ"] } },
            orderBy: { createdAt: "desc" },
        });
    } catch (error) {
        console.warn("Không đọc được database tin tức, dùng dữ liệu mẫu:", error);
    }
    if (articles.length < 3) {
        const existingSlugs = new Set(articles.map((item) => item.slug));
        const fallbackArticles = [
            { id: 1, slug: "maintech-industrial-updates", title: "Cập nhật hoạt động kỹ thuật Maintech", title_en: "Maintech Industrial Updates", summary: "Maintech Vietnam nâng cao năng lực khảo sát, thiết kế, lắp đặt và bảo trì thiết bị công nghiệp.", summary_en: "Maintech Vietnam strengthens its industrial engineering capabilities.", content: "Maintech Vietnam tập trung triển khai các giải pháp kỹ thuật an toàn, bền vững cho cảng biển, kho bãi và nhà máy.", category: "TIN_TUC", imageUrl: "/uploads/services/1778675193146_ThietKeLapDatThietBiCang.png", createdAt: new Date("2024-05-01") },
            { id: 2, slug: "engineering-solutions", title: "Giải pháp kỹ thuật công nghiệp", title_en: "Industrial Engineering Solutions", summary: "Khám phá năng lực triển khai và bảo trì thiết bị công nghiệp của Maintech.", summary_en: "Discover Maintech's industrial equipment solutions.", content: "Đội ngũ kỹ sư Maintech cung cấp giải pháp xử lý sự cố, thay thế linh kiện và nâng cấp điều khiển cho từng nhà máy.", category: "GIAI_PHAP", imageUrl: "/uploads/services/1778675523223_BaoTriThietBiCang.png", createdAt: new Date("2024-04-15") },
            { id: 3, slug: "maintech-projects", title: "Dự án tiêu biểu", title_en: "Featured Projects", summary: "Các dự án tiêu biểu thể hiện tiêu chuẩn và kinh nghiệm của đội ngũ Maintech.", summary_en: "Selected projects highlighting Maintech's expertise.", content: "Mỗi dự án được triển khai theo quy trình khảo sát, lập phương án kỹ thuật, thi công an toàn, nghiệm thu và bàn giao.", category: "DU_AN", imageUrl: "/uploads/services/1778675416166_BaoTriThietBiNganhCang.png", createdAt: new Date("2024-03-20") },
        ];
        articles = [...articles, ...fallbackArticles.filter((item) => !existingSlugs.has(item.slug))].slice(0, 3);
    }
    
    // 2. Lấy cấu hình trang News
    const config = await getArticlePageConfigAction();

    return (
        <main className="min-h-screen bg-white font-sans text-slate-600">
            <PageBanner 
                centered
                customImage="/images/maintech-page-banner.png"
                overlayOpacity={config?.hero?.overlayOpacity ?? 0.7}
                vi={{
                    badge: config?.hero?.badge?.vi || "",
                    titleTop: "",
                    titleHighlight: "",
                    title: config?.hero?.title?.vi || "Tin Tức",
                    desc: "Trang chủ / Tin tức"
                }}
                en={{
                    badge: config?.hero?.badge?.en || "",
                    titleTop: "",
                    titleHighlight: "",
                    title: config?.hero?.title?.en || "Industry News",
                    desc: "Home / News"
                }}
            />
            
            {/* Truyền dữ liệu xuống Client Component để xử lý Search, Tab */}
            <NewsPageClient articles={articles as any} />
        </main>
    );
}
