'use client';

import { useReportWebVitals } from 'next/web-vitals';
import { usePathname } from 'next/navigation';
import { useEffect } from 'react';
import { trackWebVitals } from '@/lib/analytics';

interface WebVitalsMetric {
  id: string;
  name: string;
  label: string;
  value: number;
}

export function WebVitals() {
  const pathname = usePathname();

  // Track page load performance metrics
  useEffect(() => {
    // Only run in production
    if (process.env.NODE_ENV !== 'production') return;
    
    const handleLoad = () => {
      // Use PerformanceNavigationTiming if available
      const navEntries = performance.getEntriesByType('navigation') as PerformanceNavigationTiming[];
      
      if (navEntries.length > 0) {
        const navEntry = navEntries[0];
        const pageLoadTime = navEntry.loadEventEnd - navEntry.startTime;
        const domReadyTime = navEntry.domComplete - navEntry.domContentLoadedEventEnd;
        
        // Track page load time using our analytics utility
        trackWebVitals({
          id: 'page-load',
          name: 'page_load',
          label: 'page-load',
          value: Math.round(pageLoadTime),
        });
        
        // Track DOM ready time using our analytics utility
        trackWebVitals({
          id: 'dom-ready',
          name: 'dom_ready',
          label: 'dom-ready',
          value: Math.round(domReadyTime),
        });
      }
    };
    
    // Add event listener for page load
    if (document.readyState === 'complete') {
      handleLoad();
    } else {
      window.addEventListener('load', handleLoad);
      return () => window.removeEventListener('load', handleLoad);
    }
  }, [pathname]);
  
  // Track Web Vitals
  useReportWebVitals((metric: WebVitalsMetric) => {
    // Only track in production
    if (process.env.NODE_ENV !== 'production') return;
    
    // Use our analytics utility to track the web vitals
    trackWebVitals({
      id: metric.id,
      name: metric.name,
      label: 'web-vital',
      value: metric.value,
    });
    
    // Log to console when not in production (avoids literal narrowing errors in client builds)
    if (process.env.NODE_ENV !== 'production') {
      console.log('[Web Vitals]', metric);
    }
  });

  // Track page views
  useEffect(() => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'page_view', {
        page_path: pathname,
        page_title: document.title,
      });
    }
  }, [pathname]);

  return null;
}
