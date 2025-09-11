"use client";

import { useState, useMemo } from "react";
import { useTranslation } from "@/i18n/useTranslation";

type FAQItem = { q: string; a: string };

export type GuideFAQClientProps = {
  fallbackItems?: FAQItem[];
};

export default function GuideFAQClient({ fallbackItems }: GuideFAQClientProps) {
  const { t } = useTranslation();
  // Pull array of FAQ items from i18n: guide.faq
  const items = useMemo<FAQItem[]>(() => {
    try {
      const arr = (t as unknown as (key: string, opts?: unknown) => unknown)(
        "guide.faq",
        { returnObjects: true }
      );
      if (Array.isArray(arr)) return arr as unknown as FAQItem[];
    } catch {}
    return fallbackItems ?? [];
  }, [t, fallbackItems]);

  const [open, setOpen] = useState<number | null>(0);
  if (!items.length) return null;

  return (
    <section className="mt-8">
      {/* JSON-LD structured data for FAQ */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            {
              '@context': 'https://schema.org',
              '@type': 'FAQPage',
              mainEntity: items.map((it) => ({
                '@type': 'Question',
                name: it.q,
                acceptedAnswer: { '@type': 'Answer', text: it.a },
              })),
            },
            null,
            2
          ),
        }}
      />
      <h2 className="text-xl font-semibold !text-[#660000] mb-3">
        {t("guide.faqTitle", "Частые вопросы")}
      </h2>
      <div className="space-y-3">
        {items.map((it, i) => (
          <div key={i} className="rounded-lg border border-gray-200 bg-white">
            <button
              type="button"
              className="w-full text-left px-4 py-3 flex items-center justify-between"
              onClick={() => setOpen(open === i ? null : i)}
              aria-expanded={open === i}
              aria-controls={`faq-panel-${i}`}
            >
              <span className="font-medium text-[#660000]">{it.q}</span>
              <svg
                className={`h-4 w-4 text-gray-500 transition-transform ${open === i ? "rotate-180" : ""}`}
                viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
              >
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>
            <div id={`faq-panel-${i}`} className={`${open === i ? "block" : "hidden"} px-4 pb-4 text-gray-600`}>
              {it.a}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
