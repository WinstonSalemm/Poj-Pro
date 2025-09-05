'use client';

import { useEffect } from 'react';
import { reportWebVitals, trackResourceLoading, trackMemoryUsage } from '@/lib/performance';
import { useReportWebVitals } from 'next/web-vitals';

export default function PerformanceTracker() {
  useReportWebVitals(reportWebVitals);

  useEffect(() => {
    trackResourceLoading();
    trackMemoryUsage();
  }, []);

  return null;
}
