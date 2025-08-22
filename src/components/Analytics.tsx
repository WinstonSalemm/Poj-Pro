'use client';

import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

const GA_ID = 'G-90DRJPRBL5';
const YM_ID = 103855517;

export default function Analytics() {
  const pathname = usePathname();
  const search = useSearchParams();

  useEffect(() => {
    if (!pathname) return;
    const url = pathname + (search?.toString() ? `?${search.toString()}` : '');

    // GA4 pageview
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('config', GA_ID, { page_path: url });
    }

    // Yandex.Metrika hit
    if (typeof window !== 'undefined' && (window as any).ym) {
      (window as any).ym(YM_ID, 'hit', url);
    }
  }, [pathname, search]);

  return null;
}
