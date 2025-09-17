"use client";

import { useMemo, useState, useCallback, useEffect } from "react";
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
}: {
  products: Product[];
  rawCategory: string;
  lang: "ru" | "en" | "uz";
}) {
  const { t } = useTranslation();

  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState<FiltersState>({});
  const [sort, setSort] = useState<SortKey>("relevance");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [bootLoading, setBootLoading] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setBootLoading(false), 500);
    return () => clearTimeout(t);
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
      return true;
    });
    return withPrice;
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
            const fallback = [
              { q: `Как выбрать ${categoryTitle.toLowerCase()}?`, a: `Подскажем оптимальные модели с учётом норм и условий эксплуатации. Обратитесь за консультацией — поможем подобрать ${categoryTitle.toLowerCase()}.` },
              { q: 'Есть ли доставка по Ташкенту и регионам?', a: 'Да, доставим по Ташкенту и всей Республике Узбекистан. Возможен самовывоз.' },
              { q: 'Предоставляете ли сертификаты и гарантию?', a: 'Да, выдаём необходимые сертификаты и гарантию. По запросу вышлем КП и прайс.' },
            ];
            const items = (cfg?.faqs && cfg.faqs.length)
              ? cfg.faqs.map(f => ({ q: f.question, a: f.answer }))
              : fallback;
            return (
              <section className="mt-10">
                <h2 className="text-2xl font-bold mb-6 text-center text-[#660000]">Часто задаваемые вопросы</h2>
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
                <h2 className="text-2xl font-bold mb-6 text-center text-[#660000]">Смотрите также</h2>
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
