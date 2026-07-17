import type { Metadata } from "next";
import Link from "next/link";
import { headers } from "next/headers";
import { buildPageMetadata, langFromCookieHeader } from "@/lib/metadata";
import { getLocale } from "@/lib/api";
import { getActivePromotions } from "@/lib/promotions";
import PromotionsGridClient from "@/components/promotions/PromotionsGridClient";
import type { PromotionCard } from "@/types/promotion";

export async function generateMetadata(): Promise<Metadata> {
  const h = await headers();
  const cookie = h.get("cookie");
  const lang = langFromCookieHeader(cookie);
  return buildPageMetadata({
    defaultTitle:
      lang === "eng"
        ? "Active promotions"
        : lang === "uzb"
          ? "Faol aksiyalar"
          : "Активные акции",
    defaultDescription:
      lang === "eng"
        ? "Current discounts and special offers from POJ PRO."
        : lang === "uzb"
          ? "POJ PRO’dan joriy chegirmalar va maxsus takliflar."
          : "Текущие скидки и спецпредложения от POJ PRO.",
    path: "/promotions",
    lang,
    keywords: ["акции", "скидки", "спецпредложения", "POJ PRO", "Ташкент"],
  });
}

const PAGE_COPY = {
  ru: { catalog: "Перейти в каталог" },
  en: { catalog: "Open catalog" },
  uz: { catalog: "Katalogni ochish" },
} as const;

export default async function PromotionsPage() {
  const locale = await getLocale();
  const lang = locale === "en" || locale === "uz" ? locale : "ru";
  const copy = PAGE_COPY[lang];

  let promotions: PromotionCard[] = [];
  try {
    promotions = await getActivePromotions(lang);
  } catch (error) {
    console.error("[promotions/page] failed to load", error);
  }

  return (
    <main className="bg-[#F8F9FA] min-h-screen">
      <section className="container-section section-y">
        <PromotionsGridClient locale={lang} promotions={promotions} showHeader />
        {promotions.length === 0 ? (
          <div className="mt-4 text-center">
            <Link
              href="/catalog"
              className="inline-flex min-h-10 items-center justify-center rounded-xl bg-[#660000] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#8B0000]"
            >
              {copy.catalog}
            </Link>
          </div>
        ) : null}
      </section>
    </main>
  );
}
