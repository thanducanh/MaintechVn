import { NextResponse } from "next/server";
import { upsertAboutAction } from "@/actions/about";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const result = await upsertAboutAction(formData);
    return NextResponse.json(result, { status: result?.success ? 200 : 400 });
  } catch (error: any) {
    console.error("Save CMS Error (About API):", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Lỗi server khi lưu About" },
      { status: 500 }
    );
  }
}
