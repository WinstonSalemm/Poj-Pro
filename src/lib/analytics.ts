import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import * as Sentry from '@sentry/nextjs';

type GTagEvent = {
  event_category?: string;
  event_label?: string;
  value?: number;
  [key: string]: unknown;
};

declare global {
  interface Window {
    gtag: (command: 'config' | 'event', targetId: string, config?: GTagEvent) => void;
    ym?: (id: number, event: string, ...args: unknown[]) => void;
  }
}

// Track page views
export function usePageView() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!pathname) return;
    
    const url = `${window.location.origin}${pathname}${searchParams?.toString() ? `?${searchParams.toString()}` : ''}`;
    
    // Google Analytics
    if (window.gtag) {
      window.gtag('config', process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || '', {
        page_path: url,
      });
    }
    
    // Yandex.Metrika
    if (window.ym && process.env.NEXT_PUBLIC_YM_ID) {
      window.ym(Number(process.env.NEXT_PUBLIC_YM_ID), 'hit', url);
    }
    
    // Sentry - set context
    if (typeof window !== 'undefined') {
      Sentry.setTag('page', pathname);
      // Add a breadcrumb for the page view
      Sentry.addBreadcrumb({
        category: 'navigation',
        message: `Navigated to ${pathname}`,
        level: 'info',
        data: { url }
      });
    }
  }, [pathname, searchParams]);
}

// Track custom events
export function trackEvent(
  action: string,
  category: string,
  label?: string,
  value?: number,
  params?: Record<string, unknown>
) {
  // Google Analytics
  if (window.gtag) {
    window.gtag('event', action, {
      event_category: category,
      event_label: label,
      value: value,
    });
  }
  
  // Yandex.Metrika
  if (window.ym && process.env.NEXT_PUBLIC_YM_ID) {
    window.ym(
      Number(process.env.NEXT_PUBLIC_YM_ID),
      'reachGoal',
      `${category}_${action}`,
      label,
      value
    );
  }
  
  // Sentry - track event
  Sentry.setTag('event_action', action);
  Sentry.setTag('event_category', category);
  if (label) Sentry.setTag('event_label', label);
  
  Sentry.setExtras({
    category,
    label,
    value,
    ...(params || {})
  });
  
  Sentry.addBreadcrumb({
    category: 'event',
    message: `Event: ${action}`,
    level: 'info',
    data: { action, category, label, value, ...(params || {}) }
  });
}

// Track errors
export function trackError(error: Error, context?: Record<string, unknown>) {
  console.error('Error:', error, context);
  
  // Send to Sentry
  Sentry.withScope((scope) => {
    scope.setLevel('error');
    scope.setExtras({
      ...context,
      page: window.location.pathname,
      url: window.location.href
    });
    Sentry.captureException(error);
  });
  
  // Track as an event
  trackEvent('error', 'application', error.message, 1);
}

// Track performance metrics
export function trackWebVitals({
  id,
  name,
  label,
  value,
}: {
  id: string;
  name: string;
  label: string;
  value: number;
}) {
  // Google Analytics
  if (window.gtag) {
    window.gtag('event', name, {
      event_category:
        label === 'web-vital' ? 'Web Vitals' : 'Next.js custom metric',
      value: Math.round(name === 'CLS' ? value * 1000 : value), // values must be integers
      event_label: id, // id unique to current page load
      non_interaction: true, // avoids affecting bounce rate.
    });
  }
  
  // Log to console in development
  if (process.env.NODE_ENV === 'development') {
    console.log(`[${label}] ${name}: ${value}`);
  }
}
