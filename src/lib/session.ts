// 📍 File: src/lib/session.ts
// JWT session helper — dùng jose (Edge-compatible, không cần Node crypto)

import { SignJWT, jwtVerify } from "jose";

const SECRET_KEY = new TextEncoder().encode(
    process.env.SESSION_SECRET || "maintech-fallback-secret-change-in-production-32chars"
);

const ALGORITHM = "HS256";
const SESSION_COOKIE = "maintech_session";

export { SESSION_COOKIE };

export interface SessionPayload {
    userId: number;
    username: string;
    role: string;
    name: string;
    iat?: number;
    exp?: number;
}

// Ký JWT — payload chứa thông tin user, không lưu password
export async function signSession(payload: SessionPayload, rememberMe = false): Promise<string> {
    const expiresIn = rememberMe ? "30d" : "8h"; // Nhớ thiết bị: 30 ngày, bình thường: 8 giờ
    return new SignJWT({ ...payload })
        .setProtectedHeader({ alg: ALGORITHM })
        .setIssuedAt()
        .setExpirationTime(expiresIn)
        .sign(SECRET_KEY);
}

// Verify JWT — trả về payload nếu hợp lệ, null nếu hết hạn/giả mạo
export async function verifySession(token: string): Promise<SessionPayload | null> {
    try {
        const { payload } = await jwtVerify(token, SECRET_KEY, { algorithms: [ALGORITHM] });
        return payload as unknown as SessionPayload;
    } catch {
        return null; // Token hết hạn, sai chữ ký, hoặc bị giả mạo
    }
}
