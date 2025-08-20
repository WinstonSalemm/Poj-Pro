"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useTranslation } from "@/i18n/useTranslation";
import { CartIcon } from "../Cart/CartIcon";
import { AuthButton } from "../auth/AuthButton";
import { useRouter } from "next/navigation";

type Lang = "ru" | "uzb" | "eng";

interface MenuItem {
  id: string;
  href: string;
  translationKey: string;
}

export default function Header() {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const headerRef = useRef<HTMLDivElement | null>(null);
  const switcherRef = useRef<HTMLDivElement | null>(null);
  const currentLanguage = (i18n.language as Lang) || "ru";

  const menuLeft: MenuItem[] = [
    { id: "catalog", href: "/catalog", translationKey: "header.catalog" },
    { id: "about", href: "/about", translationKey: "header.about" },
    { id: "contacts", href: "/contacts", translationKey: "header.contacts" },
    { id: "documents", href: "/documents", translationKey: "header.documents" },
    { id: "supplies", href: "/supplies", translationKey: "header.news" },
  ] as const;

  const menuRight: MenuItem[] = [] as const;

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (switcherRef.current && !switcherRef.current.contains(e.target as Node)) setLangOpen(false);
      if (headerRef.current && !headerRef.current.contains(e.target as Node)) setMobileOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const changeLanguage = (lng: Lang) => {
    // Update i18next client
    i18n.changeLanguage(lng);
    // Persist cookie for SSR locale detection (read by getLocale())
    const normalized = lng === "eng" ? "eng" : lng === "uzb" ? "uzb" : "ru";
    document.cookie = `i18next=${normalized}; path=/; max-age=31536000`;
    // Refresh to re-render server components with new cookie
    router.refresh();
    setLangOpen(false);
  };

  return (
    <header
      ref={headerRef}
      className={`fixed top-0 z-[999] w-full border-b border-[#660000] bg-[#f8f8f8] transition-[box-shadow] duration-200 ${
        isScrolled ? "hdr-shadow-on" : "hdr-shadow"
      }`}
    >
      {/* ROW */}
      <div className="mx-auto flex min-h-[68px] max-w-[1380px] items-center justify-between gap-2 px-3 sm:px-6 lg:px-8">
        {/* LEFT: Burger (mobile) / Left nav (desktop) */}
        <div className="flex min-w-[44px] items-center justify-start">
          {/* Burger: видим ДО lg */}
          <button
            onClick={() => {
              setMobileOpen((v) => !v);
              setLangOpen(false);
            }}
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            className="z-[22] flex h-6 w-8 flex-col justify-between lg:hidden"
          >
            <span
              className={`h-[2px] rounded bg-[#660000] transition-transform duration-300 ${
                mobileOpen ? "translate-y-[10px] rotate-45" : ""
              }`}
            />
            <span
              className={`h-[2px] rounded bg-[#660000] transition-opacity duration-300 ${
                mobileOpen ? "opacity-0" : "opacity-100"
              }`}
            />
            <span
              className={`h-[2px] rounded bg-[#660000] transition-transform duration-300 ${
                mobileOpen ? "-translate-y-[10px] -rotate-45" : ""
              }`}
            />
          </button>

          {/* Desktop left menu */}
          <nav className="hidden items-center gap-[28px] lg:flex">
            {menuLeft.map((item, idx) => (
              <Link
                key={item.id}
                href={item.href}
                className="nav-underline relative bg-transparent text-[14.7px] font-medium tracking-[0.02em] !text-[#660000] hover:text-[#660000]"
                style={{ animationDelay: `${0.08 + idx * 0.07}s` }}
              >
                {t(item.translationKey)}
              </Link>
            ))}
          </nav>
        </div>

        {/* CENTER: Logo */}
        <div className="flex flex-1 items-center justify-center">
          <Link href="/" aria-label="Go home" className="block">
            <Image
              src="/OtherPics/logo.svg"
              alt="POJ PRO"
              width={180}
              height={60}
              className="
                object-contain transition-transform duration-200 hover:scale-[1.05]
                w-[140px] xs:w-[150px] sm:w-[170px] md:w-[180px] lg:w-[190px] xl:w-[200px]
                max-[377px]:w-[128px]"
              priority
            />
          </Link>
        </div>

        {/* RIGHT: compact (mobile) / full (desktop) */}
        <div className="flex min-w-[44px] items-center justify-end gap-2">
          {/* Mobile compact controls */}
          <div className="flex flex-wrap items-center justify-end gap-2 lg:hidden">
            {/* Cart */}
            <div className="text-[#660000] shrink-0">
              <CartIcon />
            </div>

            {/* Language small */}
            <div className="relative shrink-0" ref={switcherRef}>
              <button
                type="button"
                className="flex items-center gap-1 rounded-md border border-gray-300 bg-white px-2 py-1 text-xs font-medium text-gray-700 shadow-sm hover:bg-gray-50 whitespace-nowrap
                           max-[380px]:px-1.5 max-[380px]:text-[10.5px]"
                onClick={() => setLangOpen(!langOpen)}
                aria-expanded={langOpen}
                aria-haspopup="true"
              >
                {currentLanguage.toUpperCase()}
                <svg
                  className={`h-3.5 w-3.5 transition-transform ${langOpen ? "rotate-180" : ""}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {langOpen && (
                <div className="absolute right-0 z-10 mt-2 w-24 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5">
                  <div className="py-1">
                    {(["ru", "uzb", "eng"] as Lang[]).map((lang) => (
                      <button
                        key={lang}
                        onClick={() => changeLanguage(lang)}
                        className={`block w-full px-3 py-2 text-left text-sm ${
                          currentLanguage === lang ? "bg-gray-100 text-gray-900" : "text-gray-700 hover:bg-gray-50"
                        }`}
                      >
                        {lang.toUpperCase()}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Desktop right menu + controls */}
          <nav className="hidden items-center gap-3 lg:flex">
            {menuRight.map((item, idx) => (
              <Link
                key={item.id}
                href={item.href}
                className="nav-underline relative bg-transparent text-[14.7px] font-medium tracking-[0.02em] !text-[#660000] hover:text-[#660000]"
                style={{ animationDelay: `${0.36 + idx * 0.07}s` }}
              >
                {t(item.translationKey)}
              </Link>
            ))}

            <div className="text-[#660000]">
              <CartIcon />
            </div>

            {/* На десктопе можно тоже использовать бренд-кнопку обычного размера */}
            <AuthButton />

            {/* Language (desktop) */}
            <div className="relative" ref={switcherRef}>
              <button
                type="button"
                className="flex cursor-pointer items-center gap-1 rounded-md border border-gray-300 bg-white px-2.5 py-1.5 text-xs md:text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
                onClick={() => setLangOpen(!langOpen)}
                aria-expanded={langOpen}
                aria-haspopup="true"
              >
                {currentLanguage.toUpperCase()}
                <svg
                  className={`h-3.5 w-3.5 md:h-4 md:w-4 transition-transform ${langOpen ? "rotate-180" : ""}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {langOpen && (
                <div className="absolute right-0 z-10 mt-2 w-20 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5">
                  <div className="py-1">
                    {(["ru", "uzb", "eng"] as Lang[]).map((lang) => (
                      <button
                        key={lang}
                        onClick={() => changeLanguage(lang)}
                        className={`block w-full px-4 py-2 text-left text-sm ${
                          currentLanguage === lang ? "bg-gray-100 text-gray-900" : "text-gray-700 hover:bg-gray-50"
                        }`}
                      >
                        {lang.toUpperCase()}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </nav>
        </div>
      </div>

      {/* Mobile menu (до lg) */}
      <nav
        className={`absolute left-0 right-0 top-[68px] border-b border-[#f2f2f2] bg-white shadow-[0_3px_24px_rgba(102,0,0,0.08)] lg:hidden ${
          mobileOpen ? "flex flex-col" : "hidden"
        }`}
      >
        {[...menuLeft, ...menuRight].map((item: MenuItem) => (
          <Link
            key={item.id}
            href={item.href}
            onClick={() => setMobileOpen(false)}
            className="w-full border-b border-[#eee] px-[20px] py-[16px] text-left text-[17px] !text-[#660000] hover:bg-gray-50"
          >
            {t(item.translationKey)}
          </Link>
        ))}
        {/* Auth actions inside burger with slightly different style */}
        <div className="px-4 py-3 flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              try { (async () => { (await import("next-auth/react")).signIn(); })(); } catch {}
              setMobileOpen(false);
            }}
            className="flex-1 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-800 hover:bg-gray-50"
          >
            {t('auth.signIn')}
          </button>
          <Link
            href="/register"
            onClick={() => setMobileOpen(false)}
            className="flex-1 text-center rounded-md bg-[#660000] px-3 py-2 text-sm font-semibold text-white hover:bg-[#520000]"
          >
            {t('auth.register')}
          </Link>
        </div>
      </nav>
    </header>
  );
}
