"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { recordHeartbeatAction } from "@/actions/system-health";

export function HeartbeatTracker({ type }: { type: "PUBLIC_WEB" | "ADMIN_PANEL" }) {
    const initialized = useRef(false);
    const pathname = usePathname();

    useEffect(() => {
        if (typeof window === "undefined") return;

        // Create a unique session ID for this browser tab/session if not exists
        let sessionId = sessionStorage.getItem("visitor_session_id");
        if (!sessionId) {
            sessionId = crypto.randomUUID();
            sessionStorage.setItem("visitor_session_id", sessionId);
        }

        const ping = async () => {
            try {
                // Ignore errors to not spam console
                await recordHeartbeatAction(type, sessionId as string, undefined, undefined, pathname).catch(() => {});
            } catch (e) {
                // ignore
            }
        };

        // Ping immediately on mount
        if (!initialized.current) {
            ping();
            initialized.current = true;
        }

        // Ping every 30 seconds
        const interval = setInterval(ping, 30000);

        return () => clearInterval(interval);
    }, [type, pathname]);

    return null;
}
