// 📍 File: src/app/admin/cms/services/edit/[id]/page.tsx
import prisma from "@/lib/prisma";
import EditForm from "./EditForm";
import { redirect } from "next/navigation";

export default async function EditServicePage(props: any) {
    redirect("/admin/cms/services");
    /*
    const params = await props.params;
    const serviceId = parseInt(params.id);

    if (isNaN(serviceId)) {
        return <div className="p-10 text-center font-bold text-red-500">ID dịch vụ không hợp lệ!</div>;
    }

    const serviceData = await (prisma as any).service.findUnique({
        where: { id: serviceId }
    });

    if (!serviceData) {
        return <div className="p-10 text-center font-bold text-red-500">Không tìm thấy dịch vụ!</div>;
    }

    const safeData = JSON.parse(JSON.stringify(serviceData));
    
    // 🚀 BỊT MIỆNG TYPESCRIPT BẰNG DÒNG NÀY:
    // @ts-ignore
    return <EditForm serviceData={safeData} />;*/
}
