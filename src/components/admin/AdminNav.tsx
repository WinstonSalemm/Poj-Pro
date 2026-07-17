'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export const ADMIN_NAV_LINKS = [
  { href: '/admin', label: 'Dashboard', hint: 'Обзор и пользователи' },
  { href: '/admin-categories-add', label: 'Категории', hint: 'Добавить или править' },
  { href: '/admin-products', label: 'Товары', hint: 'Список и добавление' },
  { href: '/admin-popular-products', label: 'Популярное', hint: 'Блок на главной' },
  { href: '/admin/promotions', label: 'Акции', hint: 'Скидки и спецпредложения' },
] as const;

function isActivePath(pathname: string | null, href: string): boolean {
  if (!pathname) return false;
  if (href === '/admin') return pathname === '/admin';
  // Exact match, or nested path under href/ (avoids /admin-products matching /admin-products-add)
  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function AdminNav() {
  const pathname = usePathname();

  return (
    <div className="border-b border-[#660000]/10 bg-white">
      <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
        <nav
          aria-label="Админ-навигация"
          className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5"
        >
          {ADMIN_NAV_LINKS.map((item) => {
            const active = isActivePath(pathname, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? 'page' : undefined}
                className={`rounded-2xl border px-4 py-4 shadow-[0_4px_16px_rgba(102,0,0,0.04)] transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#660000]/35 ${
                  active
                    ? 'border-[#660000] bg-[#fff9f8]'
                    : 'border-[#660000]/12 bg-white hover:border-[#660000]/30 hover:shadow-[0_8px_24px_rgba(102,0,0,0.08)]'
                }`}
              >
                <div className="text-sm font-semibold text-[#660000]">{item.label}</div>
                <div className="mt-1 text-xs text-gray-500">{item.hint}</div>
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
