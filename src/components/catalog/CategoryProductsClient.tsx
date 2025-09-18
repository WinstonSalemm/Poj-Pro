"use client";

import { useMemo, useState, useCallback, useEffect } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";

import { useTranslation } from "react-i18next";
import ProductCard from "@/components/ProductCard/ProductCard";
import { evViewItemList } from "@/lib/analytics/dataLayer";
import Breadcrumbs from "@/components/Breadcrumbs";
import type { Product } from "@/types/product";
import FiltersSidebar, { type FiltersState, type SortKey } from "./FiltersSidebar";

import MobileFiltersDrawer from "./MobileFiltersDrawer";
import Link from "next/link";
import Image from "next/image";
import { CATEGORY_NAMES, CATEGORY_IMAGE_MAP } from "@/constants/categories";
import { CATEGORY_SEO, resolveCategoryKey } from "@/constants/categorySeo";
import FAQAccordion from "@/components/seo/FAQAccordion";
import ProductJsonLd from "@/components/seo/ProductJsonLd";
import { CATEGORY_NAME_OVERRIDES, type Lang } from "@/constants/categoryNameOverrides";

function fallbackName(key: string): string {
  return key
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .replace(/\s+/g, ' ')
    .trim();
}

export default function CategoryProductsClient({
  products,
  rawCategory,
  lang,
  initialFilters,
}: {
  products: Product[];
  rawCategory: string;
  lang: "ru" | "en" | "uz";
  initialFilters?: FiltersState;
}) {
  const { t } = useTranslation('translation');
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState<FiltersState>(initialFilters ?? {});
  const [sort, setSort] = useState<SortKey>("relevance");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [bootLoading, setBootLoading] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setBootLoading(false), 500);
    return () => clearTimeout(t);
  }, []);

  // Initialize filters from URL (path segment or query) once if not provided from props
  useEffect(() => {
    if (filters.type || initialFilters?.type) return; // don't override provided filter
    const seg = (pathname || '').split('/').filter(Boolean).pop();
    const fromPath = (rawCategory === 'ognetushiteli' && (seg === 'op' || seg === 'ou' || seg === 'mpp' || seg === 'recharge')) ? seg : undefined;
    const qType = searchParams?.get('type') || undefined;
    const val = (fromPath || qType) as FiltersState['type'];
    if (val === 'op' || val === 'ou' || val === 'mpp' || val === 'recharge') {
      setFilters((prev) => ({ ...prev, type: val }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const categoryTitle = useMemo(() => {
    const dict = t("categories", { returnObjects: true, defaultValue: {} }) as
      | Record<string, string>
      | undefined;
    const l = (lang as Lang) || "ru";
    const normalizedSlug = rawCategory.replace(/_/g, '-');
    const altSlug = rawCategory.replace(/-/g, '_');
    const override =
      (CATEGORY_NAME_OVERRIDES as Record<string, Partial<Record<Lang, string>>>)[rawCategory] ||
      CATEGORY_NAME_OVERRIDES[normalizedSlug] ||
      CATEGORY_NAME_OVERRIDES[altSlug];
    const constName =
      (CATEGORY_NAMES as Record<string, Partial<Record<Lang, string>>>)[rawCategory]?.[l] ||
      CATEGORY_NAMES[normalizedSlug]?.[l] ||
      CATEGORY_NAMES[altSlug]?.[l];
    const dictName = dict?.[rawCategory] || dict?.[normalizedSlug] || dict?.[altSlug];
    return override?.[l] || constName || dictName || fallbackName(rawCategory);
  }, [t, rawCategory, lang]);

  const filteredProducts = useMemo(() => {
    const list = !searchQuery
      ? products
      : products.filter((p) => {
          const q = searchQuery.trim().toLowerCase();
          return (
            (p.title || p.name || "").toLowerCase().includes(q) ||
            p.description?.toLowerCase().includes(q) ||
            p.short_description?.toLowerCase().includes(q)
          );
        });
    const withPrice = list.filter((p) => {
      const price = typeof p.price === 'number' ? p.price : Number(p.price) || 0;
      if (filters.minPrice != null && price < filters.minPrice) return false;
      if (filters.maxPrice != null && price > filters.maxPrice) return false;
      // availability filter
      if (filters.availability === 'in' && !(price > 0)) return false;
      if (filters.availability === 'out' && (price > 0)) return false;
      return true;
    });
    const byType = withPrice.filter((p) => {
      if (!filters.type) return true;
      const text = `${p.slug} ${p.title || ''} ${p.name || ''} ${p.description || ''}`.toLowerCase();
      if (filters.type === 'op') return /(\bop[-_\s]?|\bоп[-_\s]?)/i.test(text) || /\bpowder|порошков/i.test(text);
      if (filters.type === 'ou') return /(\bou[-_\s]?|\bоу[-_\s]?)/i.test(text) || /co2|углекислот/i.test(text);
      if (filters.type === 'mpp') return /\bmpp|мпп|module|модул/i.test(text);
      if (filters.type === 'recharge') return /(перезаряд|перезаряж|заправк)/i.test(text) || /(recharg|refill)/i.test(text) || /(qayta\s*zaryad|to['’`]?ldir)/i.test(text);
      return true;
    });
    // Placeholder for volumes/classes filtering (best-effort parsing)
    const byVolume = byType.filter((p) => {
      if (!filters.volumes || filters.volumes.length === 0) return true;
      const text = `${p.slug} ${p.title || ''} ${p.name || ''}`.toLowerCase();
      return filters.volumes.some((v) => new RegExp(`\\b${v}\\b`).test(text));
    });
    const byClasses = byVolume.filter((p) => {
      if (!filters.classes || filters.classes.length === 0) return true;
      const text = `${p.description || ''}`.toUpperCase();
      return filters.classes.every((c) => text.includes(c));
    });
    return byClasses;
  }, [products, searchQuery, filters]);

  const sortedProducts = useMemo(() => {
    const arr = [...filteredProducts];
    switch (sort) {
      case 'priceAsc':
        return arr.sort((a, b) => (Number(a.price) || 0) - (Number(b.price) || 0));
      case 'priceDesc':
        return arr.sort((a, b) => (Number(b.price) || 0) - (Number(a.price) || 0));
      case 'nameAsc':
        return arr.sort((a, b) => String(a.title || a.name || '').localeCompare(String(b.title || b.name || '')));
      case 'nameDesc':
        return arr.sort((a, b) => String(b.title || b.name || '').localeCompare(String(a.title || a.name || '')));
      default:
        return arr;
    }
  }, [filteredProducts, sort]);

  // Push a typed list view on initial render of the list (debounced by bootLoading)
  useEffect(() => {
    if (bootLoading) return;
    try {
      const items = sortedProducts.slice(0, 20).map(p => ({
        id: p.id,
        name: p.title || p.name,
        price: typeof p.price === 'number' ? p.price : Number(p.price) || undefined,
        quantity: 1,
        category: rawCategory,
      }));
      evViewItemList({ items, list_id: rawCategory, list_name: categoryTitle });
    } catch {}
    // push again if sorting changes significantly
  }, [bootLoading, rawCategory, categoryTitle, sortedProducts]);

  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setSearchQuery(e.target.value);
    },
    []
  );

  // Sync URL with filters
  useEffect(() => {
    const onlyType = !!filters.type && !filters.minPrice && !filters.maxPrice && !filters.availability && (!filters.volumes || filters.volumes.length === 0) && (!filters.classes || filters.classes.length === 0) && !searchQuery && sort === 'relevance';
    const isOnTypeRoute = pathname?.startsWith('/catalog/ognetushiteli/type/');
    const current = pathname + ((searchParams && searchParams.toString()) ? `?${searchParams.toString()}` : '');
    if (rawCategory === 'ognetushiteli' && onlyType) {
      const target = `/catalog/ognetushiteli/type/${filters.type}`;
      if (current !== target) {
        router.replace(target);
      }
      // If already at the target, skip query param sync to avoid bouncing back to base path
      return;
    } else if (rawCategory === 'ognetushiteli' && isOnTypeRoute) {
      // if user adds filters or clears type while on /type/:type, go back to base category path
      const base = `/catalog/${encodeURIComponent(rawCategory)}`;
      const paramsBack = new URLSearchParams();
      if (filters.type) paramsBack.set('type', filters.type);
      if (filters.minPrice != null) paramsBack.set('min', String(filters.minPrice));
      if (filters.maxPrice != null) paramsBack.set('max', String(filters.maxPrice));
      if (filters.availability) paramsBack.set('avail', filters.availability);
      if (searchQuery) paramsBack.set('q', searchQuery);
      const hrefBack = paramsBack.toString() ? `${base}?${paramsBack.toString()}` : base;
      if (current !== hrefBack) {
        router.replace(hrefBack);
        return;
      }
    }

    // Reflect filters in query params for all categories (including ognetushiteli when not only-type)
    const params = new URLSearchParams(searchParams?.toString() || '');
    // write minimal params
    if (filters.type) params.set('type', filters.type);
    else params.delete('type');
    if (filters.minPrice != null) params.set('min', String(filters.minPrice)); else params.delete('min');
    if (filters.maxPrice != null) params.set('max', String(filters.maxPrice)); else params.delete('max');
    if (filters.availability) params.set('avail', filters.availability); else params.delete('avail');
    if (searchQuery) params.set('q', searchQuery); else params.delete('q');
    const q = params.toString();
    const base = `/catalog/${encodeURIComponent(rawCategory)}`;
    const href = q ? `${base}?${q}` : base;
    if (current !== href) router.replace(href);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters, searchQuery, sort, rawCategory, pathname]);

  return (
    <>
      {/* SEO: Emit Product JSON-LD for products on the page */}
      {sortedProducts.map((p, i) => (
        <ProductJsonLd key={`pjsonld-${p.id}-${i}`} product={p} categorySlug={rawCategory} />
      ))}
      <main className="bg-[#F8F9FA] min-h-screen">
        <section className="container-section section-y mt-0 pt-4 sm:pt-6">
          <Breadcrumbs
            items={[
              { name: t('common.home', 'Home'), href: `/` },
              { name: t('header.catalog', 'Catalog'), href: `/catalog` },
              { name: categoryTitle },
            ]}
          />

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <h1 className="text-3xl md:text-4xl font-bold !text-[#660000]">
              {categoryTitle}
            </h1>
            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
              <div className="relative flex-grow max-w-[420px]">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={handleSearchChange}
                  placeholder={t("search.placeholder", "Search products...")}
                  className="w-full px-4 py-2.5 !text-[#660000] rounded-xl border border-[#660000] bg-white hover:bg-[#fafafa] focus:outline-none focus:ring-2 focus:ring-[#660000] focus:ring-opacity-50 transition-all duration-200"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 !text-[#660000] hover:text-[#4d0000]"
                    aria-label="Clear search"
                  >
                    ✕
                  </button>
                )}
              </div>
              <button onClick={() => setDrawerOpen(true)} className="md:hidden btn-ghost px-3 py-2">
                {t('filters.open', 'Фильтр')}
              </button>
            </div>
          </div>

          <div className="flex gap-8">
            {/* Desktop sidebar */}
            <div className="hidden md:block w-64 shrink-0">
              <div className="sticky top-20 max-h-[calc(100vh-90px)] overflow-auto">
                <FiltersSidebar
                  total={sortedProducts.length}
                  filters={filters}
                  setFilters={setFilters}
                  sort={sort}
                  setSort={setSort}
                />
              </div>
            </div>

            {/* Content */}
            <div className="flex-1">
              {/* SEO intro moved to SSR intro on category page */}
              {bootLoading ? (
                <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <div key={i} className="bg-white rounded-2xl p-4 border border-gray-200">
                      <div className="rounded-xl bg-gray-200 aspect-square animate-pulse" />
                      <div className="mt-3 h-4 w-3/4 bg-gray-200 rounded animate-pulse" />
                      <div className="mt-2 h-4 w-1/3 bg-gray-200 rounded animate-pulse" />
                      <div className="mt-3 h-10 w-full bg-gray-200 rounded-xl animate-pulse" />
                    </div>
                  ))}
                </div>
              ) : sortedProducts.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-lg text-gray-600">
                    {t("catalog.noProductsFound", "No products found.")}
                  </p>
                  {(searchQuery || filters.minPrice || filters.maxPrice) && (
                    <button
                      onClick={() => { setSearchQuery(""); setFilters({}); setSort("relevance"); }}
                      className="mt-3 btn-ghost"
                    >
                      Сбросить фильтры
                    </button>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
                  {sortedProducts.map((product, i) => (
                    <ProductCard
                      key={`${product.id}-${lang}`}
                      product={product}
                      listId={rawCategory}
                      listName={categoryTitle}
                      priority={i < 4}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>

          <MobileFiltersDrawer
            open={drawerOpen}
            onClose={() => setDrawerOpen(false)}
            total={sortedProducts.length}
            filters={filters}
            setFilters={setFilters}
            sort={sort}
            setSort={setSort}
          />

          {/* FAQ Section (visible) — JSON-LD is already injected on server */}
          {(() => {
            const key = resolveCategoryKey(rawCategory.replace(/_/g, '-'));
            const cfg = key ? CATEGORY_SEO[key] : undefined;
            const categoryTitleLower = categoryTitle.toLowerCase();
            const fallback = (() => {
              const q1 = {
                ru: `Как выбрать ${categoryTitleLower}?`,
                en: `How to choose ${categoryTitleLower}?`,
                uz: `${categoryTitleLower}ni qanday tanlash mumkin?`,
              } as const;
              const a1 = {
                ru: `Подскажем оптимальные модели с учётом норм и условий эксплуатации. Обратитесь за консультацией — поможем подобрать ${categoryTitleLower}.`,
                en: `We will suggest optimal models considering standards and operating conditions. Contact us — we will help you choose ${categoryTitleLower}.`,
                uz: `Meʼyorlar va ishlatish sharoitlarini inobatga olib eng mos modellarni tavsiya qilamiz. Maslahat uchun murojaat qiling — ${categoryTitleLower} tanlashda yordam beramiz.`,
              } as const;
              const q2 = {
                ru: 'Есть ли доставка по Ташкенту и регионам?',
                en: 'Do you deliver in Tashkent and regions?',
                uz: 'Toshkent va mintaqalarga yetkazib berasizmi?',
              } as const;
              const a2 = {
                ru: 'Да, доставим по Ташкенту и всей Республике Узбекистан. Возможен самовывоз.',
                en: 'Yes, we deliver across Tashkent and all of Uzbekistan. Pickup is also available.',
                uz: 'Ha, Toshkent bo‘ylab va butun O‘zbekiston bo‘yicha yetkazib beramiz. Olib ketish ham mumkin.',
              } as const;
              const q3 = {
                ru: 'Предоставляете ли сертификаты и гарантию?',
                en: 'Do you provide certificates and warranty?',
                uz: 'Sertifikatlar va kafolat berasizmi?',
              } as const;
              const a3 = {
                ru: 'Да, выдаём необходимые сертификаты и гарантию. По запросу вышлем КП и прайс.',
                en: 'Yes, we provide all necessary certificates and warranty. On request, we will send a quote and price list.',
                uz: 'Ha, barcha kerakli sertifikatlar va kafolatni taqdim etamiz. So‘rov bo‘yicha KP va prays yuboramiz.',
              } as const;
              const l = lang || 'ru';
              return [
                { q: q1[l], a: a1[l] },
                { q: q2[l], a: a2[l] },
                { q: q3[l], a: a3[l] },
              ];
            })();
            // Prefer localized FAQs if available, then fallback chain
            const items = (() => {
              const l = lang;
              const byLang = (cfg as unknown as { faqsByLang?: Partial<Record<Lang, { question: string; answer: string }[]>> })?.faqsByLang;
              const localized = byLang?.[l];
              if (localized && localized.length) {
                return localized.map(f => ({ q: f.question, a: f.answer }));
              }
              // For non-RU languages without localized FAQs, prefer generic localized fallback
              if (l !== 'ru') {
                return fallback;
              }
              // For RU, use category-specific RU FAQs when available
              if (cfg?.faqs && cfg.faqs.length) {
                return cfg.faqs.map(f => ({ q: f.question, a: f.answer }));
              }
              return fallback;
            })();
            return (
              <section className="mt-10">
                <h2 className="text-2xl font-bold mb-6 text-center text-[#660000]">{t('catalog.faqTitle', 'Часто задаваемые вопросы')}</h2>
                <FAQAccordion items={items} jsonLd={false} />
              </section>
            );
          })()}

          {/* Related categories */}
          {(() => {
            const key = resolveCategoryKey(rawCategory.replace(/_/g, '-')) || rawCategory.replace(/_/g, '-');
            const keys = Object.keys(CATEGORY_NAMES).filter((k) => k !== key);
            const related = keys.slice(0, 6);
            if (related.length === 0) return null;
            return (
              <section className="mt-10">
                <h2 className="text-2xl font-bold mb-6 text-center text-[#660000]">{t('catalog.relatedTitle', 'Смотрите также')}</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                  {related.map((k) => {
                    const label = CATEGORY_NAMES[k]?.[lang] || fallbackName(k);
                    const img = CATEGORY_IMAGE_MAP[k] ? `/CatalogImage/${CATEGORY_IMAGE_MAP[k]}` : "/OtherPics/logo.png";
                    const preferred = (CATEGORY_SEO as Record<string, { alias?: string[] }>)[k]?.alias?.[0];
                    const hrefSlug = preferred || k;
                    const href = `/catalog/${hrefSlug}`;
                    return (
                      <Link key={k} href={href} className="block group border border-gray-200 rounded-xl bg-white hover:shadow transition">
                        <div className="aspect-square rounded-t-xl overflow-hidden bg-gray-100 relative">
                          {/* Next/Image unoptimized for category tiles to keep CDN behavior and satisfy lint */}
                          <Image
                            src={img}
                            alt={label}
                            fill
                            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 200px"
                            className="object-contain"
                            unoptimized
                            priority={false}
                          />
                        </div>
                        <div className="p-2 text-center text-sm text-[#660000] group-hover:underline">
                          {label}
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </section>
            );
          })()}
        </section>
      </main>
    </>
  );
}
