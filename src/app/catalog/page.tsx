"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import Breadcrumbs from "@/components/Breadcrumbs";

const CATEGORIES = [
  "ognetushiteli",
  "rukava_i_pozharnaya_armatura",
  "pozharnaya_signalizatsiya_i_svetozvukovye_ustroystva",
  "pozharnye_shkafy",
  "usiliteli",
  "dinamiki_potolochnye",
  "furnitura_dlya_ognetushiteley",
  "siz",
  "sistemy_pozharotusheniya_sprinkler",
  "oborudovanie_kontrolya_dostupa",
  "zamki_i_aksessuary",
  "audiosistema_i_opoveschenie",
  "istochniki_pitaniya",
  "paneli_gsm_i_besprovodnye_sistemy_ipro",
  "kontrolnye_paneli_adresnye_pozharno_ohrannye",
  "sistemy_opovescheniya_o_pozhare_dsppa_abk",
  "metakom",
  "tsifral",
  "monitory_i_krepleniya",
  "videoregistratory_usiliteli_signala_haby",
  "oborudovanie_proizvodstva_npo_bolid_rossiya",
  "ballony",
] as const;

const imgPath = (key: string) => `/CatalogImage/${key}.png`;
const fallbackName = (key: string) =>
  key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

export default function CatalogCategoriesPage() {
  const { t } = useTranslation();
  const [bootLoading, setBootLoading] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setBootLoading(false), 800);
    return () => clearTimeout(t);
  }, []);

  const labels: Record<string, string> = {};
  const dict =
    ((t("categories", { returnObjects: true, defaultValue: {} }) ||
      {}) as Record<string, string>) ?? {};
  CATEGORIES.forEach((k) => (labels[k] = dict[k] || fallbackName(k)));

  return (
    <main className="bg-[#F8F9FA] min-h-screen relative">
      {/* Шторка */}
      {bootLoading && (
        <div className="fixed inset-0 z-[60] bg-[white] text-black flex flex-col items-center justify-center animate-fadeIn">
          <div className="text-2xl font-semibold tracking-wide mb-6">...
          </div>
          <div className="w-[240px] h-[6px] rounded-full bg-black/10 overflow-hidden">
            <div className="h-full w-1/3 animate-slideBar rounded-full bg-black/70" />
          </div>
        </div>
      )}

      <section
        className={`container-section section-y mt-[100px] transition-opacity duration-500 ${bootLoading ? "opacity-0" : "opacity-100"}`}
      >
        <Breadcrumbs
          items={[
            { name: t('common.home', 'Home'), href: '/' },
            { name: t('header.catalog', 'Catalog') },
          ]}
        />
        <h1 className="margin-top-[100px] text-3xl md:text-4xl font-bold text-brand text-center mb-8">
          {t("catalog.categoriesTitle", "Категории каталога")}
        </h1>

        <div className="grid [grid-template-columns:repeat(auto-fit,minmax(220px,1fr))] gap-6 justify-items-center">
          {bootLoading
            ? Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="w-full max-w-[320px] rounded-2xl border border-[#eee] p-3 shimmer h-[260px]"
              />
            ))
            : CATEGORIES.map((cat, idx) => (
              <Link
                key={cat}
                href={`/catalog/${encodeURIComponent(cat)}`}
                className="w-full max-w-[320px] group animate-in-up"
                style={{
                  animationDelay: `${idx * 0.07}s`,
                  animationFillMode: "backwards",
                }}
                aria-label={labels[cat] || cat}
              >
                <div className="bg-white rounded-2xl border border-[#f0f0f0] shadow-[0_4px_20px_rgba(0,0,0,0.08)] px-3 py-4 flex flex-col items-center justify-between min-h-[260px] text-center transition-all duration-300 hover:-translate-y-1 hover:scale-[1.03] hover:shadow-[0_8px_32px_rgba(34,41,47,0.15),_0_3px_12px_rgba(34,41,47,0.07)] hover:border-neutral-200">
                  <div className="w-full h-[150px] bg-white rounded-xl border border-[#f0f0f0] shadow-[0_2px_8px_rgba(0,0,0,0.08)] flex items-center justify-center p-3 mb-3 overflow-hidden">
                    <div className="relative w-full h-full">
                      <Image
                        src={imgPath(cat)}
                        alt={labels[cat] || cat}
                        fill
                        sizes="(max-width: 768px) 50vw, 180px"
                        priority={CATEGORIES.indexOf(cat) < 4}
                        className="object-contain transition-transform duration-300 group-hover:scale-[1.08]"
                      />
                    </div>
                  </div>
                  <div className="text-[0.95rem] font-semibold text-[#222] leading-tight tracking-[0.01em] px-2 min-h-[2.6em] flex items-center justify-center">
                    {labels[cat] || fallbackName(cat)}
                  </div>

                  <hr className="w-[60%] h-[2px] border-0 bg-gradient-to-r from-[#e63946] to-[#f8f9fa] opacity-[0.13] rounded mt-2" />
                </div>
              </Link>
            ))}
        </div>
      </section>

      {/* keyframes */}
      <style jsx global>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.25s ease-out;
        }

        @keyframes slideBar {
          0% {
            transform: translateX(-120%);
          }
          60% {
            transform: translateX(160%);
          }
          100% {
            transform: translateX(160%);
          }
        }
        .animate-slideBar {
          animation: slideBar 1.2s ease-in-out infinite;
        }

        @keyframes inUp {
          0% {
            opacity: 0;
            transform: translateY(16px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-in-up {
          animation: inUp 0.6s cubic-bezier(0.22, 0.61, 0.36, 1) both;
        }

        .shimmer {
          position: relative;
          background: linear-gradient(
            90deg,
            #f3f4f6 25%,
            #e5e7eb 37%,
            #f3f4f6 63%
          );
          background-size: 400% 100%;
          animation: shimmerMove 1.2s ease-in-out infinite;
        }
        @keyframes shimmerMove {
          0% {
            background-position: 100% 0;
          }
          100% {
            background-position: 0 0;
          }
        }
      `}</style>
    </main>
  );
}
