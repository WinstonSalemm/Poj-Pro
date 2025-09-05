"use client";

import React from "react";
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

  return (
    <>
      <main className="flex-grow">{children}</main>
      {isProd && <PerformanceTracker />}
    </>
  );
}
