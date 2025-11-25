import Image from "next/image";
import { HERO_IMAGES } from "@/components/ImageSlider/images";
import HeroOverlayClient from "@/components/Hero/HeroOverlayClient";

const HERO_BLUR =
  "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0nMTAwJyBoZWlnaHQ9JzEwMCcgeG1sbnM9J2h0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnJz48cmVjdCB3aWR0aD0nMTAwJScgaGVpZ2h0PScxMDAlJyBmaWxsPScjZWVlZWVlJy8+PC9zdmc+";

// Server component: SSR static hero banner for fast LCP
export default function HeroBanner() {
  const src = HERO_IMAGES[0] || "/OtherPics/product1photo.png";
  const alt = "POJ PRO — Fire safety equipment";
  // Keep height modest to avoid dominating LCP time
  return (
    <section className="container-section">
      <div className="hero-lcp-frame relative w-full h-[420px] max-[1024px]:h-[360px] max-[768px]:h-[260px] overflow-hidden bg-white">
        <Image
          src={src}
          alt={alt}
          fill
          priority
          fetchPriority="high"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 960px, 1280px"
          className="object-contain"
          placeholder="blur"
          blurDataURL={HERO_BLUR}
          quality={45}
        />
        {/* Client slider overlays after hydration to keep LCP fast */}
        <HeroOverlayClient />
      </div>
    </section>
  );
}
