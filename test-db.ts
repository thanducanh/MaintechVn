import { PrismaClient } from '@prisma/client'; const prisma = new PrismaClient(); async function main() { console.log(await prisma.article.findMany()); } main();
