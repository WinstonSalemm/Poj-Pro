"use client";

import { useMemo, useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import ProductCard from "@/components/ProductCard/ProductCard";
import ProductGrid from "@/components/ProductList/ProductGrid";
import cls from './CategoryProductsClient.module.css';
import Breadcrumbs from "@/components/Breadcrumbs/Breadcrumbs";
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
      <main className={cls.page}>
        <section className={`container ${cls.section}`}>
          <Breadcrumbs
            items={[
              { label: t('common.home', 'Home'), href: '/' },
              { label: t('header.catalog', 'Catalog'), href: '/catalog' },
              { label: categoryTitle, href: `/catalog/${encodeURIComponent(rawCategory)}` },
            ]}
          />

          <div className={cls.headerRow}>
            <h1 className={cls.title}>{categoryTitle}</h1>
            <div className={cls.searchWrap}>
              <div className={cls.searchInner}>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={handleSearchChange}
                  placeholder={t("search.placeholder", "Search products...")}
                  className={cls.searchInput}
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className={cls.searchClear}
                    aria-label="Clear search"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>
          </div>

          {sortedProducts.length === 0 ? (
            <div className={cls.empty}>
              <p className={cls.emptyText}>
                {t("catalog.noProductsFound", "No products found.")}
              </p>
              {searchQuery && (
                <button onClick={() => setSearchQuery("")} className={cls.emptyClear}>
                  {t("search.clearSearch", "Clear search")}
                </button>
              )}
            </div>
          ) : (
            <ProductGrid>
              {sortedProducts.map((product) => (
                <ProductCard key={`${product.id}-${lang}`} product={product} />
              ))}
            </ProductGrid>
          )}
        </section>
      </main>
    </>
  );
}
