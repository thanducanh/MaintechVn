"use client";

// 📍 File: src/components/common/LanguageSelectOverlay.tsx
// Hiện đúng 1 lần cho khách khi vào website lần đầu (chưa từng chọn ngôn ngữ),
// cho phép chọn Tiếng Việt / English. Sau khi chọn, lựa chọn được lưu lại
// (localStorage + cookie qua LanguageContext) nên các lần sau không hiện lại.
// Khách vẫn có thể đổi ngôn ngữ bất cứ lúc nào bằng nút chuyển trên Navbar,
// việc đổi diễn ra tức thì, không tải lại trang.

import { useEffect, useState } from "react";
import { useLanguage } from "@/context/LanguageContext";

export default function LanguageSelectOverlay() {
    const { setLanguage } = useLanguage();
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const hasChosen = localStorage.getItem("language");
        if (!hasChosen) {
            setVisible(true);
        }
    }, []);

    const choose = (lang: "VN" | "EN") => {
        setLanguage(lang);
        setVisible(false);
    };

    if (!visible) return null;

    return (
        <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/70 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-white rounded-3xl shadow-2xl w-[92%] max-w-md p-8 text-center animate-in zoom-in-95 duration-300">
                <h2 className="text-lg font-black uppercase tracking-tight text-slate-900 mb-1">
                    Chọn ngôn ngữ / Select language
                </h2>
                <p className="text-xs text-slate-500 font-medium mb-6">
                    Bạn có thể đổi lại bất cứ lúc nào ở góc trên website.
                </p>
                <div className="grid grid-cols-2 gap-4">
                    <button
                        onClick={() => choose("VN")}
                        className="flex flex-col items-center gap-2 py-6 rounded-2xl border-2 border-slate-100 hover:border-[#C8102E] hover:bg-red-50/50 transition-all group"
                    >
                        <span className="text-4xl">🇻🇳</span>
                        <span className="text-sm font-black uppercase tracking-wide text-slate-800 group-hover:text-[#C8102E]">
                            Tiếng Việt
                        </span>
                    </button>
                    <button
                        onClick={() => choose("EN")}
                        className="flex flex-col items-center gap-2 py-6 rounded-2xl border-2 border-slate-100 hover:border-[#C8102E] hover:bg-red-50/50 transition-all group"
                    >
                        <span className="text-4xl">🇬🇧</span>
                        <span className="text-sm font-black uppercase tracking-wide text-slate-800 group-hover:text-[#C8102E]">
                            English
                        </span>
                    </button>
                </div>
            </div>
        </div>
    );
}
