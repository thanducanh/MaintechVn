import prisma from '../src/lib/prisma';
import fs from 'fs';
import path from 'path';

const SCAN_DIRS = ["public/uploads", "public/images"];
const IGNORED_FILES = [".DS_Store", "thumbs.db"];

function guessMimeType(ext: string): string {
    const e = ext.toLowerCase();
    if (e === ".png") return "image/png";
    if (e === ".jpg" || e === ".jpeg") return "image/jpeg";
    if (e === ".gif") return "image/gif";
    if (e === ".webp") return "image/webp";
    if (e === ".pdf") return "application/pdf";
    if (e === ".doc" || e === ".docx") return "application/msword";
    if (e === ".xls" || e === ".xlsx") return "application/vnd.ms-excel";
    return "application/octet-stream";
}

function guessModule(filePath: string): string {
    const p = filePath.toLowerCase();
    if (p.includes("products") || p.includes("product")) return "PRODUCTS";
    if (p.includes("articles") || p.includes("news")) return "ARTICLES";
    if (p.includes("home") || p.includes("banner")) return "HOME";
    if (p.includes("about")) return "ABOUT";
    if (p.includes("contact")) return "CONTACT";
    if (p.includes("feedback")) return "FEEDBACK";
    if (p.includes("system") || p.includes("avatar")) return "SYSTEM";
    return "UNKNOWN";
}

async function scanDirectory(dir: string, fileList: string[] = []) {
    if (!fs.existsSync(dir)) return fileList;
    
    const files = fs.readdirSync(dir);
    for (const file of files) {
        if (IGNORED_FILES.includes(file) || file.startsWith(".")) continue;
        
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            if (file === ".next" || file === "node_modules") continue;
            await scanDirectory(fullPath, fileList);
        } else {
            fileList.push(fullPath);
        }
    }
    return fileList;
}

async function main() {
    console.log("Starting FileAsset backfill...");
    
    const admin = await prisma.user.findFirst({
        where: { role: { in: ["ADMIN", "SUPERADMIN", "GIAM_DOC"] }, isDeleted: false },
        select: { id: true }
    });

    if (!admin) {
        console.error("Không tìm thấy admin user để gán uploadedById fallback");
        process.exit(1);
    }

    let totalFiles = 0;
    let upsertedFiles = 0;

    for (const scanDir of SCAN_DIRS) {
        const rootPath = path.join(process.cwd(), scanDir);
        const files = await scanDirectory(rootPath);
        
        for (const filePath of files) {
            totalFiles++;
            const stat = fs.statSync(filePath);
            const fileName = path.basename(filePath);
            const ext = path.extname(fileName);
            const mimeType = guessMimeType(ext);
            
            // Generate public path: e.g., /uploads/...
            // Path must be normalized to forward slashes for URLs
            const relativePath = path.relative(process.cwd(), filePath).replace(/\\/g, '/');
            let storagePath = relativePath.startsWith('public/') ? relativePath.substring(6) : '/' + relativePath;
            if (!storagePath.startsWith('/')) storagePath = '/' + storagePath;
            
            const moduleName = guessModule(storagePath);
            
            // Check if exists
            const existing = await prisma.fileAsset.findFirst({
                where: { storagePath }
            });

            if (!existing) {
                await prisma.fileAsset.create({
                    data: {
                        fileName,
                        fileSize: stat.size,
                        mimeType,
                        storagePath,
                        module: moduleName,
                        uploadedById: admin.id
                    }
                });
                upsertedFiles++;
                console.log(`[CREATED] ${storagePath}`);
            }
        }
    }

    console.log(`Backfill complete. Total files scanned: ${totalFiles}. Inserted: ${upsertedFiles}`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
