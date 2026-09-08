"use client";

// 📍 File: src/app/change-password/ChangePasswordClient.tsx

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { changePasswordAction } from "@/actions/auth";
import { KeyRound, Loader2 } from "lucide-react";

export default function ChangePasswordClient({ forced }: { forced: boolean }) {
    const router = useRouter();
    const [password, setPassword] = useState("");
    const [confirm, setConfirm] = useState("");
    const [error, setError] = useState("");
    const [isPending, startTransition] = useTransition();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (password.length < 6) {
            setError("Mật khẩu mới phải có ít nhất 6 ký tự.");
            return;
        }
        if (password !== confirm) {
            setError("Mật khẩu nhập lại không khớp.");
            return;
        }

        startTransition(async () => {
            const res = await changePasswordAction(password);
            if (res.success) {
                router.push("/admin");
                router.refresh();
            } else {
                setError(res.message || "Có lỗi xảy ra.");
            }
        });
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
            <div className="bg-white rounded-3xl shadow-xl w-full max-w-sm p-8">
                <div className="w-12 h-12 rounded-2xl bg-[#C8102E] flex items-center justify-center mb-5">
                    <KeyRound size={22} className="text-white" />
                </div>
                <h1 className="text-xl font-black text-slate-900 mb-1">Đổi mật khẩu</h1>
                <p className="text-sm text-slate-500 font-medium mb-6">
                    {forced
                        ? "Đây là lần đăng nhập đầu tiên — bạn cần đặt mật khẩu mới trước khi tiếp tục."
                        : "Cập nhật mật khẩu tài khoản của bạn."}
                </p>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="text-xs font-bold uppercase tracking-wide text-slate-500">Mật khẩu mới</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="mt-1 w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#C8102E]"
                            placeholder="Tối thiểu 6 ký tự"
                            required
                        />
                    </div>
                    <div>
                        <label className="text-xs font-bold uppercase tracking-wide text-slate-500">Nhập lại mật khẩu</label>
                        <input
                            type="password"
                            value={confirm}
                            onChange={(e) => setConfirm(e.target.value)}
                            className="mt-1 w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#C8102E]"
                            required
                        />
                    </div>

                    {error && <p className="text-xs font-bold text-red-600">{error}</p>}

                    <button
                        type="submit"
                        disabled={isPending}
                        className="w-full bg-[#C8102E] hover:bg-[#A91D1D] text-white font-black uppercase tracking-wide text-sm rounded-xl py-3 flex items-center justify-center gap-2 transition-colors disabled:opacity-60"
                    >
                        {isPending && <Loader2 size={16} className="animate-spin" />}
                        Xác nhận
                    </button>
                </form>
            </div>
        </div>
    );
}
