"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import Image from "next/image";

/** Порядок категорий (как у тебя) */
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
] as const;

/** Подкатегории СИЗ (модалка) */
const SIZ_SUBCATEGORIES = [
  "siz_zashita_golovy",
  "siz_zashita_glaz",
  "siz_zashita_dyhaniya",
  "siz_zashita_ruk",
  "siz_odezhda",
  "siz_komplekty",
] as const;

const imgPath = (key: string) => `/CatalogImage/${key}.png`;
const fallbackName = (key: string) =>
  key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

export default function CategoryBlock() {
  const { t, ready, i18n } = useTranslation();
  const [labels, setLabels] = useState<Record<string, string>>({});
  const [showSizSubs, setShowSizSubs] = useState(false);

  useEffect(() => {
    if (!ready) return;
    const dict = (t("categories", { returnObjects: true, defaultValue: {} }) ||
      {}) as Record<string, string>;
    const mapped: Record<string, string> = {};
    CATEGORIES.forEach((k) => (mapped[k] = dict[k] || fallbackName(k)));
    setLabels(mapped);
  }, [ready, t, i18n.language]);

  return (
    /* Центрируем ВЕСЬ блок по странице */
    <section className="w-full min-h-screen flex items-center justify-center bg-[#f8f9fa]">
      {/* Контейнер контента */}
      <div className="w-full max-w-[1200px] box-border flex flex-col items-center py-12">
        {/* Заголовок */}
        <h2 className="text-3xl md:text-4xl text-[#660000] text-center mb-8 px-4">
          {t("categoryBlock.catalog", "Каталог")}
        </h2>

        {/* Сетка карточек — фиксированная ширина колонок, всегда по центру */}
        <div className="grid [grid-template-columns:repeat(auto-fit,minmax(280px,280px))] gap-6 sm:gap-5 p-6 sm:p-5 w-full max-w-[1800px] mx-auto justify-items-center place-items-center justify-center">
          {CATEGORIES.map((cat) => {
            const content = (
              <div
                className="group w-[280px] min-h-[280px] max-h-[300px] bg-white rounded-2xl border border-[#f0f0f0] shadow-[0_4px_20px_rgba(0,0,0,0.08)] flex flex-col items-center justify-between px-3 py-4 transition-all duration-200 hover:-translate-y-1 hover:scale-[1.025] hover:shadow-[0_8px_32px_rgba(34,41,47,0.15),_0_3px_12px_rgba(34,41,47,0.07)] hover:border-[#e0e0e0] text-center"
                aria-label={labels[cat] || cat}
              >
                {/* Картинка */}
                <div className="w-full h-[160px] max-w-[220px] min-h-[200px] max-h-[200px] bg-white rounded-xl border border-[#f0f0f0] shadow-[0_2px_8px_rgba(0,0,0,0.08)] flex items-center justify-center p-3 mb-3 transition-all duration-300">
                  <div className="relative w-full h-full flex items-center justify-center">
                    <Image
                      src={imgPath(cat)}
                      alt={labels[cat] || cat}
                      width={160}
                      height={160}
                      className="max-w-full max-h-full object-contain transition-transform duration-300 group-hover:scale-[1.07]"
                      sizes="(max-width: 640px) 140px, (max-width: 1024px) 160px, 180px"
                      loading="lazy"
                      onError={(e) => {
                        // next/image проксирует событие к <img>, так что это ок
                        const el = e.currentTarget as HTMLImageElement;
                        el.onerror = null;
                        el.src = "/placeholder-category.png";
                      }}
                    />
                  </div>
                </div>

                {/* Заголовок категории */}
                <div className="text-[0.95rem] font-semibold text-[#222] leading-tight tracking-[0.01em] px-2 min-h-[2.6em] flex items-center justify-center">
                  {labels[cat] || fallbackName(cat)}
                </div>

                {/* Divider */}
                <hr className="w-[60%] h-[2px] border-0 bg-gradient-to-r from-[#e63946] to-[#f8f9fa] opacity-[0.13] rounded mt-2 mb-2" />
              </div>
            );

            // СИЗ — открывает модалку
            if (cat === "siz") {
              return (
                <button key={cat} type="button" onClick={() => setShowSizSubs(true)} className="block">
                  {content}
                </button>
              );
            }

            // Остальные — ссылка на каталог с query
            return (
              <Link key={cat} href={`/catalog?category=${encodeURIComponent(cat)}`} className="block">
                {content}
              </Link>
            );
          })}
        </div>
      </div>

      {/* Модалка с подкатегориями СИЗ */}
      {showSizSubs && (
        <div
          className="fixed inset-0 z-[1050] bg-black/40 backdrop-blur-[1px] flex items-center justify-center p-4"
          onClick={() => setShowSizSubs(false)}
          aria-modal="true"
          role="dialog"
        >
          <div
            className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-xl font-semibold mb-4">
              {t("categories.siz", "Средства индивидуальной защиты (СИЗ)")}
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {SIZ_SUBCATEGORIES.map((sub) => (
                <Link
                  key={sub}
                  href={`/catalog?category=${encodeURIComponent(sub)}`}
                  onClick={() => setShowSizSubs(false)}
                  className="w-full px-4 py-3 rounded-lg border border-gray-200 hover:border-[#e63946] hover:bg-[#f8f9fa] transition-colors text-left"
                >
                  {t(`categories.${sub}`, fallbackName(sub))}
                </Link>
              ))}
            </div>

            <button
              onClick={() => setShowSizSubs(false)}
              aria-label="Close"
              className="absolute -top-3 -right-3 h-9 w-9 rounded-full bg-white border border-gray-200 shadow hover:shadow-md hover:scale-105 transition"
            >
              ×
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
