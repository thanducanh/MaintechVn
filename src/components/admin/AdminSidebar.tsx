// 📍 File: src/components/Navbar.tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, Globe, User, Image as ImageIcon } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import Cookies from "js-cookie";
import { motion, AnimatePresence } from "framer-motion";
import { getSiteLogoAction } from "@/actions/settings";

// Biến Global để lưu Logo vào RAM, giúp chuyển mục KHÔNG BAO GIỜ bị load lại
let cachedLogo: string | null | undefined = undefined;

export default function Navbar() {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [siteLogo, setSiteLogo] = useState<string | null>(cachedLogo !== undefined ? cachedLogo : null);
    
    const { language, setLanguage } = useLanguage();
    const pathname = usePathname();

    useEffect(() => {
        setIsLoggedIn(!!Cookies.get('maintech_session'));
        const handleScroll = () => setIsScrolled(window.scrollY > 20);
        window.addEventListener("scroll", handleScroll);

        // Lấy Logo một lần duy nhất và ghim vào RAM
        if (cachedLogo === undefined) {
            getSiteLogoAction().then(logo => {
                cachedLogo = logo;
                setSiteLogo(logo);
            });
        }

        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const navLinks = [
        { name: "Trang Chủ", href: "/" },
        { name: "Về Chúng Tôi", href: "/about" }, 
        { name: "Dịch Vụ", href: "/services" }, 
        { name: "Tin Tức", href: "/news" },
        { name: "Liên Hệ", href: "/contact" },
    ];

    return (
        <nav className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-300 ${isScrolled ? "bg-white shadow-md py-4 text-slate-900" : "bg-black/20 backdrop-blur-sm py-6 text-white"}`}>
            <div className="max-w-[1600px] mx-auto px-6 flex justify-between items-center relative">
                <Link href="/" className="flex items-center gap-3 group min-w-[150px]">
                    {siteLogo ? (
                        <img src={siteLogo} className={`transition-all duration-300 object-contain ${isScrolled ? "h-10" : "h-12"}`} />
                    ) : (
                        <div className="flex items-center gap-2">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${isScrolled ? "bg-slate-100 text-slate-400" : "bg-white/10 text-white/50"}`}><ImageIcon size={20} /></div>
                            <div className="flex flex-col leading-none">
                                <span className={`text-lg font-black uppercase ${isScrolled ? "text-slate-900" : "text-white"}`}>MAINTECH <span className="text-premium-red drop-shadow-md">VN</span></span>
                            </div>
                        </div>
                    )}
                </Link>

                <div className="hidden lg:flex items-center space-x-7">
                    {navLinks.map((link) => (
                        <Link key={link.href} href={link.href} className={`text-xs font-black uppercase tracking-widest transition-colors ${pathname === link.href ? "text-premium-red drop-shadow-md" : isScrolled ? "text-slate-700 hover:text-premium-red drop-shadow-md" : "text-white/90 hover:text-premium-red drop-shadow-md"}`}>
                            {link.name}
                        </Link>
                    ))}
                    <div className="flex items-center space-x-4 border-l pl-5 ml-2 border-white/20">
                        <button onClick={() => setLanguage(language === "VN" ? "EN" : "VN")} className="flex items-center gap-1 text-[11px] font-black"><Globe size={16}/>{language}</button>
                        <Link href="/admin" className={`p-2 rounded-full ${isLoggedIn ? "bg-premium-red text-white" : "hover:text-premium-red drop-shadow-md"}`}><User size={18}/></Link>
                    </div>
                </div>

                <button className="lg:hidden" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>{isMobileMenuOpen ? <X size={26} /> : <Menu size={26} />}</button>
            </div>
            
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="lg:hidden absolute top-full left-0 w-full bg-white shadow-2xl flex flex-col py-4">
                        {navLinks.map((link) => (
                            <Link key={link.href} href={link.href} onClick={() => setIsMobileMenuOpen(false)} className="px-6 py-4 text-xs font-black uppercase text-slate-700 hover:bg-slate-50">{link.name}</Link>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
}
