import { NextResponse } from "next/server";
import { uploadService } from "@/lib/upload-service";
import { getCurrentUser, hasRole } from "@/lib/auth";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    if (!(await hasRole("ADMIN", "GIAM_DOC", "QUAN_LY"))) {
      return NextResponse.json({ success: false, error: "Bạn không có quyền upload." }, { status: 403 });
    }

    const formData = await request.formData();
    const file = formData.get("file");
    if (!(file instanceof File) || file.size === 0) {
      return NextResponse.json({ success: false, error: "Tệp upload không hợp lệ." }, { status: 400 });
    }

    const allowed = ["video/mp4", "video/webm", "video/quicktime"];
    if (!allowed.includes(file.type)) {
      return NextResponse.json({ success: false, error: "Chỉ hỗ trợ MP4, WebM hoặc MOV." }, { status: 400 });
    }
    if (file.size > 100 * 1024 * 1024) {
      return NextResponse.json({ success: false, error: "Video không được vượt quá 100MB." }, { status: 413 });
    }

    const user = await getCurrentUser();
    const url = await uploadService.uploadFile(file, "home", "CMS_HOME", user?.id);
    return NextResponse.json({ success: true, url }, { status: 200 });
  } catch (error: any) {
    console.error("Video upload error:", error);
    return NextResponse.json({ success: false, error: error?.message || "Không thể upload video." }, { status: 500 });
  }
}
