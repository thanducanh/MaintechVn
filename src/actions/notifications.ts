"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getUnreadNotificationsCountAction() {
    try {
        const count = await prisma.inquiry.count({
            where: { status: "Mới" }
        });
        return count;
    } catch (error) {
        return 0;
    }
}

export async function getNotificationsAction() {
    try {
        const inquiries = await prisma.inquiry.findMany({
            orderBy: { createdAt: "desc" },
            take: 30
        });

        return inquiries.map((iq: any) => ({
            id: iq.id,
            type: "INQUIRY",
            title: "Khách hàng liên hệ mới",
            message: "Khách hàng " + iq.name + " vừa gửi yêu cầu liên hệ: " + iq.service_interest,
            severity: "info",
            module: "LIÊN HỆ",
            entityId: iq.id,
            entityType: "INQUIRY",
            createdAt: iq.createdAt,
            isRead: iq.status !== "Mới"
        }));
    } catch (error) {
        return [];
    }
}

export async function markAsReadAction(id: number) {
    return { success: true };
}

export async function markAllAsReadAction() {
    return { success: true };
}

export async function clearOldNotificationsAction() {
    return { success: true };
}

export async function checkEntityExistsAction(entityType: string, entityId: number) {
    if (entityType === "INQUIRY") {
        const item = await prisma.inquiry.findUnique({ where: { id: entityId } });
        return !!item;
    }
    return true;
}
