// 📍 File: src/app/admin/cms/articles/page.tsx
import prisma from "@/lib/prisma";
import ArticleClient from "./ArticleClient"; 
import { getArticlePageConfigAction } from "@/actions/article";

export const dynamic = 'force-dynamic';

export default async function CMSArticlesPage() {
    // 1. In log debug theo yêu cầu của Chủ tịch để kiểm tra đúng file đang chạy
    console.log("ARTICLE_ADMIN_RENDER_V2");

    // 2. Kéo dữ liệu từ Database (Sắp xếp bài mới nhất lên đầu)
    const articles = await prisma.article.findMany({
        where: { NOT: { category: "CAI_DAT" } },
        orderBy: { createdAt: 'desc' }
    });

    // 3. Kéo cấu hình trang tin tức từ Database
    const config = await getArticlePageConfigAction();

    // 4. Bắn dữ liệu vào giao diện Client
    return <ArticleClient articles={articles} initialConfig={config} />;
}