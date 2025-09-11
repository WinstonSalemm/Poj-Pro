"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useTranslation } from "@/i18n/useTranslation";
import { useSession, signOut } from 'next-auth/react';
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
  const { data: session } = useSession();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const headerRef = useRef<HTMLDivElement | null>(null);
  // Separate refs for mobile and desktop language switchers to avoid false outside-clicks on mobile
  const switcherMobileRef = useRef<HTMLDivElement | null>(null);
  const switcherDesktopRef = useRef<HTMLDivElement | null>(null);
  const currentLanguage = (i18n.language as Lang) || "ru";

  const menuLeft: MenuItem[] = [
    { id: "catalog", href: "/catalog", translationKey: "header.catalog" },
    { id: "guide", href: "/guide", translationKey: "header.guide" },
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
      const target = e.target as Node;
      const inMobile = !!(switcherMobileRef.current && switcherMobileRef.current.contains(target));
      const inDesktop = !!(switcherDesktopRef.current && switcherDesktopRef.current.contains(target));
      if (!inMobile && !inDesktop) setLangOpen(false);
      if (headerRef.current && !headerRef.current.contains(target)) setMobileOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const changeLanguage = (lng: Lang) => {
    // Update i18next client
    i18n.changeLanguage(lng);
    // Persist cookie for SSR locale detection (read by getLocale())
    const normalized = lng === "eng" ? "eng" : lng === "uzb" ? "uzb" : "ru";
    document.cookie = `i18next=${normalized}; path=/; max-age=31536000; SameSite=Lax`;
    document.cookie = `lang=${normalized}; path=/; max-age=31536000; SameSite=Lax`;
    try { localStorage.setItem('i18nextLng', normalized); } catch {}
    // Refresh to re-render server components with new cookie
    router.refresh();
    setLangOpen(false);
  };

  return (
    <header
      ref={headerRef}
      className={`sticky top-0 z-[999] w-full border-b border-neutral-200 bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/70 transition-shadow duration-200 ${
        isScrolled ? "shadow-sm" : "shadow-none"
      }`}
      // iOS: защитим от «ухода» под вырез и наложений
      style={{
        paddingTop: "max(0px, env(safe-area-inset-top))", // iOS safe-area
        WebkitTransform: "translateZ(0)", // сглаживаем артефакты композитинга
      }}
    >
      {/* ROW */}
      <div
        className="container-section flex min-h-[68px] items-center justify-between gap-2"
        // iOS: safe-area по бокам, чтобы бургер не уползал под вырез
        style={{
          paddingLeft: "max(12px, env(safe-area-inset-left))",
          paddingRight: "max(12px, env(safe-area-inset-right))",
        }}
      >
        {/* Skip link to navigation to satisfy keyboard navigation test order */}
        <a
          href="#site-nav"
          className="sr-only focus:not-sr-only focus:absolute focus:left-2 focus:top-[52px] focus:z-[1003] focus:px-3 focus:py-2 focus:bg-white focus:text-[#660000] focus:rounded focus:shadow outline-none"
        >
          Skip to navigation
        </a>

        {/* LEFT: Burger (mobile) / Left nav (desktop) */}
        <div className="flex min-w-[44px] items-center justify-start">
          {/* Burger: видим ДО lg */}
          <button
            onClick={() => {
              setMobileOpen((v) => !v);
              setLangOpen(false);
            }}
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            aria-controls="mobile-nav"
            aria-expanded={mobileOpen}
            // iOS: увеличенная hit-area, явный цвет и высокий z-index
            className="relative z-[1002] lg:hidden inline-flex items-center justify-center w-11 h-11 -ml-1 rounded-md outline-none touch-manipulation focus-visible:ring-2 focus-visible:ring-brand/40"
            style={{ WebkitTapHighlightColor: "transparent" }}
          >
            {/* три полоски */}
            <span
              className={`block w-7 h-[2px] rounded bg-brand transition-transform duration-300 ${
                mobileOpen ? "translate-y-[10px] rotate-45" : ""
              }`}
            />
            <span
              className={`block w-7 h-[2px] rounded bg-brand transition-opacity duration-300 ${
                mobileOpen ? "opacity-0" : "opacity-100"
              }`}
              style={{ marginTop: 6, marginBottom: 6 }}
            />
            <span
              className={`block w-7 h-[2px] rounded bg-brand transition-transform duration-300 ${
                mobileOpen ? "-translate-y-[10px] -rotate-45" : ""
              }`}
            />
          </button>

          {/* Desktop left menu */}
          <nav id="site-nav" aria-label="Site navigation" className="hidden items-center gap-[28px] lg:flex">
            {menuLeft.map((item, idx) => (
              <Link
                key={item.id}
                href={item.href}
                className="nav-underline relative bg-transparent text-[14.7px] font-medium tracking-[0.02em] text-brand hover:text-brand"
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
            <div className="text-brand shrink-0">
              <CartIcon />
            </div>

            {/* Language small */}
            <div className="relative shrink-0" ref={switcherMobileRef}>
              <button
                type="button"
                className="btn-ghost h-8 px-2 text-xs whitespace-nowrap max-[380px]:px-1.5 max-[380px]:text-[10.5px]"
                onClick={() => setLangOpen(!langOpen)}
                aria-expanded={langOpen}
                aria-haspopup="true"
                aria-label="Language"
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
                <div className="absolute right-0 z-[1001] mt-2 w-24 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black/5">
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
          <nav aria-label="Site navigation" className="hidden items-center gap-3 lg:flex">
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

            <div className="text-brand">
              <CartIcon />
            </div>

            <AuthButton />

            {/* Language (desktop) */}
            <div className="relative" ref={switcherDesktopRef}>
              <button
                type="button"
                className="btn-ghost h-9 px-3 text-sm"
                onClick={() => setLangOpen(!langOpen)}
                aria-expanded={langOpen}
                aria-haspopup="true"
                aria-label="Language"
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
                <div className="absolute right-0 z-[1001] mt-2 w-20 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black/5">
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
        id="mobile-nav"
        aria-label="Site navigation"
        className={`absolute left-0 right-0 top-[68px] border-b border-neutral-200 bg-white shadow-[0_3px_24px_rgba(102,0,0,0.08)] lg:hidden ${
          mobileOpen ? "flex flex-col" : "hidden"
        }`}
        // iOS: не перекрывать кнопку/шапку и учитывать safe-area
        style={{
          paddingLeft: "max(12px, env(safe-area-inset-left))",
          paddingRight: "max(12px, env(safe-area-inset-right))",
          zIndex: 1000,
        }}
      >
        {[...menuLeft, ...menuRight].map((item: MenuItem) => (
          <Link
            key={item.id}
            href={item.href}
            onClick={() => setMobileOpen(false)}
            className="w-full border-b border-neutral-200 px-[20px] py-[16px] text-left text-[17px] text-brand hover:bg-gray-50"
          >
            {t(item.translationKey)}
          </Link>
        ))}
        {/* Auth actions inside burger with slightly different style */}
        <div className="px-4 py-3 flex items-center gap-2">
          {session ? (
            <button
              type="button"
              onClick={async () => {
                await signOut({ redirect: false });
                setMobileOpen(false);
                router.push('/');
              }}
              className="flex-1 text-center btn-primary"
            >
              {t('auth.signOut')}
            </button>
          ) : (
            <>
              <button
                type="button"
                onClick={() => {
                  try { (async () => { (await import("next-auth/react")).signIn(); })(); } catch {}
                  setMobileOpen(false);
                }}
                className="flex-1 btn-ghost"
              >
                {t('auth.signIn')}
              </button>
              <Link
                href="/register"
                onClick={() => setMobileOpen(false)}
                className="flex-1 text-center btn-primary"
              >
                {t('auth.register')}
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}