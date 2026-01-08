"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import dynamic from "next/dynamic";
import { useTranslation } from "@/i18n/useTranslation";
import { useRouter, usePathname } from "next/navigation";
import BlurReveal from "@/components/ui/BlurReveal";
import { motion, AnimatePresence } from "framer-motion";

// Defer non-critical header widgets
const CartIcon = dynamic(() => import("../Cart/CartIcon"), {
  ssr: false,
  loading: () => <span className="inline-block w-6 h-6" aria-hidden="true" />,
});

const AuthButton = dynamic(() => import("../auth/AuthButton"), {
  ssr: false,
  loading: () => null,
});

type Lang = "ru" | "uzb" | "eng";

interface MenuItem {
  id: string;
  href: string;
  translationKey: string;
}

export default function Header() {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const pathname = usePathname();

  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const headerRef = useRef<HTMLDivElement | null>(null);

  // Normalize language code for display (i18n uses 'en'/'uz', but we need 'eng'/'uzb' for comparison)
  const normalizeLangForDisplay = (lang: string): Lang => {
    const normalized = lang.toLowerCase();
    if (normalized === "en" || normalized === "eng") return "eng";
    if (normalized === "uz" || normalized === "uzb") return "uzb";
    return "ru";
  };
  
  const currentLanguage = normalizeLangForDisplay(i18n.language || "ru");

  const menuLeft: MenuItem[] = [
    { id: "catalog", href: "/catalog", translationKey: "header.catalog" },
    { id: "guide", href: "/guide", translationKey: "header.guide" },
    { id: "about", href: "/about", translationKey: "header.about" },
    { id: "contacts", href: "/contacts", translationKey: "header.contacts" },
    { id: "documents", href: "/documents", translationKey: "header.documents" },
  ];

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (headerRef.current && !headerRef.current.contains(target)) {
        setMobileOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const changeLanguage = (lng: Lang) => {
    // Convert legacy codes to standard codes for i18n
    const uiCode = lng === "eng" ? "en" : lng === "uzb" ? "uz" : "ru";
    const backendCode = lng === "eng" ? "eng" : lng === "uzb" ? "uzb" : "ru";
    
    // Небольшая задержка для плавности
    setTimeout(() => {
      // Update i18n with standard code
      i18n.changeLanguage(uiCode);
      
      // Set cookies: UI uses standard codes, backend uses legacy codes
      document.cookie = `i18next=${uiCode}; path=/; max-age=31536000; SameSite=Lax`;
      document.cookie = `lang=${backendCode}; path=/; max-age=31536000; SameSite=Lax`;
      try {
        localStorage.setItem("i18nextLng", uiCode);
      } catch { }
      router.refresh();
    }, 150);
  };

  const languages: { code: Lang; label: string }[] = [
    { code: "ru", label: "RU" },
    { code: "uzb", label: "UZ" },
    { code: "eng", label: "EN" },
  ];

  if (pathname === "/login" || pathname === "/register") {
    return null;
  }

  return (
    <>
      {/* Header reveal animation */}
      <header
        ref={headerRef}
        className={`fixed top-0 left-0 right-0 z-[999] w-full
            border-b border-neutral-200
            bg-white/80 backdrop-blur
            supports-[backdrop-filter]:bg-white/70
            transition-shadow duration-200
            ${isScrolled ? "shadow-sm" : "shadow-none"}
            `}
        style={{
          paddingTop: "max(0px, env(safe-area-inset-top))",
          WebkitTransform: "translateZ(0)",
        }}
      >
        <BlurReveal>
          <div
            className="container-section flex min-h-[58px] items-center justify-between gap-2"
            style={{
              paddingLeft: "max(12px, env(safe-area-inset-left))",
              paddingRight: "max(12px, env(safe-area-inset-right))",
            }}
          >
            {/* LEFT */}
            <div className="flex min-w-[44px] items-center justify-start">
              <button
                onClick={() => setMobileOpen((v) => !v)}
                aria-label={mobileOpen ? "Close menu" : "Open menu"}
                aria-expanded={mobileOpen}
                className="relative z-[1002] lg:hidden inline-flex items-center justify-center w-11 h-11 -ml-1 rounded-md"
              >
                <span className={`block w-7 h-[2px] bg-brand transition-transform ${mobileOpen ? "translate-y-[10px] rotate-45" : ""}`} />
                <span className={`block w-7 h-[2px] bg-brand my-[6px] transition-opacity ${mobileOpen ? "opacity-0" : "opacity-100"}`} />
                <span className={`block w-7 h-[2px] bg-brand transition-transform ${mobileOpen ? "-translate-y-[10px] -rotate-45" : ""}`} />
              </button>

              <nav className="hidden lg:flex items-center gap-[28px]">
                {menuLeft.map((item) => (
                  <Link
                    key={item.id}
                    href={item.href}
                    className="nav-underline text-[14.7px] font-medium tracking-[0.02em] text-brand"
                  >
                    {t(item.translationKey)}
                  </Link>
                ))}
              </nav>
            </div>

            {/* LOGO */}
            <div className="flex flex-1 items-center justify-center">
              <Link href="/" aria-label="Go home">
                <Image
                  src="/OtherPics/logo.svg"
                  alt="POJ PRO"
                  width={180}
                  height={60}
                  className="object-contain transition-transform duration-200 hover:scale-[1.05]
                  w-[140px] xs:w-[150px] sm:w-[170px] md:w-[180px] lg:w-[190px] xl:w-[200px]"
                />
              </Link>
            </div>

            {/* RIGHT */}
            <div className="flex min-w-[44px] items-center justify-end gap-2">
              <div className="md:hidden text-brand">
                <CartIcon />
              </div>

              <div className="hidden md:flex items-center gap-2 md:gap-3">
                <CartIcon />
                <AuthButton />
              </div>
            </div>
          </div>

          {/* Mobile menu */}
          {mobileOpen && (
            <nav className="lg:hidden border-t border-neutral-200 bg-white">
              {menuLeft.map((item) => (
                <Link
                  key={item.id}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className="block px-5 py-4 text-[17px] text-brand border-b border-neutral-200"
                >
                  {t(item.translationKey)}
                </Link>
              ))}
              <div className="px-4 py-3 border-b border-neutral-200">
                <AuthButton />
              </div>
            </nav>
          )}
        </BlurReveal>
      </header>

      {/* Language Switcher Bar - Below Header */}
      <div className="fixed top-[58px] left-0 right-0 z-[998]">
        <div className="container-section flex items-center justify-end py-1.5"
          style={{
            paddingLeft: "max(12px, env(safe-area-inset-left))",
            paddingRight: "max(12px, env(safe-area-inset-right))",
          }}
        >
          <div className="flex items-center gap-0.5 bg-white/60 backdrop-blur-sm rounded-lg border border-gray-200/50 p-0.5 shadow-sm">
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => changeLanguage(lang.code)}
                className={`relative px-2.5 py-0.5 text-[10px] font-medium rounded-md transition-all duration-300 ${
                  currentLanguage === lang.code
                    ? "text-white shadow-sm"
                    : "text-gray-500 hover:text-[#660000] hover:bg-gray-50/50"
                }`}
              >
                {currentLanguage === lang.code && (
                  <motion.div
                    layoutId="activeLangBar"
                    className="absolute inset-0 bg-[#660000] rounded-md"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.5 }}
                  />
                )}
                <motion.span
                  key={currentLanguage}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.2 }}
                  className="relative z-10"
                >
                  {lang.label}
                </motion.span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Spacer */}
      <div className="h-[90px] lg:hidden" aria-hidden />
    </>
  );
}
