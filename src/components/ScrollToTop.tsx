"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/**
 * Instantly scroll to top on client-side route changes.
 * Needed because html.scroll-smooth can interfere with Next.js default scroll restoration.
 */
export default function ScrollToTop() {
  const pathname = usePathname();

  useEffect(() => {
    if ("scrollRestoration" in history) {
      history.scrollRestoration = "manual";
    }
  }, []);

  useEffect(() => {
    const html = document.documentElement;
    const previous = html.style.scrollBehavior;
    html.style.scrollBehavior = "auto";
    window.scrollTo(0, 0);
    requestAnimationFrame(() => {
      html.style.scrollBehavior = previous;
    });
  }, [pathname]);

  return null;
}
