'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { signIn, signOut, useSession, SessionProvider } from 'next-auth/react';
import Link from 'next/link';
import { usePathname, useSearchParams, useRouter } from 'next/navigation';
import { useTranslation } from '@/i18n/useTranslation';
import { UserRound } from 'lucide-react';

export function AuthButton() {
  const { t } = useTranslation();
  const tr = (key: string, fallback: string) => {
    const val = t(key);
    return val === key ? fallback : val;
  };
  const { data: session } = useSession();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();

  const callbackUrl = searchParams.get('callbackUrl') || pathname || '/';

  const handleSignIn = () => signIn(undefined, { callbackUrl });
  const handleSignOut = async () => {
    await signOut({ redirect: false });
    router.push('/');
  };

  const brandBtn =
    'inline-flex items-center justify-center rounded-md font-semibold !text-white cursor-pointer bg-[#660000] hover:bg-[#520000] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#660000]/40 focus-visible:ring-offset-2 whitespace-nowrap';
  const lightBtn =
    'inline-flex items-center justify-center rounded-md font-medium text-gray-900 bg-white cursor-pointer hover:bg-gray-50 border border-gray-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-300 focus-visible:ring-offset-2 whitespace-nowrap';

  const base = 'px-2.5 py-1.5 text-xs sm:px-3';
  const larger = 'lg:px-4 lg:py-2 lg:text-sm';
  const ultraNarrow = 'max-[380px]:px-2 max-[380px]:py-1 max-[380px]:text-[11px]';

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

  const shell =
    'flex items-center gap-1.5 sm:gap-2 rounded-lg border border-gray-200/60 bg-white/80 p-0.5 shadow-sm backdrop-blur-sm';

  if (session) {
    return (
      <div className={shell}>
        <Link
          href="/profile"
          aria-label={`Профиль: ${displayName}`}
          title={`${displayName} — профиль`}
          className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md text-[#660000] transition-colors hover:bg-[#660000]/5 hover:text-[#8B0000] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#660000]/30"
        >
          <UserRound className="h-6 w-6" strokeWidth={2} aria-hidden />
        </Link>

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

  return (
    <div className={shell}>
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

export default function AuthButtonWithProvider() {
  return (
    <SessionProvider>
      <AuthButton />
    </SessionProvider>
  );
}
