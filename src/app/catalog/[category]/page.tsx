import { cookies } from 'next/headers';
import { getLocale, safeJson } from '@/lib/api';
import type { Product } from '@/types/product';
import CategoryProductsClient from '@/components/catalog/CategoryProductsClient';

export const revalidate = 60;

function toSlug(s: string) {
  const tr: Record<string, string> = {
    а: 'a', б: 'b', в: 'v', г: 'g', д: 'd', е: 'e', ё: 'e', ж: 'zh', з: 'z', и: 'i', й: 'i',
    к: 'k', л: 'l', м: 'm', н: 'n', о: 'o', п: 'p', р: 'r', с: 's', т: 't', у: 'u', ф: 'f',
    х: 'h', ц: 'c', ч: 'ch', ш: 'sh', щ: 'sch', ы: 'y', э: 'e', ю: 'yu', я: 'ya',
  };
  return s
    .toLowerCase()
    .replace(/[ъь]/g, '')
    .split('')
    .map((ch) => tr[ch] ?? ch)
    .join('')
    .replace(/[\s\-–—]+/g, '_')
    .replace(/[^a-z0-9_]/g, '')
    .replace(/_+/g, '_')
    .replace(/^_+|_+$/g, '');
}

async function getCategoryProducts(categorySlug: string, locale: 'ru' | 'en' | 'uz') {
  const url = `/api/categories/${encodeURIComponent(categorySlug)}?locale=${locale}`;
  const data = await safeJson<{ products: Array<{
    id: string | number;
    slug: string;
    title?: string;
    category?: { name?: string; slug?: string };
    image?: string;
    price?: number | string;
    description?: string;
  }> }>(url, { cache: 'force-cache', next: { revalidate: 60 } });
  const items = data.products || [];
  const formatted: Product[] = items.map((item) => ({
    id: item.id,
    slug: item.slug,
    title: item.title,
    name: item.title,
    category: item.category?.name || item.category?.slug || '',
    image: item.image || '',
    price: typeof item.price === 'number' ? item.price : Number(item.price) || 0,
    description: item.description,
    short_description: item.description,
  }));
  return formatted;
}

export default async function CatalogCategoryPage({ params }: { params: Promise<{ category: string }> }) {
  // Ensure cookies are accessed to bind locale correctly in server context
  await cookies();
  const { category } = await params;
  const rawCategory = decodeURIComponent(category || '');
  const categorySlug = toSlug(rawCategory);
  const locale = await getLocale();

  const products = categorySlug
    ? await getCategoryProducts(categorySlug, locale)
    : [];

  return (
    <CategoryProductsClient products={products} rawCategory={rawCategory} lang={locale} />
  );
}
