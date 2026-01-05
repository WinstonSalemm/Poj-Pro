// src/app/catalog/[category]/[id]/page.tsx
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getLocale } from "@/lib/api";
import { getDictionary } from "@/i18n/server";
import T from "@/components/i18n/T";
import Price from "@/components/product/Price";
import QuantityAddToCart from "@/components/Cart/QuantityAddToCart";
import ProductSpecs from "@/components/product/ProductSpecs";
import type { Metadata } from 'next';
import { SITE_URL } from '@/lib/site';
import Breadcrumbs from "@/components/Breadcrumbs";
import ProductSchema from "@/components/seo/ProductSchema";
import { BreadcrumbJsonLd } from "@/components/seo/BreadcrumbJsonLd";
import ProductViewTracker from '@/components/analytics/ProductViewTracker';
import PreOrderBanner from '@/components/ui/PreOrderBanner';
import { CATEGORY_NAMES } from "@/constants/categories";
import { CATEGORY_NAME_OVERRIDES, type Lang } from "@/constants/categoryNameOverrides";

export const revalidate = 60;

// Normalize image URLs to prevent 404s and ensure correct prefixes.
const PLACEHOLDER_IMG = '/OtherPics/product2photo.jpg';
const BLUR_DATA =
  "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0nMTAwJyBoZWlnaHQ9JzEwMCcgeG1sbnM9J2h0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnJz48cmVjdCB3aWR0aD0nMTAwJScgaGVpZ2h0PScxMDAlJyBmaWxsPScjZWVlZWVlJy8+PC9zdmc+";
function normalizeImageUrl(u?: string): string {
  if (!u) return PLACEHOLDER_IMG;
  let s = String(u).trim();
  if (!s) return PLACEHOLDER_IMG;
  // keep external/data/blob URLs as-is
  if (/^(https?:|data:|blob:)/i.test(s)) return s;
  // strip leading ./ and public/ prefixes
  s = s.replace(/^\.\/+/, '');
  s = s.replace(/^public[\\/]/i, '');
  // if it's a bare filename without any slashes, prefix ProductImages
  if (!/[\\/]/.test(s)) s = `ProductImages/${s}`;
  if (!s.startsWith('/')) s = '/' + s;
  return s;
}

export async function generateMetadata({ params }: { params: Promise<{ id: string; category: string }> }): Promise<Metadata> {
  const locale = await getLocale();
  const { id, category } = await params;

  // Нормализуем локаль для запроса к базе данных (en -> eng, uz -> uzb)
  const dbLocale = locale === 'en' ? 'eng' : locale === 'uz' ? 'uzb' : 'ru';

  const dbProduct = await prisma.product.findUnique({
    where: { slug: id },
    include: { 
      i18n: { 
        where: { locale: { in: [dbLocale, 'ru', 'eng', 'uzb'] } }, 
        select: { locale: true, title: true, summary: true },
      } 
    },
  });

  if (!dbProduct) return { title: 'Товар не найден' };

  // Находим перевод для текущей локали с правильным fallback
  let i18n = dbProduct.i18n.find(t => t.locale === dbLocale);
  if (!i18n) {
    // Если нет перевода для текущей локали, используем русский как основной fallback
    i18n = dbProduct.i18n.find(t => t.locale === 'ru');
  }
  if (!i18n) {
    // Если нет русского, пробуем остальные
    i18n = dbProduct.i18n.find(t => t.locale === 'eng') 
      || dbProduct.i18n.find(t => t.locale === 'uzb')
      || dbProduct.i18n[0] // Последний fallback - любой доступный перевод
      || null;
  }
  const title = i18n?.title || dbProduct.slug;
  const description = (i18n?.summary || `Купить ${title} в Ташкенте по выгодной цене.`).slice(0, 160);

  let mainImage: string | undefined;
  if (typeof dbProduct.images === 'string' && dbProduct.images.trim()) {
    try {
      const parsed = JSON.parse(dbProduct.images);
      if (Array.isArray(parsed) && parsed.length > 0) mainImage = normalizeImageUrl(parsed[0]);
    } catch { mainImage = dbProduct.images; }
  }

  const safeCategory = String(category || '').trim();
  const canonical = `${SITE_URL}/catalog/${safeCategory}/${dbProduct.slug}`.replace(/\/+/g, '/');

  // Generate proper hreflang URLs
  const basePath = `/catalog/${safeCategory}/${dbProduct.slug}`;
  const hreflangUrls = {
    'ru': `${SITE_URL}${basePath}`,
    'en': `${SITE_URL}/en${basePath}`,
    'uz': `${SITE_URL}/uz${basePath}`,
    'x-default': `${SITE_URL}${basePath}`,
  };

  // Generate keywords from product data
  const keywords = [
    title,
    safeCategory,
    'купить в Ташкенте',
    'пожарная безопасность',
    dbProduct.brand || '',
    'POJ PRO',
  ].filter(Boolean).join(', ');

  return {
    title: `${title} - купить в Ташкенте | POJ-PRO.UZ`,
    description,
    keywords,
    alternates: {
      canonical,
      languages: hreflangUrls,
    },
    robots: {
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
      title: `${title} | POJ-PRO.UZ`,
      description,
      type: 'website',
      siteName: 'POJ PRO',
      images: mainImage ? [{
        url: normalizeImageUrl(mainImage),
        width: 1200,
        height: 630,
        alt: title,
      }] : [],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${title} | POJ-PRO.UZ`,
      description,
      images: mainImage ? [normalizeImageUrl(mainImage)] : [],
    },
  };
}

export default async function ProductPage({ params }: { params: Promise<{ id: string, category: string }> }) {
  const { id, category } = await params;
  const locale = await getLocale();
  const dict = await getDictionary(locale);

  // Нормализуем локаль для запроса к базе данных (en -> eng, uz -> uzb)
  // Важно: в БД используются коды 'ru', 'eng', 'uzb', а в Next.js 'ru', 'en', 'uz'
  const dbLocale = locale === 'en' ? 'eng' : locale === 'uz' ? 'uzb' : 'ru';

  const dbProduct = await prisma.product.findUnique({
    where: { slug: id },
    include: {
      category: { select: { id: true, name: true, slug: true } },
      // Получаем все доступные переводы для всех языков
      // Важно: получаем все переводы, чтобы иметь возможность fallback
      i18n: { 
        where: { locale: { in: ['ru', 'eng', 'uzb'] } }, 
        select: { locale: true, title: true, summary: true, description: true },
      },
    },
  });

  if (!dbProduct) notFound();

  let images: string[] = [];
  if (typeof dbProduct.images === "string" && dbProduct.images.trim()) {
    try {
      const parsed = JSON.parse(dbProduct.images);
      images = Array.isArray(parsed) ? parsed.filter(Boolean) : [dbProduct.images];
    } catch { images = [dbProduct.images]; }
  }
  const normalizedImages = images.map((u) => normalizeImageUrl(u));
  const mainImage = normalizedImages[0] || PLACEHOLDER_IMG;

  // Helpers for localized category name
  const normalizeLang = (input?: string): Lang => {
    const s = String(input || '').toLowerCase();
    if (s.startsWith('ru')) return 'ru';
    if (s.startsWith('uz')) return 'uz';
    return 'en';
  };
  const lang: Lang = normalizeLang(locale);
  const fallbackName = (key: string): string =>
    key
      .replace(/[_-]+/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .replace(/\b\w/g, (c) => c.toUpperCase());

  const categorySlug = (dbProduct.category?.slug || category || '').trim();
  const normalizedSlug = categorySlug.replace(/_/g, '-');
  const altSlug = categorySlug.replace(/-/g, '_');

  const dictCategories = (dict as unknown as Record<string, unknown>)?.["categories"] as
    | Record<string, string>
    | undefined;

  const override =
    (CATEGORY_NAME_OVERRIDES as Record<string, Partial<Record<Lang, string>>>)[categorySlug] ||
    CATEGORY_NAME_OVERRIDES[normalizedSlug] ||
    CATEGORY_NAME_OVERRIDES[altSlug];
  const constName =
    (CATEGORY_NAMES as Record<string, Partial<Record<Lang, string>>>)[categorySlug]?.[lang] ||
    CATEGORY_NAMES[normalizedSlug]?.[lang] ||
    CATEGORY_NAMES[altSlug]?.[lang];
  const dictName = dictCategories?.[categorySlug] || dictCategories?.[normalizedSlug] || dictCategories?.[altSlug];

  const categoryLabel =
    (override?.[lang] || constName || dictName || dbProduct.category?.name || fallbackName(categorySlug));

  const normalizeForTranslation = (input: string | null | undefined | unknown): string => {
    // Преобразуем input в строку, если это не строка
    const str = typeof input === 'string' ? input : (input != null ? String(input) : '');
    const s = str.trim().toLowerCase();
    const translationMap: Record<string, string> = {
      'вес': 'weight', 'цвет': 'color', 'производитель': 'manufacturer', 'тип': 'type',
      'объем': 'volume', 'материал': 'material', 'длина': 'length', 'ширина': 'width',
      'высота': 'height', 'гарантия': 'warranty', 'применение': 'application',
      'длина струи': 'jet_length', 'срок службы': 'service_life', 'перезарядка': 'recharge',
      'масса заряда': 'charge_mass', 'классы пожара': 'fire_classes',
      'рабочее давление': 'working_pressure', 'продолжительность подачи': 'supply_duration',
      'порошковый (закачной)': 'powder_pumped', 'автомобиль, офис, жильё': 'car_office_home',
      'риф (тула)': 'rif_tula',
    };
    return translationMap[s] || s.replace(/[\s(),]/g, '_');
  };

  // Helper to safely access nested i18n keys without relying on index signatures
  function getNestedValue(obj: Record<string, unknown>, path: string): string | undefined {
    let current: unknown = obj;
    for (const k of path.split('.')) {
      if (current && typeof current === 'object' && k in current) {
        current = (current as Record<string, unknown>)[k];
      } else {
        return undefined;
      }
    }
    return typeof current === 'string' ? current : undefined;
  }

  const t = (key: string, defaultValue: string): string => {
    return getNestedValue(dict as unknown as Record<string, unknown>, key) ?? defaultValue;
  };

  // Нормализуем локаль для specs (в базе: ru, eng, uzb; в Next.js: ru, en, uz)
  const specsLocale = locale === 'en' ? 'eng' : locale === 'uz' ? 'uzb' : 'ru';

  // Обработка характеристик с улучшенным fallback
  const specsEntries: [string, string][] = dbProduct.specs && typeof dbProduct.specs === 'object'
    ? (Object.entries(dbProduct.specs as Record<string, unknown>)
      .filter(([key, value]) => {
        // Фильтруем только валидные записи
        if (!key || key.trim() === '') return false;
        if (value === null || value === undefined) return false;
        // Если значение объект, проверяем что в нем есть хотя бы одно значение
        if (typeof value === 'object' && !Array.isArray(value)) {
          const obj = value as Record<string, unknown>;
          return Object.keys(obj).length > 0 && Object.values(obj).some(v => v != null && String(v).trim() !== '');
        }
        // Если значение строка, проверяем что она не пустая
        if (typeof value === 'string') {
          return value.trim() !== '';
        }
        return true;
      })
      .map(([key, value]) => {
        // Извлекаем значение для текущего языка из объекта переводов
        let specValue = '';
        if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
          const valueObj = value as Record<string, unknown>;
          // Пробуем получить значение для текущего языка, затем для ru как fallback, затем для других
          specValue = String(
            valueObj[specsLocale] 
            || valueObj['ru'] 
            || valueObj['eng'] 
            || valueObj['uzb']
            || valueObj['en']
            || valueObj['uz']
            || Object.values(valueObj).find(v => v != null && String(v).trim() !== '') 
            || ''
          );
        } else {
          // Если значение не объект, используем как есть
          specValue = String(value || '');
        }

        // Нормализуем ключ и значение для перевода
        const normalizedKey = normalizeForTranslation(key);
        const normalizedValue = normalizeForTranslation(specValue);
        
        // Пробуем получить перевод, если нет - используем оригинальное значение
        const translatedKey = t(`productSpecs.${normalizedKey}`, key);
        const translatedValue = t(`productSpecValues.${normalizedValue}`, specValue);

        return [translatedKey, translatedValue] as [string, string];
      })
      .filter(([key, value]) => key.trim() !== '' && value.trim() !== '') as [string, string][]) // Убираем пустые значения
    : [];

  const priceNumber = dbProduct.price != null ? Number(dbProduct.price) : null;
  
  // Отладочная информация (только в development)
  if (process.env.NODE_ENV === 'development') {
    console.log('[ProductPage] Locale:', locale, 'dbLocale:', dbLocale);
    console.log('[ProductPage] Available i18n:', dbProduct.i18n.map(t => ({ 
      locale: t.locale, 
      title: t.title?.substring(0, 50) || '(empty)',
      hasTitle: !!t.title?.trim(), 
      hasSummary: !!t.summary?.trim(),
      hasDescription: !!t.description?.trim()
    })));
    console.log('[ProductPage] Looking for locale:', dbLocale);
    console.log('[ProductPage] Found match:', dbProduct.i18n.find(t => t.locale === dbLocale) ? 'YES' : 'NO');
  }
  
  // Находим перевод для текущей локали с правильным fallback
  // Важно: dbLocale уже нормализован (uz -> uzb, en -> eng)
  
  // Функция для проверки, что перевод имеет хотя бы одно заполненное поле
  const hasContent = (t: { title: string | null; summary: string | null; description: string | null }) => {
    return !!(t.title?.trim() || t.summary?.trim() || t.description?.trim());
  };
  
  // Сначала ищем перевод для текущей локали (даже если он частично заполнен)
  let i18n = dbProduct.i18n.find(t => t.locale === dbLocale);
  
  // Если нашли перевод для текущей локали, но он пустой, все равно используем его
  // (лучше показать пустое, чем fallback на другой язык)
  if (i18n && !hasContent(i18n)) {
    // Если перевод полностью пустой, делаем fallback
    if (dbLocale !== 'ru') {
      i18n = dbProduct.i18n.find(t => t.locale === 'ru' && hasContent(t));
    }
  }
  
  // Если нет перевода для текущей локали, используем русский как основной fallback
  if (!i18n && dbLocale !== 'ru') {
    i18n = dbProduct.i18n.find(t => t.locale === 'ru' && hasContent(t));
  }
  
  // Если нет русского с контентом, пробуем любой русский (даже пустой)
  if (!i18n && dbLocale !== 'ru') {
    i18n = dbProduct.i18n.find(t => t.locale === 'ru');
  }
  
  // Если нет русского, пробуем остальные доступные переводы с контентом
  if (!i18n) {
    i18n = dbProduct.i18n.find(t => (t.locale === 'eng' || t.locale === 'uzb') && hasContent(t))
      || dbProduct.i18n.find(t => t.locale === 'eng' || t.locale === 'uzb')
      || dbProduct.i18n[0]; // Последний fallback - любой доступный перевод
  }
  
  if (process.env.NODE_ENV === 'development') {
    console.log('[ProductPage] Selected i18n:', i18n ? { 
      locale: i18n.locale, 
      hasTitle: !!i18n.title?.trim(),
      hasSummary: !!i18n.summary?.trim(),
      hasDescription: !!i18n.description?.trim()
    } : 'null');
  }
  
  const title = i18n?.title || dbProduct.slug;
  const summary = i18n?.summary || null;
  const description = i18n?.description || null;
  const sitePath = `/catalog/${dbProduct.category?.slug || category}/${dbProduct.slug}`;
  const showBanner = ['siz', 'ballony'].includes(category);

  return (
    <>
      {showBanner && <PreOrderBanner />}
      <ProductViewTracker id={dbProduct.id} name={title} price={priceNumber ?? undefined} currency="UZS" />
      <ProductSchema product={{ name: title, description: (summary || description || "").toString(), image: images, sku: dbProduct.slug, brand: undefined, category: categoryLabel || "", price: priceNumber ?? 0, priceCurrency: "UZS", availability: priceNumber ? "https://schema.org/InStock" : "https://schema.org/OutOfStock", url: sitePath }} />
      <BreadcrumbJsonLd categoryName={categoryLabel || undefined} />
      <main className="bg-[#F8F9FA] min-h-screen">
        <section className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
          <Breadcrumbs items={[{ name: t('common.catalog', 'Catalog'), href: "/catalog" }, ...(categorySlug ? [{ name: categoryLabel, href: `/catalog/${categorySlug}` }] : []), { name: title }]} />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm">
              <div className="relative w-full aspect-[4/3] lg:aspect-square max-h-[60vh]">
                <Image
                  src={mainImage}
                  alt={title}
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  priority
                  className="object-contain"
                  placeholder="blur"
                  blurDataURL={BLUR_DATA}
                />
              </div>
              <div className="mt-4 flex flex-col sm:flex-row gap-4">
                <QuantityAddToCart productId={dbProduct.id} className="flex-1" />
                <Link href={`/catalog/${dbProduct.category?.slug || category}`} className="flex-1 border border-gray-300 rounded-md py-2 px-4 flex items-center justify-center text-sm font-medium !text-[#660000] bg-white hover:bg-gray-50">
                  <T k="common.backToCatalog" />
                </Link>
              </div>
            </div>
            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
              <h1 className="text-2xl md:text-3xl font-bold text-[#660000] mb-4">{title}</h1>
              {summary && <p className="text-gray-700 text-lg mb-6">{summary}</p>}
              <div className="mt-6 mb-8">
                <div className="text-3xl font-bold text-[#660000]">
                  <Price price={priceNumber} />
                </div>
              </div>
              <div className="space-y-6">
                {description && (
                  <div>
                    <h2 className="text-lg !text-[#660000] font-semibold mb-2"><T k="productDetail.description" /></h2>
                    <div className="prose max-w-none text-gray-700">{description}</div>
                  </div>
                )}
                {!!specsEntries.length && (
                  <div>
                    <h2 className="text-lg font-semibold !text-[#660000] mb-3"><T k="productDetail.characteristics" /></h2>
                    <ProductSpecs specs={specsEntries} />
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
        {/* Related products */}
        {categorySlug && (
          <section className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
            <RelatedProducts locale={locale} categorySlug={categorySlug} currentSlug={dbProduct.slug} />
          </section>
        )}
      </main>
    </>
  );
}

// Server component to render related products
async function RelatedProducts({ locale, categorySlug, currentSlug }: { locale: string; categorySlug: string; currentSlug: string }) {
  const items = await prisma.product.findMany({
    where: {
      isActive: true,
      slug: { not: currentSlug },
      category: { slug: categorySlug },
    },
    select: {
      slug: true,
      images: true,
      category: { select: { slug: true } },
      i18n: { where: { locale }, select: { title: true } },
    },
    take: 4,
    orderBy: { updatedAt: 'desc' },
  });

  if (!items.length) return null;

  const norm = (u?: string) => normalizeImageUrl(u);

  return (
    <div>
      <h2 className="text-xl font-semibold !text-[#660000] mb-4"><T k="productDetail.related" defaultValue="Похожие товары" /></h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {items.map((p) => {
          let first: string | undefined;
          if (typeof p.images === 'string' && p.images.trim()) {
            try {
              const arr = JSON.parse(p.images);
              if (Array.isArray(arr) && arr.length) first = arr[0];
            } catch { first = p.images; }
          }
          const img = norm(first) || PLACEHOLDER_IMG;
          const title = p.i18n?.[0]?.title || p.slug;
          const href = `/catalog/${p.category?.slug || categorySlug}/${p.slug}`;
          return (
            <Link key={p.slug} href={href} className="block group border rounded-xl overflow-hidden bg-white">
              <div className="relative aspect-square bg-gray-100">
                <Image src={img} alt={title} fill sizes="(max-width: 768px) 50vw, 25vw" className="object-contain transition-transform duration-300 group-hover:scale-105" />
              </div>
              <div className="p-2 text-sm text-[#660000] line-clamp-2">{title}</div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
