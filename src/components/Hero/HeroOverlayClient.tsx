"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

// Load the interactive slider only on the client to preserve SSR LCP from the static image
const ImageSlider = dynamic(() => import("@/components/ImageSlider/ImageSlider"), { ssr: false });

export default function HeroOverlayClient() {
  const [isMdUp, setIsMdUp] = useState(false);
  useEffect(() => {
    const media = window.matchMedia("(min-width: 768px)");
    const update = () => setIsMdUp(media.matches);
    update();
    try { media.addEventListener("change", update); } catch { media.addListener(update); }
    return () => {
      try { media.removeEventListener("change", update); } catch { media.removeListener(update); }
    };
  }, []);

  if (!isMdUp) return null; // Do not render slider on mobile — keep static LCP banner only

  return (
    <div className="absolute inset-0 z-20 pointer-events-auto">
      <ImageSlider variant="overlay" />
    </div>
  );
}
