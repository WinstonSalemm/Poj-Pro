'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { getSession, signOut } from 'next-auth/react';
import { usePathname, useRouter } from 'next/navigation';

/**
 * Compatibility wrapper for legacy admin pages that are outside /admin.
 * Access is based on the signed NextAuth session, never on a browser-stored
 * password or token.
 */
export default function AdminGate({ children }: { children: ReactNode }) {
  const [allowed, setAllowed] = useState<boolean | null>(null);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    let active = true;

    getSession()
      .then((session) => {
        if (!active) return;
        setAllowed(Boolean(session?.user?.isAdmin));
      })
      .catch(() => {
        if (active) setAllowed(false);
      });

    return () => {
      active = false;
    };
  }, []);

  if (allowed === null) {
    return <p className="p-6 text-center text-gray-700">Проверяем доступ…</p>;
  }

  if (!allowed) {
    router.replace(`/login?callbackUrl=${encodeURIComponent(pathname || '/')}`);
    return null;
  }

  return (
    <div>
      <div className="mb-8 flex items-center justify-between bg-[#660000] px-6 py-4 text-white">
        <h1 className="m-0 text-lg font-semibold">Панель администратора</h1>
        <button
          onClick={() => signOut({ callbackUrl: '/' })}
          className="rounded bg-white/10 px-3 py-1.5 text-sm font-medium hover:bg-white/20"
        >
          Выйти
        </button>
      </div>
      {children}
    </div>
  );
}
