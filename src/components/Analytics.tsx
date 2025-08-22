'use client';

import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

const GA_ID = 'G-90DRJPRBL5';
const YM_ID = 103855517;

// Provide a global type for Yandex.Metrika only (safe to augment)
declare global {
  interface Window {
    ym?: (counterId: number, method: 'hit' | string, ...args: unknown[]) => void;
  }
}

// Local, non-global types to interact with GA4 without 'any'
type GtagFn = (command: 'config' | 'event', targetId: string, config?: Record<string, unknown>) => void;
type YmFn = (counterId: number, method: 'hit' | string, ...args: unknown[]) => void;

export default function Analytics() {
  const pathname = usePathname();
  const search = useSearchParams();

  useEffect(() => {
    if (!pathname) return;
    const url = pathname + (search?.toString() ? `?${search.toString()}` : '');

    // GA4 pageview
    if (typeof window !== 'undefined') {
      const w = window as unknown as { gtag?: GtagFn; ym?: YmFn };
      if (typeof w.gtag === 'function') {
        w.gtag('config', GA_ID, { page_path: url });
      }
      // Yandex.Metrika hit
      if (typeof w.ym === 'function') {
        w.ym(YM_ID, 'hit', url);
      }
    }
  }, [pathname, search]);

  return null;
}
