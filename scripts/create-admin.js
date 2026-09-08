// 📍 File: scripts/create-admin.js
// Chạy 1 LẦN DUY NHẤT sau khi kéo code mới về để tạo tài khoản admin duy nhất.
// Cách chạy (trong thư mục dự án, máy đã có Node + đã set DATABASE_URL trong .env):
//
//   node scripts/create-admin.js "thanhnd" "MatKhauTamThoi123" "Nguyễn Đình Thanh"
//
// Sau khi chạy xong, đăng nhập bằng username/mật khẩu vừa tạo — hệ thống sẽ
// tự bắt buộc bạn đổi mật khẩu ngay lần đăng nhập đầu tiên.
// Nhớ thêm biến môi trường ADMIN_USERNAME=thanhnd (trùng username) trên Vercel
// để hệ thống chỉ cho đúng tài khoản này đăng nhập.

const { PrismaClient } = require("@prisma/client");
const { PrismaPg } = require("@prisma/adapter-pg");
const { Pool } = require("pg");
const bcrypt = require("bcryptjs");
require("dotenv").config();

async function main() {
    const [, , usernameArg, passwordArg, nameArg] = process.argv;
    const username = (usernameArg || "thanhnd").toLowerCase().trim();
    const password = passwordArg || "ChangeMe123!";
    const name = nameArg || "Nguyễn Đình Thanh";

    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    const adapter = new PrismaPg(pool);
    const prisma = new PrismaClient({ adapter });

    const hashed = await bcrypt.hash(password, 12);

    const existing = await prisma.user.findUnique({ where: { username } });

    if (existing) {
        await prisma.user.update({
            where: { username },
            data: {
                password: hashed,
                name,
                role: "ADMIN",
                status: "HOAT_DONG",
                mustChangePassword: true,
            },
        });
        console.log(`✅ Đã CẬP NHẬT tài khoản admin: ${username} / mật khẩu tạm: ${password}`);
    } else {
        await prisma.user.create({
            data: {
                username,
                password: hashed,
                name,
                role: "ADMIN",
                status: "HOAT_DONG",
                mustChangePassword: true,
            },
        });
        console.log(`✅ Đã TẠO tài khoản admin: ${username} / mật khẩu tạm: ${password}`);
    }

    console.log("⚠️  Nhớ đổi mật khẩu ngay khi đăng nhập lần đầu.");
    await prisma.$disconnect();
}

main().catch((err) => {
    console.error("❌ Lỗi tạo tài khoản admin:", err);
    process.exit(1);
});
