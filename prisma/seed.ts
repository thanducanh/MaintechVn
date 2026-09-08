import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient({
  datasourceUrl: process.env.DIRECT_URL ?? process.env.DATABASE_URL,
});

const ADMIN_USERNAME = "nguyendinhthanh";
const ADMIN_PASSWORD = "123456";
const ADMIN_NAME = "Nguyễn Đình Thanh";

async function main() {
  const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 12);

  await prisma.$transaction(async (tx) => {
    await tx.adminUser.deleteMany({
      where: { username: { not: ADMIN_USERNAME } },
    });

    await tx.adminUser.upsert({
      where: { username: ADMIN_USERNAME },
      create: {
        username: ADMIN_USERNAME,
        displayName: ADMIN_NAME,
        passwordHash,
        role: "ADMIN",
      },
      update: {
        displayName: ADMIN_NAME,
        passwordHash,
        role: "ADMIN",
      },
    });
  });

  console.log(`Admin account synchronized: ${ADMIN_USERNAME}`);
}

main()
  .catch((error) => {
    console.error("Admin seed failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
