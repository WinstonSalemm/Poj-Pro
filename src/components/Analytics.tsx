'use client';

import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

// Get analytics IDs from environment variables
const GA_ID = process.env.NEXT_PUBLIC_GA_ID;
const YM_ID = process.env.NEXT_PUBLIC_YM_ID ? Number(process.env.NEXT_PUBLIC_YM_ID) : undefined;

// Only run analytics in production
const isProduction = process.env.NODE_ENV === 'production';

// Local, non-global types to interact with GA4 without 'any'
type GtagFn = (command: 'config' | 'event', targetId: string, config?: Record<string, unknown>) => void;
type YmFn = (counterId: number, method: 'hit' | string, ...args: unknown[]) => void;

// Main Analytics component that handles page views for GA4 and Yandex.Metrica
export default function Analytics() {
  // Hooks must be called unconditionally at the top level
  const pathname = usePathname();
  const search = useSearchParams();
  
  useEffect(() => {
    // Skip analytics in development
    if (!isProduction) return;
    
    if (!pathname) return;
    const url = pathname + (search?.toString() ? `?${search.toString()}` : '');

    // GA4 pageview
    if (typeof window !== 'undefined') {
      const w = window as unknown as { gtag?: GtagFn; ym?: YmFn };
      if (GA_ID && typeof w.gtag === 'function') {
        w.gtag('config', GA_ID, { page_path: url });
      }
      
      // Yandex.Metrica hit
      if (YM_ID && typeof w.ym === 'function') {
        w.ym(YM_ID, 'hit', url);
      }
    }
  }, [pathname, search]);
  
  // Don't render anything - this is a tracking-only component
  return null;
}
