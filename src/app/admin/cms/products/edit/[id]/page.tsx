// 📍 File: src/app/admin/cms/products/edit/[id]/page.tsx
import prisma from "@/lib/prisma";
import EditProductClient from "./EditProductClient";
import { notFound } from "next/navigation";

export default async function EditProductPage(props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    const id = parseInt(params.id);

    if (isNaN(id)) return notFound();

    const product = await (prisma as any).service.findUnique({
        where: { id }
    });

    if (!product) return notFound();

    const safeData = JSON.parse(JSON.stringify(product));

    return <EditProductClient productData={safeData} />;
}