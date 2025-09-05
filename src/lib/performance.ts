// Performance monitoring utilities
export interface PerformanceMetrics {
  lcp?: number;
  fid?: number;
  cls?: number;
  fcp?: number;
  ttfb?: number;
  inp?: number;
}

export interface WebVitalMetric {
  name: string;
  value: number;
  id: string;
  delta: number;
  rating: 'good' | 'needs-improvement' | 'poor';
}

export function reportWebVitals(metric: WebVitalMetric) {
  // Send to Google Analytics
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', metric.name, {
      event_category: 'Web Vitals',
      event_label: metric.id,
      value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
      custom_map: { metric_rating: metric.rating },
      non_interaction: true,
    });
  }

  // Send to Yandex Metrica
  if (typeof window !== 'undefined' && window.ym) {
    window.ym(Number(process.env.NEXT_PUBLIC_YM_ID), 'reachGoal', `web_vital_${metric.name}`, {
      value: metric.value,
      rating: metric.rating,
    });
  }

  // Send to custom analytics endpoint with caching
  if (typeof window !== 'undefined') {
    const vitalsData = {
      name: metric.name,
      value: metric.value,
      id: metric.id,
      delta: metric.delta,
      rating: metric.rating,
      url: window.location.href,
      userAgent: navigator.userAgent,
      timestamp: Date.now(),
      connectionType: (navigator as Navigator & { connection?: { effectiveType?: string } }).connection?.effectiveType || 'unknown',
    };

    // Use sendBeacon for reliability
    if (navigator.sendBeacon) {
      navigator.sendBeacon('/api/analytics/vitals', JSON.stringify(vitalsData));
    } else {
      fetch('/api/analytics/vitals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(vitalsData),
        keepalive: true,
      }).catch(console.error);
    }
  }
}

export function measurePerformance(name: string, fn: () => void | Promise<void>) {
  const start = performance.now();
  
  const result = fn();
  
  if (result instanceof Promise) {
    return result.finally(() => {
      const duration = performance.now() - start;
      console.log(`⚡ Performance: ${name} took ${duration.toFixed(2)}ms`);
      
      // Report slow operations
      if (duration > 100) {
        reportWebVitals({
          name: 'custom_performance',
          value: duration,
          id: name,
          delta: duration,
          rating: duration > 500 ? 'poor' : duration > 200 ? 'needs-improvement' : 'good'
        });
      }
    });
  } else {
    const duration = performance.now() - start;
    console.log(`⚡ Performance: ${name} took ${duration.toFixed(2)}ms`);
    return result;
  }
}

// Resource loading performance
export function trackResourceLoading() {
  if (typeof window === 'undefined') return;

  window.addEventListener('load', () => {
    // Track resource loading times
    const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
    
    resources.forEach((resource) => {
      if (resource.duration > 1000) { // Resources taking more than 1s
        console.warn(`🐌 Slow resource: ${resource.name} took ${resource.duration.toFixed(2)}ms`);
      }
    });

    // Track largest contentful paint
    if ('PerformanceObserver' in window) {
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1] as PerformanceEntry & { renderTime: number; loadTime: number };
        
        console.log(`🎨 LCP: ${lastEntry.renderTime || lastEntry.loadTime}ms`);
      });
      
      lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true });
    }
  });
}

// Define a type for the non-standard performance.memory API
interface PerformanceWithMemory extends Performance {
  memory?: {
    usedJSHeapSize: number;
    totalJSHeapSize: number;
    jsHeapSizeLimit: number;
  };
}

// Memory usage tracking
export function trackMemoryUsage() {
  const perfWithMemory = performance as PerformanceWithMemory;
  if (typeof window === 'undefined' || !perfWithMemory.memory) return;

  const memory = perfWithMemory.memory;
  const memoryInfo = {
    usedJSHeapSize: memory.usedJSHeapSize,
    totalJSHeapSize: memory.totalJSHeapSize,
    jsHeapSizeLimit: memory.jsHeapSizeLimit,
  };

  console.log('💾 Memory usage:', {
    used: `${(memoryInfo.usedJSHeapSize / 1024 / 1024).toFixed(2)}MB`,
    total: `${(memoryInfo.totalJSHeapSize / 1024 / 1024).toFixed(2)}MB`,
    limit: `${(memoryInfo.jsHeapSizeLimit / 1024 / 1024).toFixed(2)}MB`,
  });

  return memoryInfo;
}
