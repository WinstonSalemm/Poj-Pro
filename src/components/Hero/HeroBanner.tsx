"use client";

import { useState } from "react";
import Image from "next/image";
import { HERO_IMAGES } from "@/components/ImageSlider/images";
import ImageLightbox from "@/components/ImageLightbox/ImageLightbox";

const HERO_BLUR =
  "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0nMTAwJyBoZWlnaHQ9JzEwMCcgeG1sbnM9J2h0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnJz48cmVjdCB3aWR0aD0nMTAwJScgaGVpZ2h0PScxMDAlJyBmaWxsPScjZWVlZWVlJy8+PC9zdmc+";

export default function HeroBanner() {
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const alt = "POJ PRO — Fire safety equipment";

  return (
    <section className="container-section">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 w-full">
        {HERO_IMAGES.map((src, index) => {
          const isHovered = hoveredIndex === index;
          const hasHover = hoveredIndex !== null;

          return (
            <div
              key={index}
              className={`
    relative aspect-square overflow-hidden rounded-xl cursor-pointer
    transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]
    will-change-transform
    ${isHovered ? 'z-30 scale-[1.35]' : ''}
    ${hasHover && !isHovered ? 'scale-[0.75] opacity-30' : 'scale-100 opacity-100'}
  `}
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
              onClick={() => setLightboxSrc(src)}
            >
              <Image
                src={src}
                alt={`${alt} ${index + 1}`}
                fill
                priority={index === 0}
                fetchPriority={index === 0 ? "high" : "auto"}
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                className={`
      object-cover transition-transform duration-700 ease-out
      ${isHovered ? 'scale-110' : 'scale-100'}
    `}
                placeholder="blur"
                blurDataURL={HERO_BLUR}
                quality={60}
              />

              {/* затемнение фона */}
              <div
                className={`
      absolute inset-0 transition-all duration-500
      ${hasHover && !isHovered ? 'bg-black/20' : 'bg-transparent'}
    `}
              />
            </div>
          );
        })}
      </div>
      <ImageLightbox
        src={lightboxSrc || ""}
        alt={alt}
        isOpen={!!lightboxSrc}
        onClose={() => setLightboxSrc(null)}
      />
    </section>
  );
}
