export interface SitemapItem {
  url: string;
  lastModified?: string | Date;
  changeFrequency?:
    | 'always'
    | 'hourly'
    | 'daily'
    | 'weekly'
    | 'monthly'
    | 'yearly'
    | 'never';
  priority?: number;
  alternates?: {
    languages?: Record<string, string>;
  };
}

export interface Product {
  id: string;
  slug: string;
  updatedAt: string;
  slugs?: Record<string, string>;
  category?: string;
  createdAt?: string;
}

export interface Category {
  id: string;
  slug: string;
  updatedAt: string;
  slugs?: Record<string, string>;
  createdAt?: string;
}

export type Locale = 'ru' | 'uz' | 'en';

export const LOCALES: Locale[] = ['ru', 'uz', 'en'];
export const DEFAULT_LOCALE: Locale = 'ru';
