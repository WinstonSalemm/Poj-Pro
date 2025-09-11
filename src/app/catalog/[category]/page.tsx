import { Metadata } from 'next';
import { SITE_URL, SITE_NAME } from '@/lib/site';
import { cookies } from 'next/headers';
import { getLocale, fetchAPI } from '@/lib/api';
import { getDictionary } from '@/i18n/server';
import { CATEGORY_NAMES, getCategoryMeta } from '@/constants/categories';
import { CATEGORY_NAME_OVERRIDES } from '@/constants/categoryNameOverrides';
import { CATEGORY_SEO, resolveCategoryKey } from '@/constants/categorySeo';
import { JsonLd } from '@/components/seo/JsonLd';
import { breadcrumbJsonLd, faqJsonLd, itemListJsonLd } from '@/lib/seo/jsonld';

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
export async function generateMetadata({ params, searchParams }: { params: Promise<{ category: string }>, searchParams?: Promise<Record<string, string | string[] | undefined>> }): Promise<Metadata> {
  const locale = await getLocale();
  const dict = await getDictionary(locale);
  const { category } = await params;
  const rawCategory = decodeURIComponent(category || '');
  const sp = (await (searchParams || Promise.resolve({}))) || {};

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
  const hasFilters = Object.keys(sp).length > 0;

  return {
    title,
    description,
    alternates: {
      canonical,
      languages: {
        'ru-RU': canonical,
        'uz-UZ': canonical,
        'en-US': canonical,
      },
    },
    openGraph: {
      url: canonical,
      title,
      description,
      siteName: SITE_NAME,
    },
    robots: hasFilters ? { index: false, follow: true } : { index: true, follow: true },
  };
}
import type { Product } from '@/types/product';
import CategoryProductsClient from '@/components/catalog/CategoryProductsClient';
import PreOrderBanner from '@/components/ui/PreOrderBanner';
// Removed legacy ItemListSchema in favor of JsonLd helpers
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
  const lang = (locale as 'ru' | 'en' | 'uz');
  const dict = await getDictionary(locale);

  const products = categorySlug
    ? await getCategoryProducts(categorySlug, locale)
    : [];

  const showBanner = ['siz', 'ballony'].includes(category);

  // Pull SEO intro/FAQ content for this category, if present
  const seoKey = resolveCategoryKey(categorySlug.replace(/_/g, '-'));
  const seo = seoKey ? CATEGORY_SEO[seoKey] : undefined;
  const introParagraphs = (seo?.introByLang && seo?.introByLang[lang]) || seo?.intro || [];
  const faqs = seo?.faqs || [];

  // Compute localized category display name (same logic as in generateMetadata)
  const fallbackName = (key: string): string =>
    key
      .replace(/[-_]/g, ' ')
      .replace(/\b\w/g, (c) => c.toUpperCase())
      .replace(/\s+/g, ' ')
      .trim();
  const normalizedSlug = rawCategory.replace(/_/g, '-');
  const altSlug = rawCategory.replace(/-/g, '_');
  const override =
    (CATEGORY_NAME_OVERRIDES as Record<string, Partial<Record<typeof lang, string>>>)[rawCategory] ||
    CATEGORY_NAME_OVERRIDES[normalizedSlug] ||
    CATEGORY_NAME_OVERRIDES[altSlug];
  const constName =
    (CATEGORY_NAMES as Record<string, Partial<Record<typeof lang, string>>>)[rawCategory]?.[lang] ||
    CATEGORY_NAMES[normalizedSlug]?.[lang] ||
    CATEGORY_NAMES[altSlug]?.[lang];
  // Helper to get nested translation
  function getNestedValueLocal(obj: unknown, path: string): string | undefined {
    let current: unknown = obj;
    for (const key of path.split('.')) {
      if (current && typeof current === 'object' && key in (current as Record<string, unknown>)) {
        current = (current as Record<string, unknown>)[key];
      } else {
        return undefined;
      }
    }
    return typeof current === 'string' ? current : undefined;
  }
  const dictName =
    getNestedValueLocal(dict, `categories.${rawCategory}`) ||
    getNestedValueLocal(dict, `categories.${normalizedSlug}`) ||
    getNestedValueLocal(dict, `categories.${altSlug}`);
  const categoryName = override?.[lang] || constName || dictName || fallbackName(rawCategory);

  const canonical = `${SITE_URL}/catalog/${categorySlug}`;

  // Localized H1 for all categories
  const h1Title = (() => {
    const byLang: Record<'ru' | 'en' | 'uz', string> = {
      ru: `${categoryName} в Ташкенте`,
      en: `${categoryName} in Tashkent`,
      uz: `Toshkentda ${categoryName}`,
    };
    return byLang[lang] || byLang.ru;
  })();

  // Generate a concise, localized intro if no specific one exists
  function generateIntro(l: 'ru' | 'en' | 'uz'): string[] {
    if (l === 'en') {
      return [
        `Buy ${categoryName} in Tashkent — delivery across Uzbekistan, certificates and warranty. We will help you choose the right option for your task and standards.`,
        `Request a quote and price list. Fast lead times and transparent pricing.`,
      ];
    }
    if (l === 'uz') {
      return [
        `Toshkentda ${categoryName} — Oʻzbekiston boʻylab yetkazib berish, sertifikatlar va kafolat. Vazifa va meʼyorlarga mos yechimni tanlashda yordam beramiz.`,
        `Soʻrov boʻyicha KP va price-list. Tez muddatlar va halol narxlar.`,
      ];
    }
    // ru
    return [
      `${categoryName} — купить в Ташкенте с доставкой по Узбекистану. Сертификаты и гарантия. Поможем подобрать под нормы и условия эксплуатации.`,
      `Отправим КП и прайс по запросу. Быстрые сроки и прозрачные цены.`,
    ];
  }

  // Prefer configured SEO intro, else fallback to generated intro
  const localizedIntro: string[] = (() => {
    const base = introParagraphs && introParagraphs.length ? introParagraphs : [];
    if (base.length) return base; // keep existing configured content
    return generateIntro(lang);
  })();

  return (
    <>
      {/* JSON-LD */}
      <JsonLd
        data={breadcrumbJsonLd([
          { name: 'Главная', item: `${SITE_URL}/` },
          { name: 'Каталог', item: `${SITE_URL}/catalog` },
          { name: categoryName, item: canonical },
        ])}
        type="BreadcrumbList"
        keyOverride="breadcrumb"
      />
      <JsonLd
        data={itemListJsonLd({
          name: `${categoryName} — каталог`,
          urlBase: canonical,
          items: products.slice(0, 12).map((p) => ({
            name: p.title || p.name || p.slug,
            url: `${SITE_URL}/catalog/${categorySlug}/${p.slug}`,
            image: p.image || undefined,
          })),
        })}
        type="CollectionPage"
        keyOverride="itemlist"
      />
      {faqs.length > 0 && (
        <JsonLd data={faqJsonLd(faqs)} type="FAQPage" keyOverride="faq" />
      )}

      {showBanner && <PreOrderBanner />}

      <div className="container-section section-y">
        {/* H1 */}
        <h1 className="text-2xl font-semibold text-[#660000] mb-3">{h1Title}</h1>

        {/* Intro content (SSR) */}
        {localizedIntro.length > 0 && (
          <section className="prose max-w-none mb-4 text-[#660000]">
            {localizedIntro.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </section>
        )}
      </div>

      {/* Products grid */}
      <CategoryProductsClient products={products} rawCategory={rawCategory} lang={locale} />

      {/* FAQ UI removed per request; keeping FAQ JSON-LD above for SEO */}
    </>
  );
}
