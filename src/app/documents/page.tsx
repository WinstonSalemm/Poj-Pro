"use client";

import React, { useEffect, useMemo, useState, useCallback } from "react";
import Link from "next/link";
import { useTranslation } from "@/i18n/useTranslation";
import { SeoHead } from "@/components/seo/SeoHead";

type Lang = "ru" | "en" | "uz";

type RawNorm = {
  id?: number;
  name?: string;      // новый формат
  norm?: string;      // старый формат (fallback)
  type?: string;      // СП, ГОСТ, NPB, ФЗ ...
  description?: string;
  link?: string;
  code?: string;      // например: "SP 3.13130.2009"
  year?: number;      // 2009
  jurisdiction?: string; // "RU"
  status?: string;    // "действует", "заменён", etc.
  applies_to?: string; // область применения (строка)
  key_requirements?: string[]; // список ключевых требований
  notes?: string;     // примечания
  last_updated?: string; // ISO-строка
};

type Norm = {
  id?: number;
  title: string;
  type?: string;
  description?: string;
  link?: string;
  code?: string;
  year?: number;
  jurisdiction?: string;
  status?: string;
  applies_to?: string;
  key_requirements?: string[];
  notes?: string;
  last_updated?: string;
};

type NormsPayload = Record<Lang, RawNorm[]>;

const langMap: Record<string, Lang> = {
  ru: "ru",
  en: "en",
  uz: "uz",
};

function normalize(raw: RawNorm): Norm {
  const title = raw.name || raw.norm || "—";
  return {
    id: raw.id,
    title,
    type: raw.type,
    description: raw.description,
    link: raw.link,
    code: raw.code,
    year: raw.year,
    jurisdiction: raw.jurisdiction,
    status: raw.status,
    applies_to: raw.applies_to,
    key_requirements: raw.key_requirements,
    notes: raw.notes,
    last_updated: raw.last_updated,
  };
}

function getDomain(url?: string): string | null {
  if (!url) return null;
  try {
    const u = new URL(url);
    return u.hostname.replace(/^www\./, "");
  } catch {
    return null;
  }
}

export default function DocumentsPage() {
  const { t, i18n } = useTranslation("translation");
  const [data, setData] = useState<NormsPayload | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const locale = (i18n?.language || 'ru') as string;

  // краткая «шторка»
  const [bootLoading, setBootLoading] = useState(true);
  useEffect(() => {
    const tm = setTimeout(() => setBootLoading(false), 800);
    return () => clearTimeout(tm);
  }, []);

  const normLang: Lang = useMemo(() => {
    const current = i18n.language as string;
    return langMap[current] ?? "ru";
  }, [i18n.language]);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    fetch("/data/norms.json")
      .then((r) => {
        if (!r.ok) throw new Error("Failed to load norms.json");
        return r.json();
      })
      .then((json: NormsPayload) => {
        if (mounted) {
          setData(json);
          setError(null);
        }
      })
      .catch((e) => mounted && setError(String(e)))
      .finally(() => mounted && setLoading(false));
    return () => {
      mounted = false;
    };
  }, []);

  const rows: Norm[] = useMemo(() => {
    if (!data) return [];
    const arr = data[normLang] ?? [];
    return arr.map(normalize);
  }, [data, normLang]);

  // Search and filter
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("");
  const types = useMemo(() => {
    const set = new Set<string>();
    rows.forEach((r) => r.type && set.add(r.type));
    return Array.from(set).sort();
  }, [rows]);
  const filteredRows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rows.filter((r) => {
      const matchesType = !typeFilter || (r.type || "") === typeFilter;
      const hay = `${r.title} ${r.code || ""} ${r.description || ""}`.toLowerCase();
      const matchesQuery = !q || hay.includes(q);
      return matchesType && matchesQuery;
    });
  }, [rows, query, typeFilter]);

  const showSkeleton = bootLoading || loading;

  // ------- Modal state -------
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<Norm | null>(null);

  const openModal = useCallback((item: Norm) => {
    setSelected(item);
    setOpen(true);
    // lock scroll
    document.documentElement.style.overflow = "hidden";
  }, []);

  const closeModal = useCallback(() => {
    setOpen(false);
    setSelected(null);
    document.documentElement.style.overflow = "";
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeModal();
    };
    if (open) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, closeModal]);

  // ------- Render -------
  return (
    <>
      <SeoHead
        title={`${t("documents.title")} — POJ PRO`}
        description={t("documents.subtitle", "Ключевые нормы и регламенты по пожарной безопасности")}
        path="/documents"
        locale={locale}
        image="/OtherPics/logo.png"
        structuredData={[
          {
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: t("nav.home", "Home"), item: "/" },
              { "@type": "ListItem", position: 2, name: t("documents.title"), item: "/documents" },
            ],
          },
        ]}
      />
      <main className="relative mx-auto max-w-6xl px-4 md:px-6 py-8 mt-[96px]">
      {/* ШТОРКА */}
      {bootLoading && (
        <div className="fixed inset-0 z-[60] bg-white/95 text-black flex flex-col items-center justify-center animate-fadeIn">
          <div className="text-xl md:text-2xl font-semibold tracking-wide mb-6">...</div>
          <div className="w-[260px] h-[6px] rounded-full bg-black/10 overflow-hidden">
            <div className="h-full w-1/3 animate-slideBar rounded-full bg-black/70" />
          </div>
        </div>
      )}

      {/* Шапка */}
      <div
        className={`mb-8 transition-opacity duration-500 ${bootLoading ? "opacity-0" : "opacity-100"
          }`}
      >
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl md:text-4xl font-semibold tracking-tight text-neutral-900">
              {t("documents.title")}
            </h1>
            <p className="mt-2 text-neutral-600 text-sm md:text-base">
              {t("documents.subtitle", "Ключевые нормы и регламенты по пожарной безопасности")}
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
            <div className="flex items-center gap-2">
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t("common.search", "Поиск")}
                className="w-64 rounded-xl border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#660000]"
              />
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="rounded-xl border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#660000] bg-white"
              >
                <option value="">{t("common.all", "Все")}</option>
                {types.map((tp) => (
                  <option key={tp} value={tp}>{tp}</option>
                ))}
              </select>
            </div>
            <Link
              href="/documents/certificates"
              className="self-start sm:self-auto inline-flex items-center gap-2 rounded-xl border border-[#660000] px-2.5 py-1.5 text-xs sm:text-sm sm:px-3 sm:py-2 font-medium !text-[#660000] hover:bg-[#660000] hover:!text-white hover:border-neutral-300 transition"
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                className="transition"
                aria-hidden="true"
              >
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z" />
                <path d="M14 2v6h6" />
                <path d="M8 14h8M8 17h8M8 11h5" />
              </svg>
              {t("certificates.title")}
            </Link>
          </div>

        </div>
      </div>

      {/* Ошибка */}
      {!showSkeleton && error && (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {t("common.error")}
        </div>
      )}

      {/* Контент: карточки */}
      <section
        className={`transition-opacity duration-500 ${bootLoading ? "opacity-0" : "opacity-100"
          }`}
      >
        {showSkeleton ? (
          <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {Array.from({ length: 9 }).map((_, i) => (
              <li key={i} className="rounded-2xl border border-neutral-200 bg-white p-4 md:p-5">
                <div className="h-5 w-2/3 shimmer rounded-md mb-3" />
                <div className="h-4 w-20 shimmer rounded-md mb-3" />
                <div className="h-4 w-full shimmer rounded-md mb-2" />
                <div className="h-4 w-5/6 shimmer rounded-md" />
              </li>
            ))}
          </ul>
        ) : (
          <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {filteredRows.map((item, idx) => (
              <li
                key={item.id ?? idx}
                className="animate-in-up rounded-2xl border border-neutral-200 bg-white p-4 md:p-5 shadow-sm hover:shadow-md hover:-translate-y-[2px] transition will-change-transform"
                style={{ animationDelay: `${idx * 0.05}s`, animationFillMode: "backwards" }}
              >
                {/* Заголовок */}
                <div className="flex items-start justify-between gap-3">
                  <h3 className="text-base md:text-[17px] font-semibold leading-snug text-neutral-900">
                    {item.title}
                  </h3>
                  {/* Тип (бейдж) */}
                  <span className="shrink-0 inline-flex items-center rounded-full border border-neutral-200 bg-neutral-50 px-2.5 py-1 text-[11px] font-medium text-neutral-700">
                    {item.type || "—"}
                  </span>
                </div>

                {/* Мета */}
                <div className="mt-1 text-xs text-neutral-500 flex flex-wrap items-center gap-2">
                  {item.code && <span className="rounded-md bg-neutral-100 px-1.5 py-0.5">{item.code}</span>}
                  {item.year && <span>· {item.year}</span>}
                  {item.jurisdiction && <span>· {item.jurisdiction}</span>}
                  {item.link && (
                    <span className="inline-flex items-center gap-1">
                      <span>·</span>
                      <span className="rounded-md bg-neutral-100 px-1.5 py-0.5">{getDomain(item.link)}</span>
                    </span>
                  )}
                </div>

                {/* Разделитель-акцент */}
                <div className="mt-3 h-[2px] w-12 rounded-full bg-[#660000]/30" />

                {/* Описание */}
                <p className="mt-3 text-sm leading-relaxed text-neutral-700">
                  {item.description || "—"}
                </p>

                {/* Действия */}
                <div className="mt-4 flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => openModal(item)}
                    className="inline-flex items-center gap-2 rounded-lg bg-[#660000] px-3 py-2 text-xs font-medium text-white hover:opacity-90 active:opacity-80 transition"
                  >
                    {t("common.open", "Открыть документ")}
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                      <path d="M7 17L17 7" stroke="currentColor" strokeWidth="1.6" />
                      <path d="M9 7h8v8" stroke="currentColor" strokeWidth="1.6" />
                    </svg>
                  </button>
                  {item.link && (
                    <a
                      href={item.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 rounded-lg border border-[#660000] px-3 py-2 text-xs font-medium !text-[#660000] bg-white hover:bg-[#660000] hover:!text-white transition"
                      aria-label={t("common.download", "Скачать")}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                        <path d="M12 3v12m0 0l-4-4m4 4l4-4" stroke="currentColor" strokeWidth="1.6" />
                        <path d="M5 21h14" stroke="currentColor" strokeWidth="1.6" />
                      </svg>
                      {t("common.download", "Скачать")}
                      {item.link.toLowerCase().endsWith('.pdf') && (
                        <span className="ml-1 rounded-md bg-neutral-100 px-1.5 py-0.5 text-[10px] text-neutral-700">PDF</span>
                      )}
                    </a>
                  )}
                </div>
              </li>
            ))}
            {filteredRows.length === 0 && (
              <li className="rounded-2xl border border-neutral-200 bg-white p-5 text-sm text-neutral-700">
                {/* пусто */}
              </li>
            )}
          </ul>
        )}
      </section>

      {/* MODAL (детальная) */}
      {open && selected && (
        <div
          className="fixed inset-0 z-[70]"
          aria-modal="true"
          role="dialog"
        >
          {/* overlay */}
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"
            onClick={closeModal}
          />
          {/* panel */}
          <div className="absolute inset-x-0 top-[6vh] mx-auto w-[min(980px,92vw)]">
            <div className="animate-in-up rounded-2xl border border-neutral-200 bg-white shadow-xl overflow-hidden">
              {/* header */}
              <div className="px-5 md:px-6 pt-5 md:pt-6 pb-4 border-b border-neutral-100 flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    {selected.type && (
                      <span className="inline-flex items-center rounded-full border border-neutral-200 bg-neutral-50 px-2.5 py-1 text-[11px] font-medium text-neutral-700">
                        {selected.type}
                      </span>
                    )}
                    {selected.code && (
                      <span className="inline-flex items-center rounded-md bg-neutral-100 px-2 py-0.5 text-[11px] text-neutral-700">
                        {selected.code}
                      </span>
                    )}
                    {selected.year && (
                      <span className="text-[11px] text-neutral-600">· {selected.year}</span>
                    )}
                    {selected.jurisdiction && (
                      <span className="text-[11px] text-neutral-600">· {selected.jurisdiction}</span>
                    )}
                    {selected.status && (
                      <span className="text-[11px] text-neutral-600">· {selected.status}</span>
                    )}
                  </div>
                  <h2 className="mt-2 text-xl md:text-2xl font-semibold leading-snug text-neutral-900 truncate">
                    {selected.title}
                  </h2>
                  {selected.link && (
                    <div className="mt-1 text-xs text-neutral-500 flex items-center gap-2">
                      <span className="rounded-md bg-neutral-100 px-1.5 py-0.5">{getDomain(selected.link)}</span>
                      {selected.last_updated && <span>· {t("common.updated", "обновлено")}: {new Date(selected.last_updated).toLocaleDateString()}</span>}
                    </div>
                  )}
                </div>
                <button
                  onClick={closeModal}
                  aria-label="Close"
                  className="shrink-0 rounded-xl border border-neutral-200 bg-white p-2 text-neutral-600 hover:bg-neutral-50 active:scale-95 transition"
                >
                  ✕
                </button>
              </div>

              {/* body */}
              <div className="px-5 md:px-6 py-5 md:py-6 grid md:grid-cols-5 gap-6">
                {/* summary */}
                <div className="md:col-span-3">
                  <h3 className="text-sm font-semibold text-neutral-900">{t("documents.description")}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-neutral-700 whitespace-pre-line">
                    {selected.description || "—"}
                  </p>

                  {/* key requirements */}
                  {selected.key_requirements && selected.key_requirements.length > 0 && (
                    <div className="mt-5">
                      <h4 className="text-sm font-semibold text-neutral-900">
                        {t("documents.key_requirements", "Ключевые требования")}
                      </h4>
                      <ul className="mt-2 space-y-2">
                        {selected.key_requirements.map((req, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-neutral-700">
                            <span className="mt-1 h-1.5 w-1.5 rounded-full bg-[#660000]" />
                            <span>{req}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* notes */}
                  {selected.notes && (
                    <div className="mt-5">
                      <h4 className="text-sm font-semibold text-neutral-900">
                        {t("common.notes", "Примечания")}
                      </h4>
                      <p className="mt-2 text-sm text-neutral-700 whitespace-pre-line">
                        {selected.notes}
                      </p>
                    </div>
                  )}
                </div>

                {/* meta */}
                <aside className="md:col-span-2">
                  <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-4">
                    <dl className="text-sm text-neutral-800 grid grid-cols-1 gap-2">
                      {selected.code && (
                        <div className="flex justify-between gap-4">
                          <dt className="text-neutral-500">{t("documents.code", "Код")}</dt>
                          <dd className="font-medium">{selected.code}</dd>
                        </div>
                      )}
                      {selected.year && (
                        <div className="flex justify-between gap-4">
                          <dt className="text-neutral-500">{t("common.year", "Год")}</dt>
                          <dd className="font-medium">{selected.year}</dd>
                        </div>
                      )}
                      {selected.jurisdiction && (
                        <div className="flex justify-between gap-4">
                          <dt className="text-neutral-500">{t("documents.jurisdiction", "Юрисдикция")}</dt>
                          <dd className="font-medium">{selected.jurisdiction}</dd>
                        </div>
                      )}
                      {selected.status && (
                        <div className="flex justify-between gap-4">
                          <dt className="text-neutral-500">{t("common.status", "Статус")}</dt>
                          <dd className="font-medium">{selected.status}</dd>
                        </div>
                      )}
                      {selected.applies_to && (
                        <div className="flex flex-col gap-1 pt-2">
                          <dt className="text-neutral-500">{t("documents.scope", "Область применения")}</dt>
                          <dd className="font-medium text-neutral-800">{selected.applies_to}</dd>
                        </div>
                      )}
                      {selected.last_updated && (
                        <div className="flex justify-between gap-4">
                          <dt className="text-neutral-500">{t("common.updated", "Обновлено")}</dt>
                          <dd className="font-medium">
                            {new Date(selected.last_updated).toLocaleDateString()}
                          </dd>
                        </div>
                      )}
                    </dl>
                  </div>



                </aside>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* keyframes (оставляем анимации) */}
      <style jsx global>{`
        @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
        .animate-fadeIn { animation: fadeIn .25s ease-out }

        @keyframes slideBar {
          0% { transform: translateX(-120%) }
          60% { transform: translateX(160%) }
          100% { transform: translateX(160%) }
        }
        .animate-slideBar { animation: slideBar 1.2s ease-in-out infinite }

        @keyframes inUp {
          0% { opacity: 0; transform: translateY(16px) }
          100% { opacity: 1; transform: translateY(0) }
        }
        .animate-in-up { animation: inUp .6s cubic-bezier(.22,.61,.36,1) both }

        .shimmer {
          position: relative;
          background: linear-gradient(90deg, #f5f6f7 25%, #eceef1 37%, #f5f6f7 63%);
          background-size: 400% 100%;
          animation: shimmerMove 1.2s ease-in-out infinite;
          border-radius: 8px;
        }
        @keyframes shimmerMove {
          0% { background-position: 100% 0 }
          100% { background-position: 0 0 }
        }
      `}</style>
      </main>
    </>
  );
}
