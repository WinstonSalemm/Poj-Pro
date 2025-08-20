'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { signIn, signOut, useSession } from 'next-auth/react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { useTranslation } from '@/i18n/useTranslation';

export function AuthButton() {
  const { t } = useTranslation();
  // локальный помощник перевода с фолбэком, если ключа нет
  const tr = (key: string, fallback: string) => {
    const val = t(key);
    return val === key ? fallback : val;
  };
  const { data: session } = useSession();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const callbackUrl = searchParams.get('callbackUrl') || pathname || '/';

  const handleSignIn = () => signIn(undefined, { callbackUrl });
  const handleSignOut = async () => { await signOut({ callbackUrl: '/' }); };

  // ---- стили кнопок / размеры ----
  const brandBtn =
    'inline-flex items-center justify-center rounded-md font-semibold !text-white cursor-pointer bg-[#660000] hover:bg-[#520000] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#660000]/40 focus-visible:ring-offset-2 whitespace-nowrap';
  const lightBtn =
    'inline-flex items-center justify-center rounded-md font-medium text-gray-900 bg-white cursor-pointer hover:bg-gray-50 border border-gray-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-300 focus-visible:ring-offset-2 whitespace-nowrap';

  const base = 'px-3 py-1.5 text-xs';                // мобилка
  const larger = 'lg:px-4 lg:py-2 lg:text-sm';       // ≥ 1024px
  const ultraNarrow = 'max-[380px]:px-2 max-[380px]:py-1 max-[380px]:text-[11px]';

  // ---- 1) Первый визит + ширина < 1024px (без раннего return) ----
  // Инициализируем без доступа к window, потом уточняем в effect
  const [firstVisit, setFirstVisit] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    try {
      const seen = localStorage.getItem('pp_seen_auth_choice');
      setFirstVisit(!seen);
      localStorage.setItem('pp_seen_auth_choice', '1');
    } catch {
      setFirstVisit(false);
    }
  }, []);

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 1023.98px)');
    const apply = () => setIsMobile(mq.matches);
    apply();
    mq.addEventListener?.('change', apply);
    return () => mq.removeEventListener?.('change', apply);
  }, []);
  // ---------------------------------------------------------------

  // ---- 2) Авто-уменьшение имени (хуки всегда объявлены) ----
  const nameWrapRef = useRef<HTMLSpanElement>(null);
  const nameRef = useRef<HTMLSpanElement>(null);

  // Очень узкие экраны: используем короткие подписи кнопок
  const [isTiny, setIsTiny] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 420px)');
    const apply = () => setIsTiny(mq.matches);
    apply();
    mq.addEventListener?.('change', apply);
    return () => mq.removeEventListener?.('change', apply);
  }, []);

  const displayName = useMemo(() => {
    return session?.user?.name || session?.user?.email?.split('@')[0] || 'Профиль';
  }, [session]);

  useEffect(() => {
    if (!session) return;
    const wrap = nameWrapRef.current;
    const el = nameRef.current;
    if (!wrap || !el) return;

    const fit = () => {
      let size = 14; // старт
      const min = 10;
      el.style.whiteSpace = 'nowrap';
      el.style.fontSize = size + 'px';
      while (el.scrollWidth > wrap.clientWidth && size > min) {
        size -= 0.5;
        el.style.fontSize = size + 'px';
      }
    };

    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(wrap);
    window.addEventListener('resize', fit);
    return () => { ro.disconnect(); window.removeEventListener('resize', fit); };
  }, [displayName, session]);
  // -----------------------------------------------------------

  // Вертикальная раскладка только для НЕ авторизованных, первого визита и мобилки
  const stackMobile = !session && firstVisit && isMobile;

  if (session) {
    return (
      <div className="flex items-center gap-3 sm:gap-4">
        <span
          ref={nameWrapRef}
          className="inline-block align-middle max-w-[120px] sm:max-w-[140px] lg:max-w-[160px] leading-none"
          title={displayName}
        >
          <span ref={nameRef} className="text-gray-700 align-middle select-none">
            {displayName}
          </span>
        </span>

        <button
          onClick={handleSignOut}
          aria-label="Выйти"
          className={`${brandBtn} ${base} ${larger} ${ultraNarrow} cursor-pointer shrink-0`}
        >
          {isTiny ? tr('auth.signOutShort', 'Вых.') : tr('auth.signOut', 'Выйти')}
        </button>
      </div>
    );
  }

  // Не авторизован
  if (stackMobile) {
    // Первый визит + мобилка: кнопки вертикально (Регистрация над Войти)
    return (
      <div className="flex flex-col items-stretch gap-1.5 w-[112px] sm:w-[128px]">
        <Link
          href={`/register?callbackUrl=${encodeURIComponent(callbackUrl)}`}
          aria-label="Регистрация"
          className={`${lightBtn} ${base} ${ultraNarrow} cursor-pointer`}
        >
          {isTiny ? tr('auth.registerShort', 'Рег.') : tr('auth.register', 'Регистрация')}
        </Link>
        <button
          onClick={handleSignIn}
          aria-label="Войти"
          className={`${lightBtn} ${base} ${ultraNarrow} cursor-pointer`}
        >
          {isTiny ? tr('auth.signInShort', 'Войти') : tr('auth.signIn', 'Войти')}
        </button>
      </div>
    );
  }

  // Прочие случаи — горизонтально
  return (
    <div className="flex items-center gap-3 sm:gap-4">
      <button
        onClick={handleSignIn}
        aria-label="Войти"
        className={`${lightBtn} ${base} ${larger} ${ultraNarrow} shrink-0 cursor-pointer`}
      >
        {isTiny ? tr('auth.signInShort', 'Войти') : tr('auth.signIn', 'Войти')}
      </button>

      <Link
        href={`/register?callbackUrl=${encodeURIComponent(callbackUrl)}`}
        aria-label="Регистрация"
        className={`${brandBtn} ${base} ${larger} ${ultraNarrow} shrink-0 cursor-pointer`}
      >
        {isTiny ? tr('auth.registerShort', 'Рег.') : tr('auth.register', 'Регистрация')}
      </Link>
    </div>
  );
}
