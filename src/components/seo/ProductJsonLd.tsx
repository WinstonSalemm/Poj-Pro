"use client";

import React from 'react';
import { SITE_URL } from '@/lib/site';
import { JsonLd as SEOJsonLd } from '@/components/seo/JsonLd';
import type { Product as CanonicalProduct } from '@/types/product';
import { clean } from '@/components/seo/jsonld.schemas';

export interface ProductJsonLdProps {
  product: CanonicalProduct;
  categorySlug: string; // normalized slug with hyphens
}

function absUrl(pathOrUrl?: string): string | undefined {
  if (!pathOrUrl) return undefined;
  const s = String(pathOrUrl);
  if (/^https?:\/\//i.test(s)) return s;
  const withSlash = s.startsWith('/') ? s : '/' + s;
  return `${SITE_URL}${withSlash}`;
}

function primaryImage(p: CanonicalProduct): string | undefined {
  const img = (p.image && p.image) || (Array.isArray(p.images) && p.images[0]) || undefined;
  return absUrl(img);
}

export default function ProductJsonLd({ product, categorySlug }: ProductJsonLdProps) {
  const name = product.title || product.name || product.slug;
  const description = product.description || product.short_description || name;
  // Use hyphenated category path for canonical consistency
  const categoryPath = (categorySlug || '').replace(/_/g, '-');
  const url = `${SITE_URL}/catalog/${encodeURIComponent(categoryPath)}/${encodeURIComponent(product.slug)}`;
  const price = typeof product.price === 'number' ? product.price : Number(product.price) || 0;
  const availability = price > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock';

  const images: string[] = (() => {
    const p = primaryImage(product);
    return p ? [p] : [];
  })();

  const offers = price > 0
    ? {
        '@type': 'Offer',
        price,
        priceCurrency: 'UZS' as const,
        availability,
        url,
      }
    : {
        '@type': 'Offer',
        priceCurrency: 'UZS' as const,
        availability,
        url,
      };

  const data = clean({
    name,
    description,
    image: images,
    sku: String(product.id || product.slug),
    brand: { name: 'POJ PRO' },
    category: categorySlug,
    offers: clean(offers as Record<string, unknown>),
  });

  return <SEOJsonLd data={data} type="Product" keyOverride={`product-${product.id}`} />;
}
