import { SEOSection } from '@/i18n/seo.types';
import { generateSEOContentMetadata } from './seo';

/**
 * Gets the SEO section key for a given category slug
 */
export function getCategorySection(slug: string): SEOSection | null {
  if (!slug) return null;
  
  const categoryMap: Record<string, SEOSection> = {
    'ognetushiteli': 'categories.ognetushiteli',
    'siz': 'categories.siz',
    'pozharnaya-bezopasnost': 'categories.pozharnaiaBezopasnost',
  };

  return categoryMap[slug] || null;
}

/**
 * Gets the canonical URL for a given section and locale
 */
export function getCanonicalUrl(section: SEOSection, locale: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://poj-pro.uz';
  const path = section === 'homepage' ? '/' : `/${section.replace(/\./g, '/')}`;
  return `${baseUrl}${locale === 'ru' ? '' : `/${locale}`}${path}`;
}

/**
 * Helper to generate metadata for SEO content pages
 */
export async function getSEOMetadata(
  section: SEOSection,
  locale: string,
  options: {
    title?: string;
    description?: string;
    image?: string;
    type?: 'website' | 'article' | 'profile';
  } = {}
) {
  return generateSEOContentMetadata({
    section,
    locale,
    ...options,
  });
}

/**
 * Gets the FAQ section key for a given section
 */
export function getFAQSection(section: SEOSection): SEOSection | null {
  if (!section) return 'faq';
  if (section === 'homepage') return 'faq';
  
  const categoryFAQMap: Record<string, SEOSection> = {
    'categories.ognetushiteli': 'categories.ognetushiteli.faq',
    'categories.siz': 'categories.siz.faq',
    'categories.pozharnaiaBezopasnost': 'categories.pozharnaiaBezopasnost.faq',
  };

  return categoryFAQMap[section] || 'faq';
}
