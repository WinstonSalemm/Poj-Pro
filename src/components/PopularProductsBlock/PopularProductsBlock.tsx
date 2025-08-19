"use client";

import { useMemo } from "react";
import { useTranslation } from "next-i18next";
import Link from "next/link";
import ProductCard from "@/components/ProductCard/ProductCard";
import type { Product } from "@/types/product";
import data from "@/components/PopularProductsBlock/popular.json";

type ManualItem = {
  id: string | number;
  slug: string;
  category: string;
  titles: { ru: string; en: string; uz: string };
  image?: string;
  price?: number | string;
  link?: string;
};

const normalizeLang = (lang?: string): "ru" | "en" | "uz" => {
  if (!lang) return "ru";
  const base = lang.split("-")[0].toLowerCase(); // en-US -> en
  if (base === "eng") return "en";
  if (base === "uzb") return "uz";
  if (base === "ru" || base === "en" || base === "uz") return base;
  return "ru";
};

function hasCategorySlug(p: Product | (Product & { categorySlug?: unknown })): p is Product & { categorySlug: string } {
  return typeof p === "object" && p !== null && "categorySlug" in p && typeof (p as { categorySlug?: unknown }).categorySlug === "string";
}

export default function PopularProductsBlock() {
  const { i18n } = useTranslation();
  const lang = normalizeLang(i18n?.language);

  const products = useMemo<Product[]>(() => {
    return (data as ManualItem[]).map((item) => {
      const title = item.titles[lang] ?? item.titles.ru;

      // Return strictly Product shape; extra UI-only fields are avoided to keep typing clean
      return {
        id: item.id,
        slug: item.slug,
        title,
        name: title,
        image: item.image || "/placeholder-product.jpg",
        price: typeof item.price === "string" ? Number(item.price) || 0 : item.price ?? 0,
        category: item.category,
      } as Product;
    });
  }, [lang]);

  const buildHref = (p: Product): string => {
    // Build URL exactly like ProductCard, but with strict type guards
    const categoryPart = hasCategorySlug(p)
      ? p.categorySlug
      : typeof p.category === "object"
        ? p.category?.slug
        : typeof p.category === "string"
          ? p.category
          : undefined;
    return categoryPart
      ? `/catalog/${encodeURIComponent(String(categoryPart))}/${encodeURIComponent(String(p.slug))}`
      : `/catalog/${encodeURIComponent(String(p.slug))}`;
  };

  return (
    <section className="py-12 bg-gray-50">
      <div className="max-w-[1200px] mx-auto px-4">
        <h2 className="text-3xl font-bold text-center text-[#660000] mb-8">
          {lang === "ru"
            ? "Популярные товары"
            : lang === "uz"
              ? "Ommabop mahsulotlar"
              : "Popular Products"}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((p) => (
            <div
              key={p.id}
            >
              <ProductCard product={p} showDetailsLink={false} popularVariant />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
