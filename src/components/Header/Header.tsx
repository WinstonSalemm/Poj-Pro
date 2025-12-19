"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import dynamic from "next/dynamic";
import { useTranslation } from "@/i18n/useTranslation";
import { useRouter, usePathname } from "next/navigation";
import BlurReveal from "@/components/ui/BlurReveal";

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
  const [langOpen, setLangOpen] = useState(false);

  const headerRef = useRef<HTMLDivElement | null>(null);
  const switcherMobileRef = useRef<HTMLDivElement | null>(null);
  const switcherDesktopRef = useRef<HTMLDivElement | null>(null);

  const currentLanguage = (i18n.language as Lang) || "ru";

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
      const inMobile = switcherMobileRef.current?.contains(target);
      const inDesktop = switcherDesktopRef.current?.contains(target);

      if (!inMobile && !inDesktop) setLangOpen(false);
      if (headerRef.current && !headerRef.current.contains(target)) {
        setMobileOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const changeLanguage = (lng: Lang) => {
    i18n.changeLanguage(lng);
    const normalized = lng === "eng" ? "eng" : lng === "uzb" ? "uzb" : "ru";
    document.cookie = `i18next=${normalized}; path=/; max-age=31536000; SameSite=Lax`;
    document.cookie = `lang=${normalized}; path=/; max-age=31536000; SameSite=Lax`;
    try {
      localStorage.setItem("i18nextLng", normalized);
    } catch { }
    router.refresh();
    setLangOpen(false);
  };

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
                onClick={() => {
                  setMobileOpen((v) => !v);
                  setLangOpen(false);
                }}
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
              <div className="lg:hidden text-brand">
                <CartIcon />
              </div>

              <div className="hidden lg:flex items-center gap-3">
                <CartIcon />
                <AuthButton />

                <div className="relative" ref={switcherDesktopRef}>
                  <button
                    onClick={() => setLangOpen(!langOpen)}
                    className="btn-ghost h-9 px-3 text-sm"
                  >
                    {currentLanguage.toUpperCase()}
                  </button>

                  {langOpen && (
                    <div className="absolute right-0 mt-2 w-20 rounded-md bg-white shadow-lg ring-1 ring-black/5">
                      {(["ru", "uzb", "eng"] as Lang[]).map((lang) => (
                        <button
                          key={lang}
                          onClick={() => changeLanguage(lang)}
                          className="block !color-[#660000] w-full px-4 py-2 text-sm text-left hover:bg-gray-50"
                        >
                          {lang.toUpperCase()}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
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
              <div className="px-4 py-3">
                <AuthButton />
              </div>
            </nav>
          )}
        </BlurReveal>
      </header>

      {/* Spacer */}
      <div className="h-[68px] lg:hidden" aria-hidden />
    </>
  );
}
