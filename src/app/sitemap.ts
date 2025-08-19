import { MetadataRoute } from 'next';
import { SITE_URL, LOCALES } from '@/lib/site';
import { getAllProducts } from '@/lib/api/products';
import { CATEGORIES } from '@/constants/categories';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = SITE_URL;
  const routes = ['', '/about-us', '/news', '/contacts', '/cart'];

  // Static pages
  const staticPages = routes.flatMap((route) =>
    LOCALES.map((locale) => ({
      url: `${baseUrl}${locale === 'ru' ? '' : `/${locale}`}${route || ''}`,
      lastModified: new Date().toISOString(),
      changeFrequency: 'weekly' as const,
      priority: route === '' ? 1 : 0.8,
      alternates: {
        languages: LOCALES.reduce((acc, lang) => ({
          ...acc,
          [lang]: `${baseUrl}${lang === 'ru' ? '' : `/${lang}`}${route || ''}`,
        }), {}),
      },
    }))
  );

  // Category pages
  const categoryPages = CATEGORIES.flatMap((category) =>
    LOCALES.map((locale) => ({
      url: `${baseUrl}${locale === 'ru' ? '' : `/${locale}`}/catalog/${category}`,
      lastModified: new Date().toISOString(),
      changeFrequency: 'daily' as const,
      priority: 0.7,
      alternates: {
        languages: LOCALES.reduce((acc, lang) => ({
          ...acc,
          [lang]: `${baseUrl}${lang === 'ru' ? '' : `/${lang}`}/catalog/${category}`,
        }), {}),
      },
    }))
  );

  // Product pages
  const products = await getAllProducts();
  const productPages = products.flatMap((product) =>
    LOCALES.map((locale) => ({
      url: `${baseUrl}${locale === 'ru' ? '' : `/${locale}`}/catalog/${product.category}/${product.id}`,
      lastModified: new Date().toISOString(),
      changeFrequency: 'weekly' as const,
      priority: 0.6,
      alternates: {
        languages: LOCALES.reduce((acc, lang) => ({
          ...acc,
          [lang]: `${baseUrl}${lang === 'ru' ? '' : `/${lang}`}/catalog/${product.category}/${product.id}`,
        }), {}),
      },
    }))
  );

  return [...staticPages, ...categoryPages, ...productPages];
}
