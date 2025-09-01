"use client";

import { useMemo, useState, useCallback, useEffect } from "react";
import { useTranslation } from "react-i18next";
import ProductCard from "@/components/ProductCard/ProductCard";
import Breadcrumbs from "@/components/Breadcrumbs";
import { SeoHead } from "@/components/seo/SeoHead";
import type { Product } from "@/types/product";
import FiltersSidebar, { type FiltersState, type SortKey } from "./FiltersSidebar";
import MobileFiltersDrawer from "./MobileFiltersDrawer";

function fallbackName(key: string): string {
  return key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
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
    return dict?.[rawCategory] || fallbackName(rawCategory);
  }, [t, rawCategory]);

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

  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setSearchQuery(e.target.value);
    },
    []
  );

  return (
    <>
      <SeoHead
        title={`${categoryTitle} — купить в Ташкенте | POJ PRO.`}
        description={
          (
            lang === 'en'
              ? `${categoryTitle} — buy in Tashkent | POJ PRO. Certified equipment and accessories. Delivery across Uzbekistan.`
              : lang === 'uz'
                ? `${categoryTitle} — Toshkentda xarid qiling | POJ PRO. Sertifikatlangan uskunalar va aksessuarlar. Oʻzbekiston boʻylab yetkazib berish.`
                : `${categoryTitle} — купить в Ташкенте | POJ PRO. Сертифицированное оборудование и комплектующие. Доставка по Узбекистану.`
          ).slice(0, 160)
        }
        path={`/catalog/${encodeURIComponent(rawCategory)}`}
        locale={lang}
        image={undefined}
      />
      <main className="bg-[#F8F9FA] min-h-screen">
        <section className="container-section section-y mt-[100px]">
          <Breadcrumbs
            items={[
              { name: t('common.home', 'Home'), href: '/' },
              { name: t('header.catalog', 'Catalog'), href: '/catalog' },
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
