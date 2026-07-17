'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { getSession } from 'next-auth/react';
import { usePathname, useRouter } from 'next/navigation';
import AdminNav from '@/components/admin/AdminNav';

/**
 * Compatibility wrapper for legacy admin pages that are outside /admin.
 * Access is based on the signed NextAuth session, never on a browser-stored
 * password or token.
 *
 * Pages under /admin/* already get AdminNav from admin/layout — shell is skipped there.
 */
export default function AdminGate({ children }: { children: ReactNode }) {
  const [allowed, setAllowed] = useState<boolean | null>(null);
  const router = useRouter();
  const pathname = usePathname();

  const underAdminLayout =
    pathname === '/admin' || Boolean(pathname?.startsWith('/admin/'));

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

  if (underAdminLayout) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminNav />
      {children}
    </div>
  );
}
