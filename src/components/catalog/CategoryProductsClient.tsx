"use client";

import { useMemo, useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import ProductCard from "@/components/ProductCard/ProductCard";
import Breadcrumbs from "@/components/Breadcrumbs";
import { SeoHead } from "@/components/seo/SeoHead";
import type { Product } from "@/types/product";

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

  const categoryTitle = useMemo(() => {
    const dict = t("categories", { returnObjects: true, defaultValue: {} }) as
      | Record<string, string>
      | undefined;
    return dict?.[rawCategory] || fallbackName(rawCategory);
  }, [t, rawCategory]);

  const filteredProducts = useMemo(() => {
    if (!searchQuery) return products;
    const q = searchQuery.trim().toLowerCase();
    return products.filter(
      (p) =>
        (p.title || p.name || "").toLowerCase().includes(q) ||
        p.description?.toLowerCase().includes(q) ||
        p.short_description?.toLowerCase().includes(q)
    );
  }, [products, searchQuery]);

  const sortedProducts = filteredProducts;

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
        <section className="max-w-[1280px] mx-auto px-4 py-10 mt-[100px]">
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
            <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
              <div className="relative flex-grow max-w-[400px]">
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
            </div>
          </div>

          {sortedProducts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-lg text-gray-600">
                {t("catalog.noProductsFound", "No products found.")}
              </p>
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="mt-2 !text-[#660000] hover:underline"
                >
                  {t("search.clearSearch", "Clear search")}
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
        </section>
      </main>
    </>
  );
}
