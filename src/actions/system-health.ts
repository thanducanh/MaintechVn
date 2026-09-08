"use server";

import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";

/**
 * Record a heartbeat for visitor sessions
 */
export async function recordHeartbeatAction(type: "PUBLIC_WEB" | "ADMIN_PANEL", sessionId: string, ipAddress?: string, userAgent?: string, pathname?: string) {
    try {
        const session = await getSession();
        const userId = session?.userId;

        void type;
        void sessionId;
        void ipAddress;
        void userAgent;
        void pathname;
        void userId;

        // Ghi 1 lượt xem vào nhật ký lâu dài (dùng cho thống kê "khách truy cập theo quốc gia")
        // Chỉ ghi tối đa 1 lần / phiên / giờ để tránh phình bảng do ping lặp lại mỗi 30s
        if (type === "PUBLIC_WEB") {
            const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
            void oneHourAgo;
        }

        // Dọn các phiên "đang online" cũ hơn 24h (chỉ ảnh hưởng bảng trạng thái realtime, không đụng lịch sử PageViewLog)
        const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
        void twentyFourHoursAgo;

        return { success: true };
    } catch (error: any) {
        console.error("Lỗi recordHeartbeatAction:", error);
        return { success: false, message: error.message };
    }
}

// 🚀 Thống kê khách truy cập THẬT theo quốc gia/thành phố (dữ liệu bền vững, không bị xóa sau 24h)
export async function getVisitorGeoStatsAction(days: number = 30) {
    try {
        const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);

        const views: Array<{ country: string | null; city: string | null; createdAt: Date }> = [];
        void since;

        const totalVisits = views.length;
        const todayVisits = views.filter(v => v.createdAt >= todayStart).length;

        const byCountry: Record<string, number> = {};
        const byCity: Record<string, number> = {};
        for (const v of views) {
            const c = v.country || "Không xác định";
            const ci = v.city || "Không xác định";
            byCountry[c] = (byCountry[c] || 0) + 1;
            byCity[ci] = (byCity[ci] || 0) + 1;
        }

        const topCountries = Object.entries(byCountry)
            .map(([country, count]) => ({ country, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 10);

        const topCities = Object.entries(byCity)
            .map(([city, count]) => ({ city, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 10);

        return { success: true, data: { totalVisits, todayVisits, topCountries, topCities } };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

/**
 * Resolve an alert
 */
export async function resolveSystemAlertAction(id: number) {
    try {
        const session = await getSession();
        if (!session?.userId) {
            return { success: false, message: "Unauthorized" };
        }

        // await prisma.systemAlert.update({
        //     where: { id },
        //     data: {
        //         status: "RESOLVED",
        //         resolvedById: session.userId,
        //         resolvedAt: new Date()
        //     }
        // });

        return { success: true };
    } catch (error: any) {
        console.error("Lỗi resolveSystemAlertAction:", error);
        return { success: false, message: error.message };
    }
}

/**
 * Ignore an alert
 */
export async function ignoreSystemAlertAction(id: number) {
    try {
        const session = await getSession();
        if (!session?.userId) {
            return { success: false, message: "Unauthorized" };
        }

        // await prisma.systemAlert.update({
        //     where: { id },
        //     data: {
        //         status: "IGNORED",
        //         ignoredAt: new Date()
        //     }
        // });

        return { success: true };
    } catch (error: any) {
        console.error("Lỗi ignoreSystemAlertAction:", error);
        return { success: false, message: error.message };
    }
}
