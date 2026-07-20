"use client";

import Image from "next/image";
import Link from "next/link";
import type { PromotionCard } from "@/types/promotion";

type Copy = {
  starts: string;
  ends: string;
  openLink: string;
  close: string;
};

const COPY: Record<"ru" | "en" | "uz", Copy> = {
  ru: { starts: "Начало", ends: "Окончание", openLink: "Подробнее", close: "Закрыть" },
  en: { starts: "Starts", ends: "Ends", openLink: "Learn more", close: "Close" },
  uz: { starts: "Boshlanishi", ends: "Tugashi", openLink: "Batafsil", close: "Yopish" },
};

function formatDate(iso: string | null | undefined, locale: "ru" | "en" | "uz"): string {
  if (!iso) return "—";
  try {
    return new Intl.DateTimeFormat(locale === "uz" ? "uz-UZ" : locale === "en" ? "en-GB" : "ru-RU", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    }).format(new Date(iso));
  } catch {
    return iso.slice(0, 10);
  }
}

type Props = {
  promotion: PromotionCard | null;
  locale: "ru" | "en" | "uz";
  onClose: () => void;
};

export default function PromotionModal({ promotion, locale, onClose }: Props) {
  if (!promotion) return null;
  const copy = COPY[locale];

  return (
    <div
      className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/50 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="promotion-modal-title"
      onClick={onClose}
    >
      <div
        className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-gray-100">
          {promotion.imageUrl ? (
            <Image
              src={promotion.imageUrl}
              alt={promotion.title}
              width={1200}
              height={1200}
              className="h-auto w-full object-contain"
              sizes="(max-width: 640px) 100vw, 512px"
              unoptimized={promotion.imageUrl.startsWith("data:") || promotion.imageUrl.startsWith("/api/")}
            />
          ) : null}
        </div>
        <div className="p-5">
          <h3 id="promotion-modal-title" className="text-xl font-bold text-[#660000]">
            {promotion.title}
          </h3>
          {promotion.summary ? (
            <p className="mt-2 text-sm leading-6 text-gray-700">{promotion.summary}</p>
          ) : null}
          {promotion.description ? (
            <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-gray-600">{promotion.description}</p>
          ) : null}
          <dl className="mt-4 grid grid-cols-1 gap-2 text-sm sm:grid-cols-2">
            <div className="rounded-xl bg-[#F8F9FA] px-3 py-2">
              <dt className="text-xs text-gray-500">{copy.starts}</dt>
              <dd className="font-medium text-gray-800">{formatDate(promotion.startsAt, locale)}</dd>
            </div>
            <div className="rounded-xl bg-[#F8F9FA] px-3 py-2">
              <dt className="text-xs text-gray-500">{copy.ends}</dt>
              <dd className="font-medium text-gray-800">{formatDate(promotion.endsAt, locale)}</dd>
            </div>
          </dl>
          <div className="mt-5 flex flex-col gap-2 sm:flex-row">
            {promotion.href ? (
              <Link
                href={promotion.href}
                className="inline-flex min-h-10 flex-1 items-center justify-center rounded-xl bg-[#660000] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#8B0000]"
              >
                {copy.openLink}
              </Link>
            ) : null}
            <button
              type="button"
              onClick={onClose}
              className="inline-flex min-h-10 flex-1 items-center justify-center rounded-xl border border-gray-300 px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50"
            >
              {copy.close}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
