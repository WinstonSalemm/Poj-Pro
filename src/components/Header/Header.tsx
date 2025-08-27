"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useTranslation } from "@/i18n/useTranslation";
import { useSession, signOut } from 'next-auth/react';
import { CartIcon } from "../Cart/CartIcon";
import { AuthButton } from "../auth/AuthButton";
import { useRouter, usePathname } from "next/navigation";
import cls from './Header.module.css';
import LanguageSwitcher from '@/components/LanguageSwitcher/LanguageSwitcher';

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
  const { data: session } = useSession();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const headerRef = useRef<HTMLDivElement | null>(null);
  const drawerRef = useRef<HTMLDivElement | null>(null);
  // Separate refs for mobile and desktop language switchers to avoid false outside-clicks on mobile
  const switcherMobileRef = useRef<HTMLDivElement | null>(null);
  const switcherDesktopRef = useRef<HTMLDivElement | null>(null);
  const currentLanguage = (i18n.language as Lang) || "ru";

  const menuLeft: MenuItem[] = [
    { id: "catalog", href: "/catalog", translationKey: "header.catalog" },
    { id: "about", href: "/about", translationKey: "header.about" },
    { id: "contacts", href: "/contacts", translationKey: "header.contacts" },
    { id: "documents", href: "/documents", translationKey: "header.documents" },
    { id: "supplies", href: "/supplies", translationKey: "header.news" },
  ] as const;

  const menuRight: MenuItem[] = [] as const;

  // Sticky styling is handled by CSS; no JS scroll handling needed.

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

  // Close on ESC and lock body scroll when drawer is open
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setMobileOpen(false); };
    document.addEventListener('keydown', onKey);
    const { body } = document;
    const prev = body.style.overflow;
    if (mobileOpen) body.style.overflow = 'hidden';
    return () => { body.style.overflow = prev; document.removeEventListener('keydown', onKey); };
  }, [mobileOpen]);

  // Focus trap inside drawer when open
  useEffect(() => {
    if (!mobileOpen || !drawerRef.current) return;
    const root = drawerRef.current;
    const q = 'a, button, input, select, textarea, [tabindex]:not([tabindex="-1"])';
    const getFocusable = () => Array.from(root.querySelectorAll<HTMLElement>(q)).filter(el => !el.hasAttribute('disabled'));
    const focusables = getFocusable();
    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    const onTrap = (e: KeyboardEvent | Event) => {
      const ev = e as KeyboardEvent;
      if (ev.key !== 'Tab') return;
      const active = document.activeElement as HTMLElement | null;
      if (ev.shiftKey && active === first) { ev.preventDefault(); last?.focus(); }
      else if (!ev.shiftKey && active === last) { ev.preventDefault(); first?.focus(); }
    };
    root.addEventListener('keydown', onTrap);
    first?.focus();
    return () => root.removeEventListener('keydown', onTrap);
  }, [mobileOpen]);

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
    <header ref={headerRef} className={cls.header}>
      <div className={["container", cls.row].join(' ')}>
        {/* LEFT: Burger (mobile) / Left nav (desktop) */}
        <div className={cls.left}>
          <button
            onClick={() => { setMobileOpen(v => !v); setLangOpen(false); }}
            aria-label={mobileOpen ? "Закрыть меню" : "Открыть меню"}
            aria-controls="offcanvas"
            aria-expanded={mobileOpen}
            className={cls.burger}
            data-testid="burger"
          >
            <span className={[cls.bar, mobileOpen ? cls.barTopOpen : ''].join(' ')} />
            <span className={[cls.bar, mobileOpen ? cls.barMidOpen : ''].join(' ')} />
            <span className={[cls.bar, mobileOpen ? cls.barBotOpen : ''].join(' ')} />
          </button>

          <nav className={cls.nav}>
            {menuLeft.map((item) => {
              const active = pathname?.startsWith(item.href);
              return (
                <Link key={item.id} href={item.href} className={[cls.link, active ? cls.linkActive : ''].join(' ')}>
                  {t(item.translationKey)}
                </Link>
              );
            })}
          </nav>
          {/* Desktop Language Switcher */}
          <LanguageSwitcher />
        </div>

        {/* CENTER: Logo */}
        <div className={cls.center}>
          <Link href="/" aria-label="Go home" className={cls.logoLink}>
            <Image
              src="/OtherPics/logo.svg"
              alt="POJ PRO"
              width={180}
              height={60}
              className={cls.logoImg}
              priority
            />
          </Link>
        </div>

        {/* RIGHT: compact (mobile) / full (desktop) */}
        <div className={cls.right}>
          {/* Mobile compact controls */}
          <div className={cls.controlsMobile}>
            <div style={{ color: 'var(--accent)' }}>
              <CartIcon />
            </div>

            <div className={cls.lang} ref={switcherMobileRef}>
              <button
                type="button"
                className={cls.langBtn}
                onClick={() => setLangOpen(!langOpen)}
                aria-expanded={langOpen}
                aria-haspopup="true"
              >
                {currentLanguage.toUpperCase()}
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M19 9l-7 7-7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
              {langOpen && (
                <div className={cls.langMenu} style={{ right: 0, width: 96 }}>
                  {(["ru", "uzb", "eng"] as Lang[]).map((lang) => (
                    <button key={lang} onClick={() => changeLanguage(lang)} className={cls.langItem}>
                      {lang.toUpperCase()}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Desktop right controls */}
          <nav className={cls.controlsDesktop}>
            {menuRight.map((item) => {
              const active = pathname?.startsWith(item.href);
              return (
                <Link key={item.id} href={item.href} className={[cls.link, active ? cls.linkActive : ''].join(' ')}>
                  {t(item.translationKey)}
                </Link>
              );
            })}
            <div style={{ color: 'var(--accent)' }}>
              <CartIcon />
            </div>
            <AuthButton />

            <div className={cls.lang} ref={switcherDesktopRef}>
              <button
                type="button"
                className={cls.langBtn}
                onClick={() => setLangOpen(!langOpen)}
                aria-expanded={langOpen}
                aria-haspopup="true"
              >
                {currentLanguage.toUpperCase()}
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M19 9l-7 7-7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
              {langOpen && (
                <div className={cls.langMenu} style={{ right: 0, width: 88 }}>
                  {(["ru", "uzb", "eng"] as Lang[]).map((lang) => (
                    <button key={lang} onClick={() => changeLanguage(lang)} className={cls.langItem}>
                      {lang.toUpperCase()}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </nav>
        </div>
      </div>

      {/* Mobile drawer and backdrop */}
      <div
        data-testid="overlay"
        className={[cls.drawerBackdrop, mobileOpen ? cls.drawerBackdropOpen : '', mobileOpen ? 'show' : ''].join(' ')}
        onClick={() => setMobileOpen(false)}
        aria-hidden={!mobileOpen}
      />
      <nav
        ref={drawerRef}
        data-testid="offcanvas"
        id="offcanvas"
        className={[cls.drawer, mobileOpen ? cls.drawerOpen : '', mobileOpen ? 'show' : ''].join(' ')}
        role="dialog"
        aria-modal="true"
        aria-label="Меню"
        aria-hidden={!mobileOpen}
      >
        <div className={cls.drawerHeader}>
          <button aria-label="Закрыть меню" className={cls.langBtn} onClick={() => setMobileOpen(false)}>✕</button>
        </div>
        <div className={cls.drawerList}>
          {[...menuLeft, ...menuRight].map((item: MenuItem) => (
            <Link key={item.id} href={item.href} onClick={() => setMobileOpen(false)} className={cls.menuItem}>
              {t(item.translationKey)}
            </Link>
          ))}
        </div>
        <div className={cls.drawerFooter}>
          <div style={{ marginBottom: 8 }}>
            <LanguageSwitcher />
          </div>
          {session ? (
            <button
              type="button"
              onClick={async () => {
                await signOut({ redirect: false });
                setMobileOpen(false);
                router.push('/');
              }}
              className={cls.langBtn}
              style={{ background: 'var(--accent)', color: '#fff', borderColor: 'transparent', flex: 1 }}
            >
              {t('auth.signOut')}
            </button>
          ) : (
            <>
              <button
                type="button"
                onClick={() => {
                  try { (async () => { (await import('next-auth/react')).signIn(); })(); } catch {}
                  setMobileOpen(false);
                }}
                className={cls.langBtn}
                style={{ flex: 1 }}
              >
                {t('auth.signIn')}
              </button>
              <Link href="/register" onClick={() => setMobileOpen(false)} className={cls.langBtn} style={{ flex: 1, background: 'var(--accent)', color: '#fff', borderColor: 'transparent', textAlign: 'center' }}>
                {t('auth.register')}
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
