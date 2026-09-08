// 📍 File: src/app/admin/cms/articles/edit/[id]/page.tsx
import prisma from "@/lib/prisma";
import EditArticleClient from "./EditArticleClient";
import { notFound } from "next/navigation";

export default async function EditArticlePage(props: { params: Promise<{ id: string }> }) {
    // 1. Lấy ID từ đường dẫn URL
    const params = await props.params;
    const id = parseInt(params.id);

    if (isNaN(id)) return notFound();

    // 2. Tìm bài viết trong Database
    const article = await (prisma as any).article.findUnique({
        where: { id }
    });

    if (!article) return notFound();

    // 3. Ép kiểu dữ liệu để truyền xuống Client mượt mà
    const safeData = JSON.parse(JSON.stringify(article));

    // 4. Đưa dữ liệu cho "nhân viên" EditArticleClient hiển thị
    return <EditArticleClient articleData={safeData} />;
}