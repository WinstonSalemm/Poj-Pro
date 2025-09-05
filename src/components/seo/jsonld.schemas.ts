// TypeScript types and minimal runtime guards for JSON-LD structures

export type Availability =
  | 'https://schema.org/InStock'
  | 'https://schema.org/OutOfStock'
  | 'https://schema.org/PreOrder';

export interface Offer {
  '@type'?: 'Offer';
  price: number | string;
  priceCurrency?: 'UZS';
  availability: Availability;
  url: string;
}

export interface AggregateRating {
  '@type'?: 'AggregateRating';
  ratingValue: number;
  reviewCount: number;
}

export interface ReviewRating {
  '@type'?: 'Rating';
  ratingValue: number;
}

export interface Review {
  '@type'?: 'Review';
  author: string;
  datePublished: string;
  reviewBody: string;
  reviewRating: ReviewRating;
}

export interface ProductJsonLd {
  '@type'?: 'Product';
  name: string;
  description: string;
  image: string[];
  sku?: string;
  brand: { name: string } | string;
  category: string;
  offers: Offer;
  aggregateRating?: AggregateRating;
  review?: Review[];
}

export interface ItemListElement {
  '@type'?: 'ListItem';
  position: number;
  name: string;
  url: string;
  image?: string;
}

export interface ItemListJsonLd {
  '@type'?: 'ItemList';
  itemListElement: ItemListElement[];
}

export function mapAvailability(label?: string): Availability {
  const normalized = (label || '').toLowerCase();
  if (['в наличии', 'есть', 'instock', 'in stock', 'available'].some((k) => normalized.includes(k))) return 'https://schema.org/InStock';
  if (['под заказ', 'предзаказ', 'preorder', 'pre-order'].some((k) => normalized.includes(k))) return 'https://schema.org/PreOrder';
  return 'https://schema.org/OutOfStock';
}

// Runtime guard helpers to ensure no null/undefined props leak into JSON-LD
export function clean<T extends Record<string, unknown>>(obj: T): T {
  const out: Record<string, unknown> = {};
  Object.entries(obj).forEach(([k, v]) => {
    if (v === null || v === undefined) return;
    if (Array.isArray(v)) {
      const arr = v
        .filter((x) => x !== null && x !== undefined)
        .map((x) => (typeof x === 'object' ? clean(x as Record<string, unknown>) : x));
      if (arr.length > 0) out[k] = arr;
    } else if (typeof v === 'object') {
      const nested = clean(v as Record<string, unknown>);
      if (Object.keys(nested).length > 0) out[k] = nested;
    } else {
      out[k] = v;
    }
  });
  return out as T;
}
