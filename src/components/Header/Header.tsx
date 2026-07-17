"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import dynamic from "next/dynamic";
import { useTranslation } from "@/i18n/useTranslation";
import { useRouter, usePathname } from "next/navigation";
import BlurReveal from "@/components/ui/BlurReveal";
import { AnimatePresence, motion } from "framer-motion";
/** Мини-сцена: явный огонь → тушение ступенями (меню закрыто), цикл 16с */
function MenuExtinguisherIdle() {
  return (
    <svg
      viewBox="0 0 36 26"
      className="h-7 w-9 overflow-visible"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.85"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <defs>
        <radialGradient id="menuFlameGlow" cx="50%" cy="70%" r="50%">
          <stop offset="0%" stopColor="#ffb000" stopOpacity="0.7" />
          <stop offset="100%" stopColor="#ffb000" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Свечение под огнём */}
      <ellipse
        className="animate-menu-ext-idle-glow"
        cx="27.5"
        cy="20"
        rx="6"
        ry="4"
        fill="url(#menuFlameGlow)"
        stroke="none"
      />

      {/* Огонь — крупный, читаемый */}
      <g className="animate-menu-ext-idle-flame">
        <g className="animate-menu-ext-idle-flame-flicker">
          <path
            d="M27.5 21.5 C24.2 18.2, 24.8 14.2, 26.2 11.6 C26.6 13.4, 27.8 14.2, 27.8 14.2 C27.8 11.2, 29.2 9.2, 30.8 8 C31.4 10.6, 32.8 12.8, 32.8 15.6 C32.8 18.8, 30.6 21.5, 27.5 21.5 Z"
            fill="#d45500"
            stroke="none"
          />
          <path
            d="M27.5 21.2 C25.4 18.6, 25.8 15.6, 26.8 13.6 C27.1 14.8, 28 15.4, 28 15.4 C28 13.2, 28.9 11.6, 30 10.6 C30.4 12.4, 31.4 14, 31.4 16 C31.4 18.6, 29.8 21.2, 27.5 21.2 Z"
            fill="#ff8a00"
            stroke="none"
          />
          <path
            d="M27.6 21 C26.4 19.2, 26.7 17.2, 27.4 15.8 C27.6 16.6, 28.2 17, 28.2 17 C28.2 15.6, 28.8 14.6, 29.5 14 C29.8 15.2, 30.4 16.2, 30.4 17.4 C30.4 19.2, 29.2 21, 27.6 21 Z"
            fill="#ffd24a"
            stroke="none"
          />
          <ellipse cx="28.2" cy="19.6" rx="1.1" ry="1.6" fill="#fff3c4" stroke="none" opacity="0.9" />
        </g>
      </g>

      {/* Дым после тушения */}
      <g className="animate-menu-ext-idle-smoke" fill="#660000" stroke="none">
        <circle cx="27" cy="16" r="1.4" opacity="0.35" />
        <circle cx="29" cy="14.2" r="1.1" opacity="0.28" />
        <circle cx="26.2" cy="14.5" r="0.9" opacity="0.22" />
        <circle cx="28" cy="12.5" r="0.8" opacity="0.18" />
      </g>

      {/* Огнетушитель */}
      <g className="animate-menu-ext-idle-aim">
        <g className="animate-menu-ext-idle-recoil">
          <rect x="3" y="9" width="8" height="13" rx="2" fill="none" />
          <path d="M5.2 9V6.6h3.6V9" />
          <path d="M6 5.4h2" />
          <path d="M11 11.2 C13.2 9.4, 15.2 9.6, 16.8 10.8" />
          <rect x="16.4" y="9.6" width="2.6" height="2.2" rx="0.5" fill="currentColor" stroke="none" />

          {/* Струя: поток частиц пока тушит */}
          <g className="animate-menu-ext-idle-spray-loop" fill="currentColor" stroke="none">
            <circle className="animate-menu-ext-idle-spray-mid" cx="19.2" cy="10.6" r="1.2" style={{ animationDelay: "0ms" }} />
            <circle className="animate-menu-ext-idle-spray-up" cx="19.4" cy="9.6" r="1" style={{ animationDelay: "80ms" }} />
            <circle className="animate-menu-ext-idle-spray-down" cx="19.3" cy="11.6" r="0.95" style={{ animationDelay: "140ms" }} />
            <circle className="animate-menu-ext-idle-spray-mid" cx="19.7" cy="10.3" r="0.8" style={{ animationDelay: "210ms" }} />
            <circle className="animate-menu-ext-idle-spray-up" cx="19.5" cy="10" r="0.7" style={{ animationDelay: "280ms" }} />
          </g>
        </g>
      </g>
    </svg>
  );
}

/** Мини-огнетушитель со струей — когда меню открыто */
function MenuExtinguisherActive({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={`h-6 w-6 overflow-visible ${className}`}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <g className="animate-menu-ext-shake">
        <rect x="6" y="8" width="8" height="12" rx="2" />
        <path d="M8 8V6h4v2" />
        <path d="M9 5h2" />
        <path d="M14 10c2-1 3.5-.5 4.5.5" />
        <path d="M18.5 10.5h1.5" />
      </g>
      <g fill="currentColor" stroke="none">
        <circle className="animate-menu-ext-spray" cx="21" cy="10" r="1.1" style={{ animationDelay: "0ms" }} />
        <circle className="animate-menu-ext-spray" cx="21.5" cy="9.2" r="0.9" style={{ animationDelay: "120ms" }} />
        <circle className="animate-menu-ext-spray" cx="21.2" cy="10.8" r="0.85" style={{ animationDelay: "220ms" }} />
        <circle className="animate-menu-ext-spray" cx="22" cy="9.8" r="0.7" style={{ animationDelay: "320ms" }} />
      </g>
    </svg>
  );
}

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

function isAdminRoute(pathname: string | null): boolean {
  return Boolean(pathname?.startsWith("/admin"));
}

export default function Header() {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const pathname = usePathname();
  const isAdmin = isAdminRoute(pathname);

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
    document.documentElement.dataset.adminPanel = isAdmin ? "1" : "0";
    document.documentElement.style.setProperty(
      "--langbar-height",
      isAdmin ? "0px" : "46px",
    );
    if (isAdmin) {
      document.documentElement.style.setProperty("--topbar-height", "0px");
      setMobileOpen(false);
    }
    return () => {
      document.documentElement.removeAttribute("data-admin-panel");
      document.documentElement.style.removeProperty("--langbar-height");
    };
  }, [isAdmin]);

  useEffect(() => {
    if (isAdmin) return;
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (headerRef.current && !headerRef.current.contains(target)) {
        setMobileOpen(false);
      }
    };

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMobileOpen(false);
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isAdmin]);

  useEffect(() => {
    if (isAdmin || !mobileOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [mobileOpen, isAdmin]);

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

  if (isAdmin) {
    return (
      <header
        ref={headerRef}
        className={`fixed left-0 right-0 top-0 z-[999] w-full
            border-b border-neutral-200
            bg-white/80 backdrop-blur
            supports-[backdrop-filter]:bg-white/70
            transition-shadow duration-200
            ${isScrolled ? "shadow-sm" : "shadow-none"}
            `}
        style={{
          paddingTop: "env(safe-area-inset-top)",
          WebkitTransform: "translateZ(0)",
        }}
      >
        <BlurReveal>
          <div
            className="container-section relative flex min-h-[58px] items-center justify-center"
            style={{
              paddingLeft: "max(12px, env(safe-area-inset-left))",
              paddingRight: "max(12px, env(safe-area-inset-right))",
            }}
          >
            <Link href="/" aria-label="Go home" className="shrink-0">
              <Image
                src="/OtherPics/logo.svg"
                alt="POJ PRO"
                width={180}
                height={60}
                className="object-contain w-[140px] sm:w-[170px] md:w-[180px]"
              />
            </Link>
            <div
              className="absolute top-1/2 flex -translate-y-1/2 items-center"
              style={{
                right: "max(12px, env(safe-area-inset-right))",
              }}
            >
              <AuthButton />
            </div>
          </div>
        </BlurReveal>
      </header>
    );
  }

  return (
    <>
      {/* Header reveal animation */}
      <header
        ref={headerRef}
        className={`fixed left-0 right-0 z-[999] w-full
            border-b border-neutral-200
            bg-white/80 backdrop-blur
            supports-[backdrop-filter]:bg-white/70
            transition-shadow duration-200
            ${isScrolled ? "shadow-sm" : "shadow-none"}
            `}
        style={{
          top: "calc(var(--topbar-height, 36px) - 1px)",
          paddingTop: 0,
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
                aria-label={mobileOpen ? "Закрыть меню" : "Открыть меню"}
                aria-expanded={mobileOpen}
                aria-controls="mobile-navigation"
                className="relative z-[1002] lg:hidden inline-flex h-11 w-11 -ml-1 items-center justify-center overflow-visible rounded-md text-[#660000] transition-colors hover:bg-[#660000]/5 hover:text-[#8B0000]"
              >
                {mobileOpen ? <MenuExtinguisherActive /> : <MenuExtinguisherIdle />}
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

            {/* RIGHT — корзина всегда в шапке */}
            <div className="flex min-w-[44px] items-center justify-end gap-2 text-brand">
              <CartIcon />
            </div>
          </div>

          {/* Mobile menu — тот же тон, что у header (без второго белого слоя) */}
          <AnimatePresence initial={false}>
            {mobileOpen ? (
              <motion.nav
                key="mobile-nav"
                id="mobile-navigation"
                aria-label="Mobile navigation"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.28, ease: [0.22, 0.61, 0.36, 1] }}
                className="relative z-[1001] overflow-hidden border-t border-neutral-200 bg-transparent lg:hidden"
              >
                {menuLeft.map((item, index) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={{
                      duration: 0.22,
                      delay: 0.04 + index * 0.035,
                      ease: "easeOut",
                    }}
                  >
                    <Link
                      href={item.href}
                      onClick={() => setMobileOpen(false)}
                      className="block border-b border-neutral-200 bg-transparent px-5 py-4 text-[17px] text-brand transition-colors hover:bg-black/[0.03]"
                    >
                      {t(item.translationKey)}
                    </Link>
                  </motion.div>
                ))}
              </motion.nav>
            ) : null}
          </AnimatePresence>
        </BlurReveal>
      </header>

      <AnimatePresence>
        {mobileOpen ? (
          <motion.div
            key="mobile-nav-backdrop"
            aria-hidden="true"
            onClick={() => setMobileOpen(false)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22 }}
            className="fixed inset-0 z-[997] bg-black/25 backdrop-blur-[1px] lg:hidden"
          />
        ) : null}
      </AnimatePresence>

      {/* Auth + язык — всегда видны под шапкой */}
      <div
        className="fixed left-0 right-0 z-[998]"
        style={{
          top: `calc(var(--topbar-height, 28px) + 57px)`,
        }}
      >
        <div
          className="container-section flex items-center justify-between gap-2 py-1.5"
          style={{
            paddingLeft: "max(12px, env(safe-area-inset-left))",
            paddingRight: "max(12px, env(safe-area-inset-right))",
          }}
        >
          <div className="min-w-0 shrink">
            <AuthButton />
          </div>

          <div className="relative flex shrink-0 rounded-lg border border-gray-200/60 bg-white/80 p-0.5 shadow-sm backdrop-blur-sm">
            {/* Общий трек для индикатора — равные трети, без layoutId */}
            <div className="pointer-events-none absolute inset-0.5 overflow-hidden rounded-md">
              <motion.div
                className="h-full w-1/3 rounded-md bg-[#660000] shadow-sm"
                initial={false}
                animate={{ x: `${Math.max(0, languages.findIndex((l) => l.code === currentLanguage)) * 100}%` }}
                transition={{ type: "tween", duration: 0.22, ease: [0.22, 0.61, 0.36, 1] }}
              />
            </div>
            {languages.map((lang) => {
              const active = currentLanguage === lang.code;
              return (
                <button
                  key={lang.code}
                  type="button"
                  onClick={() => changeLanguage(lang.code)}
                  aria-label={`Language: ${lang.label}`}
                  aria-pressed={active}
                  className={`relative z-10 min-h-9 w-11 px-0 text-xs font-medium transition-colors duration-200 md:min-h-7 md:w-10 md:text-[10px] ${
                    active ? "text-white" : "text-gray-500 hover:text-[#660000]"
                  }`}
                >
                  {lang.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

    </>
  );
}
