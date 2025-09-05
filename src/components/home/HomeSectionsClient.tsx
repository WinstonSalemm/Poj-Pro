"use client";

import type { ReactNode } from "react";
import { Suspense } from "react";
import dynamic from "next/dynamic";

const ImageSlider = dynamic(() => import("@/components/ImageSlider/ImageSlider"), {
  ssr: true,
  loading: () => <div className="h-[320px] md:h-[420px] w-full shimmer rounded-none" />,
});
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
  return (
    <section className="transition-opacity duration-500 opacity-100">
      <div className="animate-in-up" style={{ animationDelay: "0.05s" }}>
        <ImageSlider />
      </div>
      <div className="animate-in-up" style={{ animationDelay: "0.12s" }}>
        <Suspense fallback={<div className="container-section section-y"><div className="h-7 w-40 shimmer rounded-md mb-6" /></div>}>
          <SmallAboutUs />
        </Suspense>
      </div>
      <div className="animate-in-up" style={{ animationDelay: "0.18s" }}>{popularProducts}</div>
      <div className="animate-in-up" style={{ animationDelay: "0.24s" }}>{categoryBlock}</div>
      <div className="!bg-[#F8F9FA] animate-in-up" style={{ animationDelay: "0.30s" }}>
        <Suspense fallback={<div className="h-[320px] w-full shimmer rounded-xl mx-auto max-w-[1260px]" />}>
          <MapSection />
        </Suspense>
      </div>
    </section>
  );
}
