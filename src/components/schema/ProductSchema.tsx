'use client';

import { JsonLd } from './JsonLd';

export interface ProductSchemaProps {
  name: string;
  description: string;
  image: string[];
  sku: string;
  brand: {
    name: string;
    logo?: string;
  };
  offers: {
    price: number;
    priceCurrency: 'UZS';
    priceValidUntil?: string;
    itemCondition: 'https://schema.org/NewCondition' | 'https://schema.org/UsedCondition' | 'https://schema.org/RefurbishedCondition' | 'https://schema.org/DamagedCondition';
    availability: 'https://schema.org/InStock' | 'https://schema.org/InStoreOnly' | 'https://schema.org/OutOfStock' | 'https://schema.org/PreOrder';
    url: string;
    seller: {
      name: string;
      url: string;
    };
  };
  review?: {
    ratingValue: number;
    reviewCount: number;
    bestRating?: number;
    worstRating?: number;
  };
  aggregateRating?: {
    ratingValue: number;
    reviewCount: number;
  };
  mpn?: string;
  gtin?: string;
  gtin8?: string;
  gtin13?: string;
  gtin14?: string;
  weight?: {
    value: number;
    unitText: 'kg' | 'g' | 'lb' | 'oz';
  };
}

export const ProductSchema = (product: ProductSchemaProps) => {
  const schema = {
    '@context': 'https://schema.org/',
    '@type': 'Product',
    name: product.name,
    image: product.image,
    description: product.description,
    sku: product.sku,
    ...(product.mpn && { mpn: product.mpn }),
    ...(product.gtin && { gtin: product.gtin }),
    brand: {
      '@type': 'Brand',
      name: product.brand.name,
      ...(product.brand.logo && { logo: product.brand.logo }),
    },
    offers: {
      '@type': 'Offer',
      url: product.offers.url,
      priceCurrency: product.offers.priceCurrency,
      price: product.offers.price,
      ...(product.offers.priceValidUntil && { priceValidUntil: product.offers.priceValidUntil }),
      itemCondition: product.offers.itemCondition,
      availability: product.offers.availability,
      seller: {
        '@type': 'Organization',
        name: product.offers.seller.name,
        url: product.offers.seller.url,
      },
    },
    ...(product.review && {
      review: {
        '@type': 'AggregateRating',
        ratingValue: product.review.ratingValue,
        reviewCount: product.review.reviewCount,
        bestRating: product.review.bestRating || 5,
        worstRating: product.review.worstRating || 1,
      },
    }),
    ...(product.aggregateRating && {
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: product.aggregateRating.ratingValue,
        reviewCount: product.aggregateRating.reviewCount,
      },
    }),
    ...(product.weight && {
      weight: {
        '@type': 'QuantitativeValue',
        value: product.weight.value,
        unitText: product.weight.unitText,
      },
    }),
  };

  return <JsonLd data={schema} keyOverride={`product-${product.sku}`} />;
};
