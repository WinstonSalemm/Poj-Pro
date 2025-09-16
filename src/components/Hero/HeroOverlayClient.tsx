"use client";

import dynamic from "next/dynamic";

// Load the interactive slider only on the client to preserve SSR LCP from the static image
const ImageSlider = dynamic(() => import("@/components/ImageSlider/ImageSlider"), {
  ssr: false,
});

export default function HeroOverlayClient() {
  return (
    <div className="absolute inset-0 z-20 pointer-events-auto">
      <ImageSlider variant="overlay" />
    </div>
  );
}
