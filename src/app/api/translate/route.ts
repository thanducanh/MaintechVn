// 📍 File: src/app/api/translate/route.ts
// Dùng Google Translate API (không cần API key - dùng endpoint public)
import { NextResponse } from "next/server";

export async function POST(request: Request) {
    try {
        const { text, from = "vi", to = "en" } = await request.json();
        if (!text || !text.trim()) {
            return NextResponse.json({ translatedText: "" });
        }

        // Dùng Google Translate API public endpoint
        const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${from}&tl=${to}&dt=t&q=${encodeURIComponent(text)}`;

        const res = await fetch(url, {
            headers: {
                "User-Agent": "Mozilla/5.0",
            },
            signal: AbortSignal.timeout(8000),
        });

        if (!res.ok) {
            throw new Error(`Translate API error: ${res.status}`);
        }

        const data = await res.json();

        // Parse response từ Google Translate
        let translatedText = "";
        if (Array.isArray(data) && Array.isArray(data[0])) {
            translatedText = data[0]
                .filter((chunk: any) => chunk && chunk[0])
                .map((chunk: any) => chunk[0])
                .join("");
        }

        return NextResponse.json({ translatedText });
    } catch (error) {
        console.error("Translation error:", error);
        return NextResponse.json({ error: "Không thể dịch lúc này, vui lòng thử lại." }, { status: 500 });
    }
}
