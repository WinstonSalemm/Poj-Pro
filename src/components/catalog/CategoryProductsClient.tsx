"use client";

import { useMemo, useState, useCallback, useEffect } from "react";
import { useTranslation } from "react-i18next";
import ProductCard from "@/components/ProductCard/ProductCard";
import { evViewItemList } from "@/lib/analytics/dataLayer";
import Breadcrumbs from "@/components/Breadcrumbs";
import type { Product } from "@/types/product";
import FiltersSidebar, { type FiltersState, type SortKey } from "./FiltersSidebar";
import MobileFiltersDrawer from "./MobileFiltersDrawer";
import { CATEGORY_NAMES } from "@/constants/categories";
import FaqJsonLd from "@/components/seo/FaqJsonLd";
import { CATEGORY_SEO, resolveCategoryKey } from "@/constants/categorySeo";
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
      {/* SEO: Category-specific FAQ JSON-LD */}
      {(() => {
        const key = resolveCategoryKey(rawCategory.replace(/_/g, '-'));
        const cfg = key ? CATEGORY_SEO[key] : undefined;
        if (cfg?.faqs && cfg.faqs.length) {
          return <FaqJsonLd faqs={cfg.faqs} />;
        }
        return null;
      })()}
      <main className="bg-[#F8F9FA] min-h-screen">
        <section className="container-section section-y mt-[100px]">
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
              <FiltersSidebar
                total={sortedProducts.length}
                filters={filters}
                setFilters={setFilters}
                sort={sort}
                setSort={setSort}
              />
            </div>

            {/* Content */}
            <div className="flex-1">
              {/* SEO intro for category (text + internal links) */}
              {(() => {
                const key = resolveCategoryKey(rawCategory.replace(/_/g, '-'));
                const cfg = key ? CATEGORY_SEO[key] : undefined;
                if (!cfg) return null;
                const paragraphs = cfg.intro || [];
                const links = cfg.links || [];
                if (!paragraphs.length && !links.length) return null;
                return (
                  <div className="mb-6 bg-white border border-gray-200 rounded-2xl p-4 text-gray-800">
                    {paragraphs.map((p, i) => (
                      <p key={i} className={i === paragraphs.length - 1 ? "mb-0" : "mb-2"}>{p}</p>
                    ))}
                    {!!links.length && (
                      <p className="mt-2 mb-0">
                        {links.map((l, idx) => (
                          <>
                            {idx > 0 ? ' ' : ''}
                            <a key={l.href} href={l.href} className="underline hover:no-underline">{l.label}</a>
                            {idx < links.length - 1 ? ' ' : ''}
                          </>
                        ))}
                      </p>
                    )}
                  </div>
                );
              })()}
              {bootLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
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
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {sortedProducts.map((product) => (
                    <ProductCard key={`${product.id}-${lang}`} product={product} />
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
        </section>
      </main>
    </>
  );
}
