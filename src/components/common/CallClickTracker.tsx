"use client";

// 📍 File: src/components/common/CallClickTracker.tsx
// Lắng nghe click vào BẤT KỲ link "tel:" nào trên toàn site (nút gọi trong Navbar,
// Footer, ContactBubble, trang liên hệ...) để đếm số lượt khách bấm gọi điện,
// mà không cần sửa từng nơi đang có link tel: riêng lẻ.

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { trackCallClickAction } from "@/actions/contact";

export default function CallClickTracker() {
    const pathname = usePathname();

    useEffect(() => {
        const handleClick = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            const link = target?.closest?.("a[href^='tel:']");
            if (link) {
                trackCallClickAction(pathname).catch(() => {});
            }
        };

        document.addEventListener("click", handleClick, true);
        return () => document.removeEventListener("click", handleClick, true);
    }, [pathname]);

    return null;
}
