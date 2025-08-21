export type Locale = 'ru' | 'en' | 'uz';
import { fetchAPI } from '@/lib/api';

const qs = (p: Record<string, string | number | undefined>) =>
  Object.entries(p)
    .filter(([, v]) => v !== undefined && v !== null && v !== '')
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`)
    .join('&');

// Build relative URLs; fetchAPI handles cache and revalidate

export async function fetchProducts(opts: {
  locale: Locale;
  category?: string;
  page?: number;
  per?: number;
}) {
  const query = qs({
    locale: opts.locale,
    category: opts.category,
    page: opts.page ?? 1,
    per: opts.per ?? 50,
  });
  return fetchAPI<{ products: unknown[] }>(`/api/products?${query}`, {
    cache: 'force-cache',
    next: { revalidate: 60 },
  });
}

export async function fetchProduct({ locale, idOrSlug }: { locale: Locale; idOrSlug: string | number }) {
  const query = qs({ locale });
  try {
    const data = await fetchAPI<unknown>(`/api/products/${encodeURIComponent(idOrSlug)}?${query}`, {
      cache: 'force-cache',
      next: { revalidate: 60 },
    });
    return { success: true, data };
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Unknown error';
    return { success: false, message: msg };
  }
}
