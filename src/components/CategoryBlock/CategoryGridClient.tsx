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

type Props = {
  dictionary: any;
  labels: Record<string, string>;
  imageMap: Record<string, string>;
  categories?: string[];
};

export default function CategoryGridClient({ dictionary, labels, imageMap, categories }: Props) {
  const list = categories ?? Object.keys(labels);
  const [fallbackSrc, setFallbackSrc] = useState<Record<string, string>>({});

  return (
    <section className="w-full flex items-center justify-center bg-[#f8f9fa]">
      <div className="w-full max-w-[1200px] box-border flex flex-col items-center py-12">
        <h2 className="text-3xl md:text-4xl text-[#660000] text-center mb-4 px-4">
          {dictionary.categoryBlock.title}
        </h2>
        <p className="text-center text-gray-600 max-w-3xl mx-auto mb-8 px-4">
          {dictionary.categoryBlock.description}
        </p>

        <div className="grid [grid-template-columns:repeat(auto-fit,minmax(280px,280px))] gap-6 sm:gap-5 p-6 sm:p-5 w-full max-w-[1800px] mx-auto justify-items-center place-items-center justify-center">
          {list.map((cat) => {
            // Use only server-resolved path; if missing, guaranteed placeholder
            const imgSrc = imageMap[cat] || "/OtherPics/logo.png";

            const cardContent = (
              <div
                key={cat}
                className="group w-[280px] min-h-[280px] max-h-[300px] bg-white rounded-2xl border border-[#f0f0f0] shadow-[0_4px_20px_rgba(0,0,0,0.08)] flex flex-col items-center justify-between px-3 py-4 transition-all duration-200 hover:-translate-y-1 hover:scale-[1.025] hover:shadow-[0_8px_32px_rgba(34,41,47,0.15),_0_3px_12px_rgba(34,41,47,0.07)] hover:border-[#e0e0e0] text-center"
                aria-label={labels[cat] || cat}
              >
                <div className="w-full h-[160px] max-w-[220px] min-h-[200px] max-h-[200px] bg-white rounded-xl border border-[#f0f0f0] shadow-[0_2px_8px_rgba(0,0,0,0.08)] flex items-center justify-center p-3 mb-3 transition-all duration-300">
                  <div className="relative w-full h-full flex items-center justify-center">
                    <Image
                      src={fallbackSrc[cat] ?? imgSrc}
                      alt={labels[cat] || cat}
                      width={160}
                      height={160}
                      loading="lazy"
                      unoptimized
                      className="max-w-full max-h-full object-contain transition-transform duration-300 group-hover:scale-[1.07]"
                      onError={() => {
                        setFallbackSrc((prev) => ({ ...prev, [cat]: "/OtherPics/logo.png" }));
                      }}
                    />
                  </div>
                </div>
                <div className="text-[0.95rem] font-semibold text-[#222] leading-tight tracking-[0.01em] px-2 min-h-[2.6em] flex items-center justify-center">
                  {labels[cat]?.trim() || fallbackName(cat)}
                </div>
                <hr className="w-[60%] h-[2px] border-0 bg-gradient-to-r from-[#e63946] to-[#f8f9fa] opacity-[0.13] rounded mt-2 mb-2" />
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
