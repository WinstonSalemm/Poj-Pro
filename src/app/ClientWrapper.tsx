"use client";

import React, { useEffect } from "react";
import { usePathname } from "next/navigation";
import { usePageView } from "@/hooks/usePageView";
import { isProd } from '@/lib/analytics';
import PerformanceTracker from '@/components/PerformanceTracker';

interface ClientWrapperProps {
  children?: React.ReactNode;
}

export default function ClientWrapper({ children }: ClientWrapperProps) {
  usePageView();
  const pathname = usePathname();
  const hideLayout = pathname === "/login" || pathname === "/register";

  // Temporary safety net: normalize any mistaken CSS inclusions
  useEffect(() => {
    try {
      // 1) Replace <script src="*.css"> with <link rel="stylesheet" href="*.css">
      document.querySelectorAll<HTMLScriptElement>('script[src$=".css" i]').forEach((s) => {
        const href = s.getAttribute('src');
        if (!href) return;
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = href;
        document.head.appendChild(link);
        s.remove();
      });

      // 2) Fix <link rel="preload" as="script" href="*.css">
      document.querySelectorAll<HTMLLinkElement>('link[rel="preload"][as="script" i][href$=".css" i]').forEach((l) => {
        l.setAttribute('as', 'style');
        const href = l.getAttribute('href');
        if (href) {
          const sheet = document.createElement('link');
          sheet.rel = 'stylesheet';
          sheet.href = href;
          document.head.appendChild(sheet);
        }
      });
    } catch {
      // no-op
    }
  }, []);

  return (
    <>
      <main className="flex-grow">{children}</main>
      {isProd && <PerformanceTracker />}
    </>
  );
}
