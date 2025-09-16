import Image from "next/image";
import { HERO_IMAGES } from "@/components/ImageSlider/images";
import HeroOverlayClient from "@/components/Hero/HeroOverlayClient";

// Server component: SSR static hero banner for fast LCP
export default function HeroBanner() {
  const src = HERO_IMAGES[0] || "/OtherPics/product1photo.png";
  const alt = "POJ PRO — Fire safety equipment";
  // Keep height modest to avoid dominating LCP time
  return (
    <section className="container-section">
      <div className="relative w-full h-[420px] max-[1024px]:h-[360px] max-[768px]:h-[280px] overflow-hidden bg-white">
        <Image
          src={src}
          alt={alt}
          fill
          priority
          sizes="100vw"
          className="object-contain"
          quality={60}
        />
        {/* Client slider overlays after hydration to keep LCP fast */}
        <HeroOverlayClient />
      </div>
    </section>
  );
}
