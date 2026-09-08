// 📍 File: src/app/admin/cms/inquiries/page.tsx
import { getInquiryAndCallStatsAction } from "@/actions/contact";
import InquiriesClient from "./InquiriesClient";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function InquiriesPage() {
    const result = await getInquiryAndCallStatsAction();
    const data = result.success ? result.data : { inquiries: [], inquiryStats: { total: 0, today: 0, last7Days: 0 }, callStats: { total: 0, today: 0, last7Days: 0 } };

    return <InquiriesClient initialData={data as any} />;
}
