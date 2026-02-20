"use client";

import Image from "next/image";
import Link from "next/link";
import type { Category } from "@/lib/api/categories";
import type { getDictionary } from "@/i18n/server";
import { CATEGORY_NAMES, CATEGORIES } from "@/constants/categories";
import { CATEGORY_NAME_OVERRIDES, type Lang } from "@/constants/categoryNameOverrides";
import Breadcrumbs from "@/components/Breadcrumbs";
import NewProductsBlock from "@/components/catalog/NewProductsBlock";
import { useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { getSafeKey } from "@/lib/react";

// Lang helpers (align with CategoryBlock)
type CanonLang = 'ru' | 'en' | 'uz';
const LANG_SYNONYMS: Record<CanonLang, readonly string[]> = {
  ru: ['ru', 'rus'],
  en: ['en', 'eng'],
  uz: ['uz', 'uzb'],
};
const normalizeLang = (input?: string): CanonLang => {
  const v = (input || 'ru').toLowerCase();
  if (v.startsWith('en')) return 'en';
  if (v.startsWith('uz')) return 'uz';
  return 'ru';
};
const pickByLang = <T extends Record<string, any> | undefined>(dict: T, lang: CanonLang) => {
  if (!dict) return undefined;
  for (const k of LANG_SYNONYMS[lang]) {
    if (k in (dict as any) && (dict as any)[k] != null) return (dict as any)[k];
  }
  return undefined;
};
const fallbackName = (key: string) =>
  key
    .replace(/[-_]/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .replace(/\s+/g, ' ')
    .trim();

// Helper to generate image paths
const imgPath = (key: string) => `/CatalogImage/${key}.png`;

// Lightweight product shape for search suggestions
type ProductLite = {
  id: number;
  slug: string;
  title: string | null;
  category?: { id: number; slug: string; name: string } | null;
};

function CatalogProductSearch({ locale }: { locale: string }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState<ProductLite[]>([]);
  const [open, setOpen] = useState(false);
  const fetchedRef = useRef(false);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const lang = (locale || 'ru').toLowerCase().startsWith('en')
    ? 'en'
    : (locale || 'ru').toLowerCase().startsWith('uz')
      ? 'uz'
      : 'ru';
  const placeholder = useMemo(() => {
    if (lang === 'en') return 'Search products';
    if (lang === 'uz') return 'Mahsulot qidirish';
    return 'Поиск товара';
  }, [lang]);

  // Fetch products lazily on first focus
  const ensureFetched = async () => {
    if (fetchedRef.current) return;
    try {
      setLoading(true);
      const res = await fetch(`/api/products?locale=${encodeURIComponent(locale)}`, { cache: 'no-store' });
      const json = await res.json();
      const list: any[] = json?.data?.products ?? [];
      const mapped: ProductLite[] = list.map((p) => ({
        id: Number(p.id),
        slug: String(p.slug),
        title: p.title ?? null,
        category: p.category ? { id: Number(p.category.id), slug: String(p.category.slug), name: String(p.category.name || '') } : null,
      }));
      setProducts(mapped);
      fetchedRef.current = true;
    } catch (e) {
      console.error('[CatalogProductSearch] fetch failed', e);
    } finally {
      setLoading(false);
    }
  };

  // Unify various dash-like characters to a simple hyphen '-' for consistent matching
  const normalizeText = (s: string) => {
    const mapDashes = /[\u2010\u2011\u2012\u2013\u2014\u2212\u2043\u00AD]/g; // hyphen, non-breaking hyphen, figure, en, em, minus, hyphen bullet, soft hyphen
    return (s || '')
      .toLowerCase()
      .replace(mapDashes, '-')      // unify dashes to '-'
      .replace(/_/g, '-')           // treat underscores as hyphens too
      .replace(/\s*-\s*/g, '-')   // collapse spaced dash to single '-'
      .replace(/-{2,}/g, '-')       // collapse multiple dashes
      .replace(/\s+/g, ' ')        // normalize whitespace
      .trim();
  };

  const filtered = useMemo(() => {
    const q = normalizeText(query);
    if (!q) return [] as ProductLite[];
    const byScore = (p: ProductLite) => {
      const title = normalizeText(p.title || '');
      const slug = normalizeText(p.slug || '');
      const cat = normalizeText(p.category?.slug || p.category?.name || '');
      let score = 0;
      if (title.startsWith(q)) score += 6;
      if (slug.startsWith(q)) score += 5;
      if (title.includes(q)) score += 3;
      if (slug.includes(q)) score += 2;
      if (cat.includes(q)) score += 1;
      return score;
    };
    return [...products]
      .map((p) => ({ p, s: byScore(p) }))
      .filter((x) => x.s > 0)
      .sort((a, b) => b.s - a.s)
      .slice(0, 10)
      .map((x) => x.p);
  }, [products, query]);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (filtered.length > 0) {
      const p = filtered[0];
      const url = p.category?.slug ? `/catalog/${p.category.slug}/${p.slug}` : `/catalog`;
      router.push(url);
      setOpen(false);
    }
  };

  return (
    <div className="relative">
      <form onSubmit={onSubmit} className="relative">
        <label className="sr-only" htmlFor="catalog-search-input">{placeholder}</label>
        <input
          id="catalog-search-input"
          ref={inputRef}
          type="search"
          value={query}
          onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
          onFocus={() => { setOpen(true); void ensureFetched(); }}
          onBlur={() => { setTimeout(() => setOpen(false), 150); }}
          placeholder={placeholder}
          className="w-full h-11 rounded-xl border border-neutral-200 bg-white/95 px-3 pr-9 text-[0.95rem] !text-[#222] placeholder:text-[#660000] shadow-sm outline-none focus:border-brand/40 focus:ring-4 focus:ring-brand/20 transition-[box-shadow,border-color] duration-200"
          autoComplete="off"
          aria-autocomplete="list"
          aria-expanded={open}
        />
        <div className="absolute right-2 top-1/2 -translate-y-1/2 text-neutral-400">
          {loading ? (
            <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="12" cy="12" r="10" strokeWidth="2" className="opacity-25" /><path d="M4 12a8 8 0 018-8" strokeWidth="2" className="opacity-75" /></svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" /></svg>
          )}
        </div>
      </form>
      {open && query && (
        <ul className="absolute z-20 mt-2 w-full rounded-xl border border-neutral-200 bg-white/98 shadow-[0_12px_40px_rgba(34,41,47,0.18),_0_2px_10px_rgba(34,41,47,0.06)] backdrop-blur supports-[backdrop-filter]:bg-white/80 max-h-72 overflow-auto">
          {filtered.length === 0 ? (
            <li className="px-3 py-2 text-sm text-neutral-500 first:rounded-t-xl last:rounded-b-xl">{lang === 'en' ? 'No results' : lang === 'uz' ? 'Natija topilmadi' : 'Ничего не найдено'}</li>
          ) : (
            filtered.map((p) => (
              <li key={getSafeKey(p.slug, p.id)} className="px-3 py-2 hover:bg-neutral-50 text-sm transition-colors first:rounded-t-xl last:rounded-b-xl">
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => {
                    const url = p.category?.slug ? `/catalog/${p.category.slug}/${p.slug}` : `/catalog`;
                    router.push(url);
                    setOpen(false);
                  }}
                  className="w-full text-left !text-[#660000] flex items-center justify-between gap-3"
                >
                  <span className="truncate">{p.title || p.slug}</span>
                  {p.category?.slug && (
                    <span className="ml-2 shrink-0 rounded-full bg-neutral-100 px-2.5 py-0.5 text-[11px] font-medium !text-[#000]">{p.category.slug}</span>
                  )}
                </button>
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
}

interface CatalogViewProps {
  categories: Category[];
  dictionary: Awaited<ReturnType<typeof getDictionary>>;
  locale: string;
}

export default function CatalogView({ categories, dictionary, locale }: CatalogViewProps) {
  // Normalize and guard categories input
  const safeCategories = (Array.isArray(categories) ? categories : [])
    .filter((c) => c && typeof (c as any).slug === 'string' && ((c as any).slug as string).trim().length > 0)
    .map((c) => ({
      ...c,
      slug: String((c as any).slug || '').trim(),
      name: typeof (c as any).name === 'string' && (c as any).name.trim() ? String((c as any).name).trim() : String((c as any).slug || '').trim(),
    }));

  const lang = normalizeLang(String(locale));

  // Build priority map based on CategoryBlock order
  const basePriority = new Map<string, number>();
  CATEGORIES.forEach((s, i) => basePriority.set(s, i));

  // Map API/transliterated slugs to canonical slugs used in CATEGORIES for ordering
  const CATEGORY_ORDER_SYNONYMS: Record<string, string> = {
    // Known pairs
    ognetushiteli: "fire-extinguishers",
    pozharnye_gidranty: "fire-hydrants",
    rukava_i_pozharnaya_armatura: "fire-hoses",
    pozharnye_rukava: "fire-hoses",
    pozharnye_shkafy: "fire-cabinets",
    pozharnaya_signalizatsiya_i_svetozvukovye_ustroystva: "fire-alarms",
    audiosistema_i_opoveschenie: "emergency-lighting",
    sistemy_opovescheniya_o_pozhare_dsppa_abk: "emergency-lighting",
    sistemy_pozharotusheniya_sprinkler: "sprinkler-systems",
    // Optionally map if present
    istochniki_pitaniya: "fire-pumps",
  };

  const getPriority = (slug: string) => {
    const canonical = CATEGORY_ORDER_SYNONYMS[slug] || slug;
    const p = basePriority.get(canonical);
    if (typeof p === "number") return p;
    // Unmapped go to the end, but stable by name
    return 10_000 + (slug.charCodeAt(0) || 0);
  };

  // Create a mapping of category slugs to their translated names (prefer constants/overrides)
  const categoryLabels = safeCategories.reduce((acc, category) => {
    const slug = (category?.slug ?? '').toString();
    const normalizedSlug = slug.replace(/_/g, '-');
    const altSlug = slug.replace(/-/g, '_');

    // 1) Manual overrides first (check both formats)
    const override = pickByLang(
      (CATEGORY_NAME_OVERRIDES as Record<string, Partial<Record<Lang, string>>>)[slug] ||
      CATEGORY_NAME_OVERRIDES[normalizedSlug] ||
      CATEGORY_NAME_OVERRIDES[altSlug],
      lang
    );
    if (override) {
      acc[slug] = String(override).trim();
      return acc;
    }

    // 2) General constants dictionary
    const constantName = (CATEGORY_NAMES as Record<string, Record<string, string>>)[slug]?.[lang];
    if (constantName) {
      acc[slug] = String(constantName).trim();
      return acc;
    }

    // 3) i18n dictionary from runtime dictionary.categories
    const dictName = (dictionary as any)?.categories?.[slug];
    if (dictName) {
      acc[slug] = String(dictName).trim();
      return acc;
    }

    // 4) API translation field
    const translation = (category as any).translations?.[locale];
    if (translation?.name) {
      acc[slug] = String(translation.name).trim();
      return acc;
    }

    // 5) Fallback to pretty slug or backend name
    acc[slug] = fallbackName((category as any).name || slug);
    return acc;
  }, {} as Record<string, string>);

  const sorted = [...safeCategories].sort((a, b) => getPriority(a.slug) - getPriority(b.slug));

  return (
    <main className="bg-[#F8F9FA] min-h-screen relative">
      <section className="container-section section-y mt-[100px]">
        <div className="grid grid-cols-1 md:[grid-template-columns:1fr_auto_1fr] items-center gap-5 md:gap-6 mb-5">
          <div className="justify-self-start">
            <Breadcrumbs
              className="flex items-center text-sm text-gray-500"
              items={[
                { name: (dictionary as any)?.common?.home ?? 'Home', href: '/' },
                { name: (dictionary as any)?.header?.catalog ?? 'Catalog' },
              ]}
            />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-brand text-center md:text-center tracking-[0.01em]">
            {dictionary.catalog.title}
          </h1>
          <div className="justify-self-end w-full md:w-[340px] lg:w-[420px]">
            <CatalogProductSearch locale={locale} />
          </div>
        </div>
        <p className="text-center text-gray-600 max-w-3xl mx-auto mb-8 px-4">
          {dictionary.catalog.description}
        </p>

        {sorted.length === 0 ? (
          <div className="max-w-2xl mx-auto mt-8 text-center text-neutral-600">
            <div className="mb-4 text-lg">{(dictionary as any)?.catalog?.emptyTitle || 'Категории не найдены'}</div>
            <p className="mb-6">{(dictionary as any)?.catalog?.emptyDescription || 'Попробуйте воспользоваться поиском или зайдите позже.'}</p>
            <div className="w-full md:w-[340px] lg:w-[420px] mx-auto">
              <CatalogProductSearch locale={locale} />
            </div>
          </div>
        ) : (
          <div className="grid [grid-template-columns:repeat(auto-fit,minmax(220px,1fr))] gap-6 justify-items-center">
            {sorted.map((cat, idx) => (
              <Link
                key={cat.id}
                href={`/catalog/${cat.slug}`}
                className="w-full max-w-[320px] group animate-in-up"
                style={{
                  animationDelay: `${idx * 0.07}s`,
                }}
                aria-label={categoryLabels[cat.slug] || cat.name}
              >
                <div className="bg-white rounded-2xl border border-[#f0f0f0] shadow-[0_4px_20px_rgba(0,0,0,0.08)] px-3 py-4 flex flex-col items-center justify-between min-h-[260px] text-center transition-all duration-300 hover:-translate-y-1 hover:scale-[1.03] hover:shadow-[0_8px_32px_rgba(34,41,47,0.15),_0_3px_12px_rgba(34,41,47,0.07)] hover:border-neutral-200">
                  <div className="w-full h-[150px] bg-white rounded-xl border border-[#f0f0f0] shadow-[0_2px_8px_rgba(0,0,0,0.08)] flex items-center justify-center p-3 mb-3 overflow-hidden">
                    <div className="relative w-full h-full">
                      {cat.imageData ? (
                        // Используем base64 imageData из API
                        <Image
                          src={`data:image/png;base64,${cat.imageData}`}
                          alt={categoryLabels[cat.slug] || fallbackName(cat.slug)}
                          fill
                          sizes="(max-width: 768px) 50vw, 180px"
                          priority={idx < 4}
                          className="object-contain transition-transform duration-300 group-hover:scale-[1.08]"
                          quality={80}
                          fetchPriority={idx < 4 ? "high" : "auto"}
                          loading={idx < 4 ? undefined : "lazy"}
                        />
                      ) : cat.image ? (
                        // Используем URL изображения из базы
                        <Image
                          src={cat.image}
                          alt={categoryLabels[cat.slug] || fallbackName(cat.slug)}
                          fill
                          sizes="(max-width: 768px) 50vw, 180px"
                          priority={idx < 4}
                          className="object-contain transition-transform duration-300 group-hover:scale-[1.08]"
                          quality={80}
                          fetchPriority={idx < 4 ? "high" : "auto"}
                          loading={idx < 4 ? undefined : "lazy"}
                        />
                      ) : (
                        // Fallback на файл
                        <Image
                          src={imgPath(cat.slug)}
                          alt={categoryLabels[cat.slug] || fallbackName(cat.slug)}
                          fill
                          sizes="(max-width: 768px) 50vw, 180px"
                          priority={idx < 4}
                          className="object-contain transition-transform duration-300 group-hover:scale-[1.08]"
                          quality={80}
                          fetchPriority={idx < 4 ? "high" : "auto"}
                          loading={idx < 4 ? undefined : "lazy"}
                        />
                      )}
                    </div>
                  </div>
                  <div className="text-[0.95rem] font-semibold text-[#222] leading-tight tracking-[0.01em] px-2 min-h-[2.6em] flex items-center justify-center">
                    {categoryLabels[cat.slug] || fallbackName(cat.slug)}
                  </div>

                  <hr className="w-[60%] h-[2px] border-0 bg-gradient-to-r from-[#e63946] to-[#f8f9fa] opacity-[0.13] rounded mt-2" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* New Products Block */}
      <NewProductsBlock type="new" limit={6} />
    </main>
  );
}
