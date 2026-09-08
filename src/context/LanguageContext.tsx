"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect } from "react";
import vi from "@/locales/vi.json";
import en from "@/locales/en.json";
import Cookies from "js-cookie";

type Language = "VN" | "EN";

interface LanguageContextType {
    language: Language;
    setLanguage: (lang: Language) => void;
    t: (key: string) => any;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
    const [language, setLanguageState] = useState<Language>("VN");
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        const savedLang = localStorage.getItem("language") as Language;
        if (savedLang === "VN" || savedLang === "EN") {
            setLanguageState(savedLang);
            Cookies.set("language", savedLang, { expires: 365 });
        } else {
            Cookies.set("language", "VN", { expires: 365 });
        }
    }, []);

    const setLanguage = (lang: Language) => {
        setLanguageState(lang);
        localStorage.setItem("language", lang);
        Cookies.set("language", lang, { expires: 365 });
    };

    const resolveKey = (obj: any, path: string) => {
        return path.split(".").reduce((acc, part) => acc && acc[part], obj);
    };

    const t = (key: string): any => {
        const currentDict = language === "VN" ? vi : en;
        let translation = resolveKey(currentDict, key);

        if (translation === undefined && language === "EN") {
            translation = resolveKey(vi, key);
        }

        if (translation === undefined) {
            return key; 
        }

        return translation;
    };

    if (!mounted) return (
        <LanguageContext.Provider value={{ language: "VN", setLanguage: () => {}, t: (key) => key }}>
            {children}
        </LanguageContext.Provider>
    );

    return (
        <LanguageContext.Provider value={{ language, setLanguage, t }}>
            {children}
        </LanguageContext.Provider>
    );
}

export function useLanguage() {
    const context = useContext(LanguageContext);
    
    if (context === undefined) {
        // Fallback an toàn thay vì crash ứng dụng
        console.warn("useLanguage: context is missing. Ensure component is wrapped in LanguageProvider.");
        return {
            language: "VN" as Language,
            setLanguage: () => {},
            t: (key: string) => key
        };
    }
    
    return context;
}