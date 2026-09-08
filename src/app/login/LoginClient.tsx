// 📍 File: src/app/login/LoginClient.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, User, Loader2, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

export default function LoginClient() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password, rememberMe }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error);
        setIsLoading(false);
        return;
      }

      if (data.role === 'KHACH') {
        setError("Tài khoản Khách không được phép truy cập trang Admin!");
        await fetch("/api/auth/logout", { method: "POST" });
        setIsLoading(false);
        return;
      }

      router.refresh(); 
      router.replace("/admin");
    } catch (err: any) {
      setError("Lỗi kết nối máy chủ!");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 relative overflow-hidden">
      {/* Industrial Grid Pattern Background */}
      <div className="absolute inset-0 opacity-[0.45] pointer-events-none"
          style={{ backgroundImage: "linear-gradient(#e2e8f0 1px, transparent 1px), linear-gradient(90deg, #e2e8f0 1px, transparent 1px)", backgroundSize: "64px 64px" }}
      />
      
      {/* Decorative Accents */}
      <div className="absolute top-0 left-0 w-full h-1 bg-premium-red" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-red-100/70 rounded-full blur-[120px] pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md relative z-10 px-4 sm:px-6"
      >
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/70 sm:p-10 md:p-12">
          <div className="text-center mb-8">
            <div className="inline-flex flex-col items-center gap-1 mb-6">
              <div className="flex items-baseline">
                <span className="text-3xl font-black tracking-tighter text-[#C8102E]">MAIN</span>
                <span className="text-3xl font-black tracking-tighter text-[#00A3FF]">TECH</span>
                <span className="text-3xl font-black tracking-tighter text-slate-900">VN</span>
              </div>
              <span className="text-[9px] font-black uppercase tracking-[0.4em] text-slate-400">Industrial excellence</span>
            </div>
            <h1 className="text-sm font-black text-slate-900 uppercase tracking-[0.3em] mb-2">HỆ THỐNG ĐIỀU HÀNH</h1>
            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">INTERNAL ACCESS ONLY</p>
          </div>

          {error && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-4 mb-6 text-[11px] font-black uppercase tracking-widest text-white bg-premium-red text-center rounded-lg"
            >
              {error}
            </motion.div>
          )}

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-5">
              <div className="relative group">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2 block transition-colors group-focus-within:text-[#C8102E]">
                  Tên đăng nhập
                </label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#C8102E] transition-colors" size={18} />
                  <input
                    type="text"
                    required
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3.5 pl-12 pr-4 text-slate-900 font-bold focus:outline-none focus:border-[#C8102E] focus:bg-white focus:ring-4 focus:ring-[#C8102E]/10 transition-all placeholder:text-slate-300"
                    placeholder="USERNAME"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                  />
                </div>
              </div>

              <div className="relative group">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2 block transition-colors group-focus-within:text-[#C8102E]">
                  Mật khẩu
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#C8102E] transition-colors" size={18} />
                  <input
                    type="password"
                    required
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3.5 pl-12 pr-4 text-slate-900 font-bold focus:outline-none focus:border-[#C8102E] focus:bg-white focus:ring-4 focus:ring-[#C8102E]/10 transition-all placeholder:text-slate-300"
                    placeholder="PASSWORD"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-3 cursor-pointer group">
                <input 
                  type="checkbox" 
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 text-premium-red focus:ring-0 cursor-pointer" 
                />
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest group-hover:text-slate-900 transition-colors">
                  Ghi nhớ
                </span>
              </label>
              <button type="button" className="text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-premium-red drop-shadow-md transition-colors">
                Quên mật khẩu?
              </button>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full rounded-xl bg-[#C8102E] py-4 text-white font-black uppercase text-[11px] tracking-[0.3em] transition-all duration-300 flex justify-center items-center gap-4 shadow-lg shadow-red-900/20 hover:bg-[#9F0D25] active:scale-[0.98] disabled:opacity-50"
            >
              {isLoading ? <Loader2 className="animate-spin h-5 w-5" /> : (
                <>
                  ĐĂNG NHẬP <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>
        </div>
        
        <p className="text-center mt-12 text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] opacity-50">
          © {new Date().getFullYear()} MAINTECH VIETNAM
        </p>
      </motion.div>
    </div>
  );
}
