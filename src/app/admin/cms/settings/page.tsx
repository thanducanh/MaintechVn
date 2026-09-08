// 📍 File: src/app/admin/cms/settings/page.tsx
// Server Component — fetch data server-side, không cần useEffect
import { getSiteLogoAction, getCompanyInfoAction, getBannersAction } from "@/actions/settings";
import SettingsClient from "./SettingsClient";

export default async function SettingsPage() {
    // Fetch tất cả data song song trên server — không có loading state, không có waterfall
    const [logo, companyInfo, banners] = await Promise.all([
        getSiteLogoAction(),
        getCompanyInfoAction(),
        getBannersAction(),
    ]);

    return (
        <SettingsClient
            initialLogo={logo}
            initialCompanyInfo={companyInfo}
            initialBanners={banners || {}}
        />
    );
}
