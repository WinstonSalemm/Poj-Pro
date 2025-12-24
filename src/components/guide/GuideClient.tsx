"use client";

import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "@/i18n/useTranslation";
import Link from "next/link";
import GuideFAQClient from "@/components/guide/GuideFAQClient";
import BlurReveal from "@/components/ui/BlurReveal";
import { Home, Building2, Fuel, Zap } from "lucide-react";

export default function GuideClient() {
  const { t } = useTranslation();
  const title = t("guide.title");
  const intro = t("guide.intro");

  const [activeId, setActiveId] = useState<string>("apt");

  // Memoize getArray function to avoid recreating it on every render
  const getArray = useMemo(
    () => (key: string): string[] => {
      try {
        const anyT = t as unknown as (k: string, o?: unknown) => unknown;
        const arr = anyT(key, { returnObjects: true });
        return Array.isArray(arr) ? (arr as string[]) : [];
      } catch {
        return [];
      }
    },
    [t]
  );

  // Memoize all array results to avoid recalculating on every render
  const mtRecs = useMemo(() => getArray("guide.sections.maintenance.recs"), [getArray]);
  const sgRecs = useMemo(() => getArray("guide.sections.signage.recs"), [getArray]);

  // Memoize building items arrays
  const apartmentItems = useMemo(() => getArray("guide.minimalKits.buildings.apartment.items"), [getArray]);
  const officeItems = useMemo(() => getArray("guide.minimalKits.buildings.office.items"), [getArray]);
  const houseItems = useMemo(() => getArray("guide.minimalKits.buildings.house.items"), [getArray]);
  const gasStationItems = useMemo(() => getArray("guide.minimalKits.buildings.gasStation.items"), [getArray]);
  const electricalPanelItems = useMemo(() => getArray("guide.minimalKits.buildings.electricalPanel.items"), [getArray]);

  // Memoize quick links array
  const quickLinksSlugs = useMemo(() => [
    "ognetushiteli",
    "pozharnye_shkafy",
    "rukava_i_pozharnaya_armatura",
    "pozharnaya_signalizatsiya_i_svetozvukovye_ustroystva",
    "siz",
  ], []);

  const sectionIds = useMemo(() => {
    const ids = ["minimal-kits"];
    if (mtRecs.length) ids.push("maintenance");
    if (sgRecs.length) ids.push("signage");
    ids.push("faq");
    return ids;
  }, [mtRecs.length, sgRecs.length]);

  useEffect(() => {
    // Use passive observer with optimized settings
    const observer = new IntersectionObserver(
      (entries) => {
        // Find the entry with highest intersection ratio
        let best: IntersectionObserverEntry | null = null;
        let maxRatio = 0;

        for (const e of entries) {
          const ratio = e.intersectionRatio;
          if (ratio > maxRatio && e.isIntersecting) {
            maxRatio = ratio;
            best = e;
          }
        }

        if (best?.target.id) {
          setActiveId(best.target.id);
        }
      },
      {
        rootMargin: "-80px 0px -60% 0px",
        threshold: [0.15, 0.3, 0.6],
        // Use passive observation for better performance
      }
    );

    // Batch DOM queries and observations
    const elements = sectionIds
      .map((id) => document.getElementById(id))
      .filter(Boolean) as HTMLElement[];

    elements.forEach((el) => observer.observe(el));

    return () => {
      observer.disconnect();
    };
  }, [sectionIds]);

  return (
    <div className="space-y-6 md:space-y-8">
      {/* Header */}
      <BlurReveal>
        <div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl leading-tight font-semibold text-[#660000] mb-2">
            {title}
          </h1>
          <p className="text-[#660000] text-sm sm:text-base lg:text-lg">
            {intro}
          </p>
        </div>
      </BlurReveal>

      {/* TOC */}
      <BlurReveal delay={100}>
        <nav aria-label={t("guide.toc.title")}>
          <div className="rounded-xl border border-gray-200 bg-white p-3 sm:p-4">
            <h2 className="text-base sm:text-lg font-semibold text-[#660000] mb-2">
              {t("guide.toc.title")}
            </h2>
            <ul className="flex flex-wrap gap-2 text-xs sm:text-sm">
              {sectionIds.map((id) => {
                let title = "";
                if (id === "minimal-kits") {
                  title = t("guide.minimalKits.title");
                } else if (id === "faq") {
                  title = t("guide.faqTitle");
                } else {
                  title = t(`guide.sections.${id}.title`, id);
                }
                return (
                  <li key={id}>
                    <a
                      href={`#${id}`}
                      className={`text-[#660000] hover:underline ${activeId === id
                        ? "font-semibold underline underline-offset-4"
                        : ""
                        }`}
                    >
                      {title}
                    </a>
                  </li>
                );
              })}
            </ul>
          </div>
        </nav>
      </BlurReveal>

      {/* Quick links */}
      <BlurReveal delay={200}>
        <section className="rounded-xl border border-gray-200 bg-white p-4">
          <h2 className="text-base sm:text-lg font-semibold text-[#660000] mb-3">
            {t("guide.quickLinks.title")}
          </h2>
          <div className="flex flex-col sm:flex-row flex-wrap gap-2">
            {quickLinksSlugs.map((slug) => (
              <Link
                key={slug}
                href={`/catalog/${slug}`}
                className="btn-ghost text-center w-full sm:w-auto"
              >
                {t(`categories.${slug}`)}
              </Link>
            ))}
          </div>
        </section>
      </BlurReveal>

      {/* Минимальные наборы для типов зданий */}
      <BlurReveal delay={250}>
        <section id="minimal-kits" className="scroll-mt-24 rounded-xl border border-gray-200 bg-white p-4 sm:p-6">
          <h2 className="text-xl sm:text-2xl font-semibold text-[#660000] mb-4 sm:mb-6">
            {t("guide.minimalKits.title")}
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {/* Квартира */}
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 sm:p-5 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3 mb-3">
                <div className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-[#660000]/10 flex items-center justify-center">
                  <Home className="w-5 h-5 sm:w-6 sm:h-6 text-[#660000]" />
                </div>
                <h3 className="text-lg sm:text-xl font-semibold text-[#660000]">
                  {t("guide.minimalKits.buildings.apartment.title")}
                </h3>
              </div>
              <ul className="space-y-2 text-sm sm:text-base text-gray-700">
                {apartmentItems.map((item, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-[#660000] mt-1">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Офис */}
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 sm:p-5 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3 mb-3">
                <div className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-[#660000]/10 flex items-center justify-center">
                  <Building2 className="w-5 h-5 sm:w-6 sm:h-6 text-[#660000]" />
                </div>
                <h3 className="text-lg sm:text-xl font-semibold text-[#660000]">
                  {t("guide.minimalKits.buildings.office.title")}
                </h3>
              </div>
              <ul className="space-y-2 text-sm sm:text-base text-gray-700">
                {officeItems.map((item, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-[#660000] mt-1">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Дом */}
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 sm:p-5 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3 mb-3">
                <div className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-[#660000]/10 flex items-center justify-center">
                  <Home className="w-5 h-5 sm:w-6 sm:h-6 text-[#660000]" />
                </div>
                <h3 className="text-lg sm:text-xl font-semibold text-[#660000]">
                  {t("guide.minimalKits.buildings.house.title")}
                </h3>
              </div>
              <ul className="space-y-2 text-sm sm:text-base text-gray-700">
                {houseItems.map((item, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-[#660000] mt-1">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Заправка */}
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 sm:p-5 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3 mb-3">
                <div className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-[#660000]/10 flex items-center justify-center">
                  <Fuel className="w-5 h-5 sm:w-6 sm:h-6 text-[#660000]" />
                </div>
                <h3 className="text-lg sm:text-xl font-semibold text-[#660000]">
                  {t("guide.minimalKits.buildings.gasStation.title")}
                </h3>
              </div>
              <ul className="space-y-2 text-sm sm:text-base text-gray-700">
                {gasStationItems.map((item, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-[#660000] mt-1">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Электро-щит */}
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 sm:p-5 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3 mb-3">
                <div className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-[#660000]/10 flex items-center justify-center">
                  <Zap className="w-5 h-5 sm:w-6 sm:h-6 text-[#660000]" />
                </div>
                <h3 className="text-lg sm:text-xl font-semibold text-[#660000]">
                  {t("guide.minimalKits.buildings.electricalPanel.title")}
                </h3>
              </div>
              <ul className="space-y-2 text-sm sm:text-base text-gray-700">
                {electricalPanelItems.map((item, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-[#660000] mt-1">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="mt-6 p-4 rounded-lg bg-[#660000]/5 border border-[#660000]/20">
            <p
              className="text-sm sm:text-base text-gray-700"
              dangerouslySetInnerHTML={{ __html: t("guide.minimalKits.note") }}
            />
          </div>
        </section>
      </BlurReveal>

      {/* FAQ */}
      <BlurReveal delay={400}>
        <div
          id="faq"
          className="scroll-mt-24 rounded-xl border border-gray-200 bg-white p-4"
        >
          <GuideFAQClient />
        </div>
      </BlurReveal>

      {/* CTA */}
      <BlurReveal delay={500}>
        <section className="rounded-xl border border-gray-200 bg-white p-4 sm:p-5 flex flex-col md:flex-row gap-4 md:items-center md:justify-between">
          <div>
            <h3 className="text-base sm:text-lg font-semibold text-[#660000]">
              {t("guide.cta.title")}
            </h3>
            <p className="text-sm sm:text-base text-gray-700">
              {t("guide.cta.subtitle")}
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
            <Link
              href="/contacts?topic=quote"
              className="btn-primary text-center w-full sm:w-auto"
            >
              {t("guide.cta.requestQuote")}
            </Link>
            <Link
              href="https://t.me/pojsystema"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-ghost text-center w-full sm:w-auto"
            >
              {t("guide.cta.consultation")}
            </Link>
          </div>
        </section>
      </BlurReveal>
    </div>
  );
}
