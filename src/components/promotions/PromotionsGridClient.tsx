"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { PromotionCard } from "@/types/promotion";
import { PROMOTION_ROUTES } from "@/types/promotion";
import PromotionModal from "./PromotionModal";

type Copy = {
  title: string;
  subtitle: string;
  all: string;
  empty: string;
};

const COPY: Record<"ru" | "en" | "uz", Copy> = {
  ru: {
    title: "Активные акции",
    subtitle: "Скидки и спецпредложения",
    all: "Все акции",
    empty: "Сейчас акций нет — следите за обновлениями.",
  },
  en: {
    title: "Active promotions",
    subtitle: "Discounts and special offers",
    all: "All promotions",
    empty: "No active promotions right now — check back soon.",
  },
  uz: {
    title: "Faol aksiyalar",
    subtitle: "Chegirmalar va maxsus takliflar",
    all: "Barcha aksiyalar",
    empty: "Hozircha aksiyalar yo‘q — yangilanishlarni kuzatib boring.",
  },
};

type Props = {
  locale: string;
  promotions: PromotionCard[];
  /** Compact preview for homepage */
  preview?: boolean;
  showHeader?: boolean;
};

export default function PromotionsGridClient({
  locale,
  promotions,
  preview = false,
  showHeader = true,
}: Props) {
  const lang = locale === "en" || locale === "uz" ? locale : "ru";
  const copy = COPY[lang];
  const [active, setActive] = useState<PromotionCard | null>(null);
  const list = preview ? promotions.slice(0, 4) : promotions;

  // On homepage preview, hide the whole block until there is at least one promo
  if (preview && list.length === 0) return null;

  return (
    <section className={preview ? "container-section mt-4 md:mt-6" : undefined}>
      {showHeader ? (
        <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className={`font-semibold text-[#660000] ${preview ? "text-lg sm:text-xl" : "text-2xl sm:text-3xl"}`}>
              {copy.title}
            </h2>
            {preview ? <p className="mt-1 text-sm text-gray-600">{copy.subtitle}</p> : null}
          </div>
          {preview ? (
            <Link
              href={PROMOTION_ROUTES.publicPage}
              className="inline-flex min-h-10 shrink-0 items-center justify-center rounded-xl border border-[#660000]/20 px-4 py-2 text-sm font-semibold text-[#660000] transition-colors hover:bg-[#660000]/5"
            >
              {copy.all}
            </Link>
          ) : null}
        </div>
      ) : null}

      {list.length === 0 ? (
        <div className="rounded-2xl border border-gray-200 bg-white px-5 py-8 text-center text-sm text-gray-600 shadow-sm">
          {copy.empty}
        </div>
      ) : (
        <div className="grid grid-cols-1 items-start gap-3 sm:grid-cols-2">
          {list.map((promo) => (
            <button
              key={promo.id}
              type="button"
              onClick={() => setActive(promo)}
              className="group flex flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#660000]/40"
            >
              <div className="w-full bg-gray-100">
                {promo.imageUrl ? (
                  <Image
                    src={promo.imageUrl}
                    alt={promo.title}
                    width={1200}
                    height={600}
                    className="h-auto w-full object-contain"
                    sizes="(max-width: 640px) 100vw, 50vw"
                    unoptimized={promo.imageUrl.startsWith("data:") || promo.imageUrl.startsWith("/api/")}
                  />
                ) : (
                  <div className="flex aspect-[4/3] items-center justify-center text-xs text-gray-400">POJ PRO</div>
                )}
              </div>
              <div className="px-2.5 py-1.5">
                <h3 className="line-clamp-2 text-sm font-medium text-[#660000]">{promo.title}</h3>
                {!preview && promo.summary ? (
                  <p className="mt-0.5 line-clamp-2 text-xs text-gray-600">{promo.summary}</p>
                ) : null}
              </div>
            </button>
          ))}
        </div>
      )}

      <PromotionModal promotion={active} locale={lang} onClose={() => setActive(null)} />
    </section>
  );
}
