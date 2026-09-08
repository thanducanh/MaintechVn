"use client";

import { FormEvent, useState } from "react";
import { LockKeyhole, LogIn, UserRound } from "lucide-react";

export default function AdminLoginPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");
    const form = new FormData(event.currentTarget);

    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: form.get("username"), password: form.get("password") }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Đăng nhập thất bại.");
      window.location.href = "/admin";
    } catch (loginError) {
      setError(loginError instanceof Error ? loginError.message : "Đăng nhập thất bại.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#0B0F19] px-6 py-16">
      <div className="w-full max-w-md border border-slate-800 bg-slate-900 p-8 shadow-2xl sm:p-10">
        <div className="mb-8 border-b border-slate-800 pb-6"><p className="text-xs font-bold uppercase tracking-[0.25em] text-red-500">Maintech Vietnam</p><h1 className="mt-3 text-3xl font-black uppercase text-white">Admin CMS</h1><p className="mt-2 text-sm text-slate-400">Đăng nhập vào hệ thống quản trị</p></div>
        <form onSubmit={handleSubmit} className="space-y-5">
          <label className="block text-sm font-semibold text-slate-300">Tên đăng nhập<div className="relative mt-2"><UserRound className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} /><input name="username" required autoComplete="username" className="w-full border border-slate-700 bg-[#0B0F19] px-12 py-3 text-white outline-none focus:border-red-500" /></div></label>
          <label className="block text-sm font-semibold text-slate-300">Mật khẩu<div className="relative mt-2"><LockKeyhole className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} /><input name="password" type="password" required autoComplete="current-password" className="w-full border border-slate-700 bg-[#0B0F19] px-12 py-3 text-white outline-none focus:border-red-500" /></div></label>
          {error && <p role="alert" className="border border-red-500/30 bg-red-950/30 p-3 text-sm text-red-400">{error}</p>}
          <button type="submit" disabled={loading} className="flex w-full items-center justify-center gap-2 bg-red-600 px-6 py-4 font-bold uppercase text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60">{loading ? "Đang xác thực..." : "Đăng nhập"} {!loading && <LogIn size={18} />}</button>
        </form>
      </div>
    </main>
  );
}
