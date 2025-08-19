export type Locale = 'ru' | 'en' | 'uz';

const qs = (p: Record<string, string | number | undefined>) =>
  Object.entries(p)
    .filter(([, v]) => v !== undefined && v !== null && v !== '')
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`)
    .join('&');

// Absolute baseUrl for server components, relative for client components
const getBase = () => {
  if (typeof window !== 'undefined') return '';
  return process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3001';
};

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
  const res = await fetch(`${getBase()}/api/products?${query}`, { cache: 'no-store' });
  if (!res.ok) throw new Error(`products_fetch_failed:${res.status}`);
  return res.json();
}

export async function fetchProduct({ locale, idOrSlug }: { locale: Locale; idOrSlug: string | number }) {
  const query = qs({ locale });
  const res = await fetch(`${getBase()}/api/products/${encodeURIComponent(idOrSlug)}?${query}`, {
    method: 'GET',
    headers: { 'Accept': 'application/json' },
    cache: 'no-store',
  });
  
  if (!res.ok) {
    return { success: false, message: `HTTP ${res.status}` };
  }
  
  const data = await res.json();
  return { success: true, data };
}
