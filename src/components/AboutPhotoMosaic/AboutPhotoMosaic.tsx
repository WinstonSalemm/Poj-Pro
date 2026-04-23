"use client";

import { useState } from "react";
import Image from "next/image";
import ImageLightbox from "@/components/ImageLightbox/ImageLightbox";

const HERO_BLUR =
  "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0nMTAwJyBoZWlnaHQ9JzEwMCcgeG1sbnM9J2h0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnJz48cmVjdCB3aWR0aD0nMTAwJScgaGVpZ2h0PScxMDAlJyBmaWxsPScjZWVlZWVlJy8+PC9zdmc+";

const ABOUT_IMAGES: string[] = [
  "/OtherPics/photo_2026-04-22_22-53-29.jpg",
  "/OtherPics/secondpgoto.jpg",
  "/OtherPics/thirdphoto.jpg",
  "/OtherPics/fourthphoto.jpg",
  "/OtherPics/fifthphoto.jpg",
];

export default function AboutPhotoMosaic() {
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null);
  const alt = "POJ PRO — Photo gallery";

  return (
    <section className="container-section">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 w-full">
        {ABOUT_IMAGES.map((src, index) => (
          <div
            key={index}
            className="relative aspect-square overflow-hidden rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
            onClick={() => setLightboxSrc(src)}
          >
            <Image
              src={src}
              alt={`${alt} ${index + 1}`}
              fill
              priority={index === 0}
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
              className="object-cover"
              placeholder="blur"
              blurDataURL={HERO_BLUR}
              quality={60}
            />
          </div>
        ))}
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
