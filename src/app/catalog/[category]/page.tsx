import { Metadata } from 'next';
import { SITE_URL } from '@/lib/site';
import { cookies } from 'next/headers';
import { getLocale, fetchAPI } from '@/lib/api';
import { getDictionary } from '@/i18n/server';
import { CATEGORY_NAMES, getCategoryMeta } from '@/constants/categories';
import { CATEGORY_NAME_OVERRIDES } from '@/constants/categoryNameOverrides';

// Helper to safely access nested properties without requiring index signature
function getNestedValue(obj: unknown, path: string): string | undefined {
  let current: unknown = obj;
  for (const key of path.split('.')) {
    if (current && typeof current === 'object' && key in current) {
      current = (current as Record<string, unknown>)[key];
    } else {
      return undefined;
    }
  }
  return typeof current === 'string' ? current : undefined;
}

// SEO Metadata
export async function generateMetadata({ params }: { params: Promise<{ category: string }> }): Promise<Metadata> {
  const locale = await getLocale();
  const dict = await getDictionary(locale);
  const { category } = await params;
  const rawCategory = decodeURIComponent(category || '');

  function fallbackName(key: string): string {
    return key
      .replace(/[-_]/g, ' ')
      .replace(/\b\w/g, (c) => c.toUpperCase())
      .replace(/\s+/g, ' ')
      .trim();
  }

  const normalizedSlug = rawCategory.replace(/_/g, '-');
  const altSlug = rawCategory.replace(/-/g, '_');
  const lang = locale as 'ru' | 'en' | 'uz';

  const override =
    (CATEGORY_NAME_OVERRIDES as Record<string, Partial<Record<typeof lang, string>>>)[rawCategory] ||
    CATEGORY_NAME_OVERRIDES[normalizedSlug] ||
    CATEGORY_NAME_OVERRIDES[altSlug];
  const constName =
    (CATEGORY_NAMES as Record<string, Partial<Record<typeof lang, string>>>)[rawCategory]?.[lang] ||
    CATEGORY_NAMES[normalizedSlug]?.[lang] ||
    CATEGORY_NAMES[altSlug]?.[lang];
  const dictName =
    getNestedValue(dict, `categories.${rawCategory}`) ||
    getNestedValue(dict, `categories.${normalizedSlug}`) ||
    getNestedValue(dict, `categories.${altSlug}`);

  const categoryName = override?.[lang] || constName || dictName || fallbackName(rawCategory);

  // Prefer predefined meta for specific categories
  const meta = getCategoryMeta(normalizedSlug, lang);
  const fromDictTitle = getNestedValue(dict, 'catalog.meta.title')?.replace('{{category}}', categoryName).replace('{{city}}', 'в Ташкенте');
  const fromDictDesc = getNestedValue(dict, 'catalog.meta.description')?.replace('{{category}}', categoryName).replace('{{city}}', 'Ташкенту');

  const title = meta.title || fromDictTitle || `${categoryName} - Купить в Ташкенте | POJ-PRO.UZ`;
  const description = meta.description || fromDictDesc || `Купить ${categoryName} и другое оборудование для пожарной безопасности. Доставка по Ташкенту.`;
  const canonical = `${SITE_URL}/catalog/${normalizedSlug}`;

  return {
    title,
    description,
    alternates: {
      canonical,
    },
    openGraph: {
      url: canonical,
      title,
      description,
    },
  };
}
import type { Product } from '@/types/product';
import CategoryProductsClient from '@/components/catalog/CategoryProductsClient';
import PreOrderBanner from '@/components/ui/PreOrderBanner';
import ItemListSchema from '@/components/seo/ItemListSchema';
import { sortProductsAsc } from '@/lib/sortProducts';

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
  const data = await fetchAPI<{ products: Array<{
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
  // Apply domain-specific ordering: OP → OU → MPP → recharge → others
  return sortProductsAsc(formatted);
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

  const showBanner = ['siz', 'ballony'].includes(category);

  return (
    <>
      <ItemListSchema
        items={products.map((p, idx) => ({
          name: p.title || p.name || p.slug,
          url: `/catalog/${categorySlug}/${p.slug}`,
          position: idx + 1,
          image: p.image || undefined,
        }))}
      />
      {showBanner && <PreOrderBanner />}
      <CategoryProductsClient products={products} rawCategory={rawCategory} lang={locale} />
    </>
  );
}
