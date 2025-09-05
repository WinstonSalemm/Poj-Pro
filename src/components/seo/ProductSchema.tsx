import React from 'react';
import { JsonLd } from './JsonLd';
import { clean, mapAvailability, Availability } from './jsonld.schemas';

export interface ProductSchemaProps {
  product: {
    name: string;
    description: string;
    image: string[]; // at least 1; UI ensures square 1:1 when available
    sku?: string;
    brand?: string; // default to "POJ PRO" if missing
    category: string;
    price: number | string; // normalized number; formatting on UI separately
    priceCurrency?: 'UZS'; // fixed UZS by default
    availability?: string | Availability; // label or schema URL
    url: string; // product canonical URL
    aggregateRating?: {
      ratingValue: number;
      reviewCount: number;
    };
    review?: Array<{
      author: string;
      datePublished: string; // ISO date
      reviewBody: string;
      reviewRating: { ratingValue: number };
    }>;
  };
}

export const ProductSchema: React.FC<ProductSchemaProps> = ({ product }) => {
  const basePrice = typeof product.price === 'string' ? Number(product.price) : product.price;
  const availability: Availability = ((): Availability => {
    if (!product.availability) return 'https://schema.org/OutOfStock';
    if (
      product.availability === 'https://schema.org/InStock' ||
      product.availability === 'https://schema.org/OutOfStock' ||
      product.availability === 'https://schema.org/PreOrder'
    ) {
      return product.availability;
    }
    return mapAvailability(String(product.availability));
  })();

  const data = clean({
    '@type': 'Product',
    name: product.name,
    description: product.description,
    image: product.image,
    sku: product.sku,
    brand: { name: product.brand || 'POJ PRO' },
    category: product.category,
    offers: clean({
      '@type': 'Offer',
      price: Number.isFinite(basePrice) ? basePrice : Number(basePrice || 0),
      priceCurrency: product.priceCurrency || 'UZS',
      availability,
      url: product.url,
    }),
    aggregateRating: product.aggregateRating
      ? clean({
          '@type': 'AggregateRating',
          ratingValue: product.aggregateRating.ratingValue,
          reviewCount: product.aggregateRating.reviewCount,
        })
      : undefined,
    review: product.review?.map((r) =>
      clean({
        '@type': 'Review',
        author: r.author,
        datePublished: r.datePublished,
        reviewBody: r.reviewBody,
        reviewRating: clean({ '@type': 'Rating', ratingValue: r.reviewRating.ratingValue }),
      })
    ),
  });

  return <JsonLd data={data} type="Product" keyOverride="product" />;
};

export default ProductSchema;
