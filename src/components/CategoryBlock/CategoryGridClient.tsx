"use client";

import Link from "next/link";
import SizCategoryModal from "../SizCategoryModal";
import Image from "next/image";
import { useState } from "react";

const fallbackName = (key: string) =>
  key
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .replace(/\s+/g, ' ')
    .trim();

type CategoryBlockDictionary = {
  categoryBlock?: {
    title?: string;
    catalog?: string;
    description?: string;
  };
} & Record<string, unknown>;

type Props = {
  dictionary: CategoryBlockDictionary;
  labels: Record<string, string>;
  imageMap: Record<string, string>;
  categories?: string[];
};

export default function CategoryGridClient({ dictionary, labels, imageMap, categories }: Props) {
  const list = categories ?? Object.keys(labels);
  const [fallbackSrc, setFallbackSrc] = useState<Record<string, string>>({});

  const title = dictionary?.categoryBlock?.title || dictionary?.categoryBlock?.catalog || 'Catalog';
  const description = dictionary?.categoryBlock?.description || '';

  return (
    <section className="w-full flex items-center justify-center bg-[#f8f9fa]">
      <div className="w-full max-w-[1200px] box-border flex flex-col items-center py-12">
        <h2 className="text-3xl md:text-4xl text-[#660000] text-center mb-4 px-4">
          {title}
        </h2>
        <p className="text-center text-gray-600 max-w-3xl mx-auto mb-8 px-4">
          {description}
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6 p-4 sm:p-5 w-full max-w-[1200px] mx-auto">
          {list.map((cat) => {
            // Use only server-resolved path; if missing, guaranteed placeholder
            const imgSrc = imageMap[cat] || "/OtherPics/logo.png";

            const cardContent = (
              <div
                key={cat}
                className="group w-full bg-white rounded-2xl border border-[#f0f0f0] shadow-[0_4px_20px_rgba(0,0,0,0.08)] flex flex-col items-center justify-between px-3 py-4 transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_8px_32px_rgba(34,41,47,0.15),_0_3px_12px_rgba(34,41,47,0.07)] hover:border-[#e0e0e0] text-center"
                aria-label={labels[cat] || cat}
              >
                <div className="w-full aspect-square bg-white rounded-xl border border-[#f0f0f0] shadow-[0_2px_8px_rgba(0,0,0,0.08)] flex items-center justify-center p-3 mb-3 transition-all duration-300">
                  <div className="relative w-full h-full">
                    <Image
                      src={fallbackSrc[cat] ?? imgSrc}
                      alt={labels[cat] || cat}
                      fill
                      sizes="(max-width: 640px) 45vw, (max-width: 1024px) 30vw, 200px"
                      loading="lazy"
                      unoptimized
                      className="object-contain transition-transform duration-300 group-hover:scale-[1.05]"
                      onError={() => {
                        setFallbackSrc((prev) => ({ ...prev, [cat]: "/OtherPics/logo.png" }));
                      }}
                    />
                  </div>
                </div>
                <div className="text-[0.95rem] md:text-[1rem] font-semibold text-[#222] leading-tight tracking-[0.01em] px-2 min-h-[2.6em] flex items-center justify-center">
                  {labels[cat]?.trim() || fallbackName(cat)}
                </div>
                <hr className="w-[60%] h-[2px] border-0 bg-gradient-to-r from-[#e63946] to-[#f8f9fa] opacity-[0.13] rounded mt-2" />
              </div>
            );

            if (cat === "ppe") {
              return <SizCategoryModal key={cat} sizCard={cardContent} labels={labels} />;
            }
            return (
              <Link key={cat} href={`/catalog?category=${encodeURIComponent(cat)}`} className="block">
                {cardContent}
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
