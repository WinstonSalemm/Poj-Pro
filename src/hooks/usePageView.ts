"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { gaPageView } from "@/lib/analytics";

export function usePageView() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!pathname) return;
    const qs = searchParams?.toString();
    const url = qs ? `${pathname}?${qs}` : pathname;
    gaPageView(url);
    // Yandex Metrica listens to history changes automatically
  }, [pathname, searchParams]);
}
