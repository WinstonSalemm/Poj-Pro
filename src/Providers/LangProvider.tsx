"use client";
import { createContext, useContext, useEffect, useState, ReactNode } from "react";

type Lang = "ru" | "uz" | "en";
type Ctx = { lang: Lang; setLang: (l: Lang) => void };
const LangCtx = createContext<Ctx | null>(null);

const getInitialLang = (): Lang => {
  // Only access localStorage in the browser
  if (typeof window !== 'undefined') {
    const savedLang = localStorage.getItem("lang") as Lang | null;
    if (savedLang) return savedLang;
  }
  return "ru";
};

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>(getInitialLang);
  
  useEffect(() => {
    // Only update localStorage in the browser
    if (typeof window !== 'undefined') {
      localStorage.setItem("lang", lang);
    }
  }, [lang]);
  
  return <LangCtx.Provider value={{ lang, setLang }}>{children}</LangCtx.Provider>;
}

export const useLang = () => {
  const ctx = useContext(LangCtx);
  if (!ctx) throw new Error("useLang must be used within LangProvider");
  return ctx;
};
