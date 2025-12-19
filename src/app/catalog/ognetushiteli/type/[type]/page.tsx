import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { SITE_URL, SITE_NAME } from '@/lib/site';
import { CATEGORY_IMAGE_MAP } from '@/constants/categories';
import { cookies } from 'next/headers';
import { getLocale, fetchAPI } from '@/lib/api';
import { JsonLd } from '@/components/seo/JsonLd';
import { breadcrumbJsonLd, itemListJsonLd } from '@/lib/seo/jsonld';
import CategoryProductsClient from '@/components/catalog/CategoryProductsClient';
import type { Product } from '@/types/product';
import { sortProductsAsc } from '@/lib/sortProducts';

export const revalidate = 60;

const CANONICAL_BASE = '/catalog/ognetushiteli';
const VALID_TYPES = ['op', 'ou', 'mpp', 'recharge'] as const;

type TypeKey = typeof VALID_TYPES[number];

function isValidType(t: string | undefined): t is TypeKey {
  return !!t && (VALID_TYPES as readonly string[]).includes(t);
}

async function getProducts(locale: 'ru' | 'en' | 'uz') {
  const data = await fetchAPI<{
    products: Array<{
      id: string | number;
      slug: string;
      title?: string;
      category?: { name?: string; slug?: string };
      image?: string;
      price?: number | string;
      description?: string;
    }>
  }>(`/api/categories/ognetushiteli?locale=${locale}`, { cache: 'force-cache', next: { revalidate: 60 } });
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
  return sortProductsAsc(formatted);
}

function filterByType(products: Product[], type: TypeKey): Product[] {
  return products.filter((p) => {
    const text = `${p.slug} ${p.title || ''} ${p.name || ''} ${p.description || ''}`.toLowerCase();
    if (type === 'op') return /(\bop[-_\s]?|\bоп[-_\s]?)/i.test(text) || /\bpowder|порошков/i.test(text);
    if (type === 'ou') return /(\bou[-_\s]?|\bоу[-_\s]?)/i.test(text) || /co2|углекислот/i.test(text);
    if (type === 'mpp') return /\bmpp|мпп|module|модул/i.test(text);
    if (type === 'recharge') return /(перезаряд|перезаряж|заправк)/i.test(text) || /(recharg|refill)/i.test(text) || /(qayta\s*zaryad|to['’`]?ldir)/i.test(text);
    return true;
  });
}

export async function generateMetadata({ params, searchParams }: { params: Promise<{ type?: string }>, searchParams: Promise<Record<string, string | string[] | undefined>> }): Promise<Metadata> {
  const { type } = await params;
  if (!isValidType(type)) {
    const canonicalBase = `${SITE_URL}${CANONICAL_BASE}`;
    const title = 'Огнетушители — тип не найден | POJ PRO';
    const description = 'Страница фильтра по типу не найдена.';
    return {
      title,
      description,
      alternates: { canonical: canonicalBase },
      robots: { index: false, follow: true },
      openGraph: { url: canonicalBase, title, description, siteName: SITE_NAME, type: 'website' },
    };
  }

  const sp = await searchParams;
  const extraFilterKeys = Object.keys(sp || {}).filter((k) => k !== 'type' && sp[k] != null);

  const titleMap: Record<TypeKey, string> = {
    op: 'Огнетушители ОП — порошковые',
    ou: 'Огнетушители ОУ — углекислотные',
    mpp: 'МПП — модульные огнетушители',
    recharge: 'Перезарядка огнетушителей',
  };
  const title = `${titleMap[type]} | POJ PRO`;
  const description = 'Выбор по типу: ОП (порошковые), ОУ (углекислотные), МПП (модульные). Сертификация, доставка по Узбекистану, консультации.';
  const canonical = `${SITE_URL}${CANONICAL_BASE}/type/${type}`;

  const ogImageFile = CATEGORY_IMAGE_MAP['fire-extinguishers'];
  const ogImage = ogImageFile ? `${SITE_URL}/CatalogImage/${ogImageFile}` : undefined;

  // Generate proper hreflang URLs
  const basePath = `${CANONICAL_BASE}/type/${type}`;
  const hreflangUrls = {
    'ru': `${SITE_URL}${basePath}`,
    'en': `${SITE_URL}/en${basePath}`,
    'uz': `${SITE_URL}/uz${basePath}`,
    'x-default': `${SITE_URL}${basePath}`,
  };

  const keywords = [
    titleMap[type],
    'огнетушители',
    'купить в Ташкенте',
    'POJ PRO',
    'пожарная безопасность',
  ].filter(Boolean).join(', ');

  return {
    title,
    description,
    keywords,
    alternates: {
      canonical,
      languages: hreflangUrls,
    },
    robots: extraFilterKeys.length > 0
      ? { index: false, follow: true }
      : {
        index: true,
        follow: true,
        googleBot: {
          index: true,
          follow: true,
          'max-video-preview': -1,
          'max-image-preview': 'large',
          'max-snippet': -1,
        },
      },
    openGraph: {
      url: canonical,
      title,
      description,
      siteName: SITE_NAME,
      type: 'website',
      locale: 'ru_RU',
      images: ogImage ? [{
        url: ogImage,
        width: 1200,
        height: 630,
        alt: titleMap[type],
      }] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: ogImage ? [ogImage] : undefined,
    },
  };
}

export default async function CategoryTypePage({ params }: { params: Promise<{ type?: string }> }) {
  await cookies();
  const locale = (await getLocale());
  const { type } = await params;
  if (!isValidType(type)) return notFound();

  const products = await getProducts(locale);
  const filtered = filterByType(products, type).slice(0, 48);

  const canonicalBase = `${SITE_URL}${CANONICAL_BASE}`;
  const breadcrumb = breadcrumbJsonLd([
    { name: 'Главная', item: `${SITE_URL}/` },
    { name: 'Каталог', item: `${SITE_URL}/catalog` },
    { name: 'Огнетушители', item: canonicalBase },
  ]);

  const list = itemListJsonLd({
    name: `Огнетушители — ${type.toUpperCase()}`,
    urlBase: `${canonicalBase}/type/${type}`,
    items: filtered.slice(0, 12).map((p) => ({
      name: p.title || p.name || p.slug,
      url: `${canonicalBase}/${p.slug}`,
      image: p.image || undefined,
    })),
  });

  const H1_MAP: Record<TypeKey, string> = {
    op: 'Огнетушители — ОП (порошковые)',
    ou: 'Огнетушители — ОУ (углекислотные)',
    mpp: 'Огнетушители — МПП (модульные)',
    recharge: 'Перезарядка огнетушителей',
  };

  return (
    <main className="container-section section-y">
      {/* JSON-LD */}
      <JsonLd data={breadcrumb} type="BreadcrumbList" keyOverride="breadcrumb" />
      <JsonLd data={list} type="CollectionPage" keyOverride="itemlist" />

      <h1 className="text-2xl font-semibold text-[#660000] mb-3">{H1_MAP[type]}</h1>

      <CategoryProductsClient products={products} rawCategory={'ognetushiteli'} lang={locale} initialFilters={{ type }} />
    </main>
  );
}
