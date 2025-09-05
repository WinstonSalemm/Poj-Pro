import { LOCALES } from '@/lib/site';

type Locale = typeof LOCALES[number];

// Mock function to fetch products - replace with your actual API call
// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function fetchProducts(_locale: Locale) {
  // In a real app, this would be an API call to your database
  // Example: return await api.get(`/api/products?locale=${locale}`);
  return [
    { id: '1', slug: 'ognetushitel-op4', updatedAt: '2025-09-01' },
    { id: '2', slug: 'ognetushitel-ou3', updatedAt: '2025-09-01' },
  ];
}

// Mock function to fetch categories - replace with your actual API call
// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function fetchCategories(_locale: Locale) {
  // In a real app, this would be an API call to your database
  // Example: return await api.get(`/api/categories?locale=${locale}`);
  return [
    { id: '1', slug: 'ognetushiteli', updatedAt: '2025-09-01' },
    { id: '2', slug: 'pozharnye-krany', updatedAt: '2025-09-01' },
  ];
}

export async function getSitemapUrls() {
  const locales: Locale[] = [...LOCALES];
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://poj-pro.uz';
  const now = new Date().toISOString();

  // Static pages that don't change often
  const staticPages = [
    { url: '/', lastModified: now },
    { url: '/about', lastModified: now },
    { url: '/contacts', lastModified: now },
    { url: '/catalog', lastModified: now },
  ];

  // Fetch dynamic content for each locale
  const dynamicUrls = await Promise.all(
    locales.map(async (locale) => {
      const products = await fetchProducts(locale);
      const categories = await fetchCategories(locale);

      const productUrls = products.map((product) => ({
        url: `/${locale}/products/${product.slug}`,
        lastModified: product.updatedAt,
      }));

      const categoryUrls = categories.map((category) => ({
        url: `/${locale}/catalog/${category.slug}`,
        lastModified: category.updatedAt,
      }));

      return [...staticPages, ...productUrls, ...categoryUrls];
    })
  );

  // Flatten the array of arrays and add absolute URLs
  return dynamicUrls.flat().map((item) => ({
    ...item,
    url: `${baseUrl}${item.url}`,
  }));
}
