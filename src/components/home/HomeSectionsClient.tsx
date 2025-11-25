"use client";

import type { ReactNode } from "react";
import { Suspense, useState } from "react";
import dynamic from "next/dynamic";

const SmallAboutUs = dynamic(() => import("@/components/SmallAboutUs/SmallAboutUs"), {
  loading: () => (
    <div className="container-section section-y">
      <div className="h-7 w-40 shimmer rounded-md mb-6" />
    </div>
  ),
});
const MapSection = dynamic(() => import("@/components/MapSection/MapSection"), {
  ssr: false,
  loading: () => <div className="h-[320px] w-full shimmer rounded-xl mx-auto max-w-[1260px]" />,
});

type Props = { popularProducts: ReactNode; categoryBlock: ReactNode };

export default function HomeSectionsClient({ popularProducts, categoryBlock }: Props) {
  const [showMap, setShowMap] = useState(false);
  return (
    <section>
      <div className="animate-in-up" style={{ animationDelay: "0.10s" }}>
        <Suspense fallback={<div className="container-section section-y"><div className="h-7 w-40 shimmer rounded-md mb-6" /></div>}>
          <SmallAboutUs />
        </Suspense>
      </div>
      <div className="animate-in-up" style={{ animationDelay: "0.16s" }}>{popularProducts}</div>
      <div className="animate-in-up" style={{ animationDelay: "0.22s" }}>{categoryBlock}</div>
      <div className="!bg-[#F8F9FA] animate-in-up" style={{ animationDelay: "0.30s" }}>
        {showMap ? (
          <Suspense fallback={<div className="h-[320px] w-full shimmer rounded-xl mx-auto max-w-[1260px]" />}>
            <MapSection />
          </Suspense>
        ) : (
          <div className="h-[320px] w-full flex flex-col items-center justify-center rounded-xl mx-auto max-w-[1260px] px-4">
            <div className="h-7 w-40 shimmer rounded-md mb-4" />
            <button
              type="button"
              className="px-5 py-2 rounded-full bg-[#660000] text-white text-sm font-medium hover:bg-[#8B0000] transition-colors"
              onClick={() => setShowMap(true)}
            >
              Показать карту
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
