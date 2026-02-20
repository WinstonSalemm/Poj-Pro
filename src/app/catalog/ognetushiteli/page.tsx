import type { Metadata } from 'next';
import { SITE_URL, SITE_NAME } from '@/lib/site';
import { CATEGORY_IMAGE_MAP } from '@/constants/categories';
import { cookies } from 'next/headers';
import { getLocale, fetchAPI } from '@/lib/api';
import { JsonLd } from '@/components/seo/JsonLd';
import Link from 'next/link';
import { getDictionary } from '@/i18n/server';
import { breadcrumbJsonLd, faqJsonLd, itemListJsonLd } from '@/lib/seo/jsonld';
import CategoryProductsClient from '@/components/catalog/CategoryProductsClient';
import type { Product } from '@/types/product';
import { sortProductsAsc } from '@/lib/sortProducts';
import { buildCategoryLongContent } from '@/lib/categoryLongContent';

const CANONICAL_PATH = '/catalog/ognetushiteli';

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

// Safe nested string getter (avoids any-casts)
function getNestedString(obj: unknown, path: string): string | undefined {
  let cur: unknown = obj;
  for (const key of path.split('.')) {
    if (cur && typeof cur === 'object' && key in (cur as Record<string, unknown>)) {
      cur = (cur as Record<string, unknown>)[key];
    } else {
      return undefined;
    }
  }
  return typeof cur === 'string' ? cur : undefined;
}

export async function generateMetadata({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }): Promise<Metadata> {
  const sp = await searchParams;
  const filterKeys = Object.keys(sp || {}).filter((k) => sp[k] != null);

  const title = 'Огнетушители в Ташкенте — купить, цена | POJ PRO';
  const description = 'Купить огнетушители: порошковые ОП‑2/ОП‑5/ОП‑10, углекислотные ОУ‑3/ОУ‑5. Сертификация, гарантия, доставка по Ташкенту, самовывоз, оплата Payme/Click.';
  const canonical = `${SITE_URL}${CANONICAL_PATH}`;

  // Стратегия для query-фильтров: noindex,follow при множественных фильтрах, иначе индексируем
  const robots = filterKeys.length > 1 ? { index: false, follow: true } : { index: true, follow: true };

  const ogImageFile = CATEGORY_IMAGE_MAP['fire-extinguishers'];
  const ogImage = ogImageFile ? `${SITE_URL}/CatalogImage/${ogImageFile}` : undefined;

  // Generate proper hreflang URLs
  const basePath = CANONICAL_PATH;
  const hreflangUrls = {
    'ru': `${SITE_URL}${basePath}`,
    'en': `${SITE_URL}/en${basePath}`,
    'uz': `${SITE_URL}/uz${basePath}`,
    'x-default': `${SITE_URL}${basePath}`,
  };

  const keywords = 'огнетушители, огнетушители ОП, огнетушители ОУ, порошковые огнетушители, углекислотные огнетушители, купить огнетушитель, Ташкент, POJ PRO, пожарная безопасность';

  return {
    title,
    description,
    keywords,
    alternates: {
      canonical,
      languages: hreflangUrls,
    },
    robots: filterKeys.length > 1
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
        alt: 'Огнетушители в Ташкенте',
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

export const revalidate = 60;

export default async function FireExtinguishersCategoryPage() {
  await cookies();
  const locale = await getLocale();
  const dict = await getDictionary(locale);
  const products = await getProducts(locale);

  const canonical = `${SITE_URL}${CANONICAL_PATH}`;

  const faqs = [
    { question: 'Какие огнетушители выбрать для офиса?', answer: 'Чаще всего — ОП‑4/ОП‑5 и ОУ‑3/ОУ‑5 для электрооборудования. Поможем подобрать под нормы и задачи.' },
    { question: 'Есть ли доставка по Ташкенту?', answer: 'Да, доставляем по Ташкенту и всей Республике Узбекистан. Возможен самовывоз.' },
    { question: 'Предоставляете сертификаты и гарантию?', answer: 'Да, сертификация и гарантия предоставляются. По запросу вышлем КП и прайс.' },
    { question: 'Есть ли перезарядка и обслуживание?', answer: 'Да, организуем перезарядку и сервисное обслуживание огнетушителей.' },
  ];

  const P1_BY_LANG: Record<'ru' | 'en' | 'uz', string> = {
    ru: 'Ищете, где купить огнетушители в Ташкенте? В POJ PRO вы найдёте популярные модели: порошковые ОП‑2/ОП‑5/ОП‑10 и углекислотные ОУ‑3/ОУ‑5. Поможем подобрать решение для офиса, магазина, склада и авто.',
    en: 'Looking to buy fire extinguishers in Tashkent? At POJ PRO you will find popular models: powder OP‑2/OP‑5/OP‑10 and CO₂ OU‑3/OU‑5. We will help you choose a solution for office, retail, warehouse and car.',
    uz: "Toshkentda o‘t o‘chirgichlar kerakmi? POJ PRO’da mashhur modellardan topasiz: kukunli OP‑2/OP‑5/OP‑10 va CO₂ OU‑3/OU‑5. Ofis, do‘kon, ombor va avtomobil uchun mos yechimni tanlashda yordam beramiz.",
  };
  const p1 = getNestedString(dict, 'lp.ognetushiteli.intro1') || P1_BY_LANG[locale] || P1_BY_LANG.ru;

  const P2_BY_LANG: Record<'ru' | 'en' | 'uz', string> = {
    ru: 'Сертификаты и гарантия. КП и прайс по запросу. Доставка по Ташкенту и всей Республике Узбекистан, есть самовывоз. Оплата — Payme/Click.',
    en: 'Certificates and warranty. Quote and price list upon request. Delivery across Tashkent and all over Uzbekistan, pickup available. Payment — Payme/Click.',
    uz: "Sertifikatlar va kafolat. KP va narxlar roʻyxati soʻrov boʻyicha. Toshkent va butun Oʻzbekiston boʻylab yetkazib berish, olib ketish mavjud. Toʻlov — Payme/Click.",
  };
  const LINK_BUY_BY_LANG: Record<'ru' | 'en' | 'uz', string> = {
    ru: 'огнетушители ташкент купить',
    en: 'buy fire extinguishers Tashkent',
    uz: "o‘t o‘chirgichlar toshkent sotib olish",
  };
  const LINK_CAT_BY_LANG: Record<'ru' | 'en' | 'uz', string> = {
    ru: 'каталог огнетушителей',
    en: 'fire extinguishers catalog',
    uz: "o‘t o‘chirgichlar katalogi",
  };
  const p2 = getNestedString(dict, 'lp.ognetushiteli.intro2') || P2_BY_LANG[locale] || P2_BY_LANG.ru;
  const linkBuy = getNestedString(dict, 'lp.ognetushiteli.links.buyLabel') || LINK_BUY_BY_LANG[locale] || LINK_BUY_BY_LANG.ru;
  const linkCatalog = getNestedString(dict, 'lp.ognetushiteli.links.catalogLabel') || LINK_CAT_BY_LANG[locale] || LINK_CAT_BY_LANG.ru;

  const breadcrumb = breadcrumbJsonLd([
    { name: 'Главная', item: `${SITE_URL}/` },
    { name: 'Каталог', item: `${SITE_URL}/catalog` },
    { name: 'Огнетушители', item: canonical },
  ]);

  const list = itemListJsonLd({
    name: 'Огнетушители — каталог',
    urlBase: canonical,
    items: products.slice(0, 12).map((p) => ({
      name: p.title || p.name || p.slug,
      url: `${SITE_URL}/catalog/ognetushiteli/${p.slug}`,
      image: p.image || undefined,
    })),
  });

  const faq = faqJsonLd(faqs);
  // Localized H1 and consistent long description via centralized builder
  const TITLE_BY_LANG: Record<'ru' | 'en' | 'uz', string> = {
    ru: 'Огнетушители в Ташкенте',
    en: 'Fire extinguishers in Tashkent',
    uz: 'Toshkentda o‘t o‘chirgichlar',
  };
  const NAME_BY_LANG: Record<'ru' | 'en' | 'uz', string> = {
    ru: 'Огнетушители',
    en: 'Fire extinguishers',
    uz: 'O‘t o‘chirgichlar',
  };
  const h1Title = TITLE_BY_LANG[locale] || TITLE_BY_LANG.ru;
  const longContentHTML = buildCategoryLongContent({
    lang: locale,
    categoryKey: 'fire-extinguishers',
    categoryName: NAME_BY_LANG[locale] || NAME_BY_LANG.ru,
  });

  return (
    <main className="container-section section-y">
      {/* JSON-LD */}
      <JsonLd data={breadcrumb} type="BreadcrumbList" keyOverride="breadcrumb" />
      <JsonLd data={list} type="CollectionPage" keyOverride="itemlist" />
      <JsonLd data={faq} type="FAQPage" keyOverride="faq" />

      {/* H1 */}
      <h1 className="text-2xl font-semibold text-[#660000] mb-3">{h1Title}</h1>

      {(() => {
        const text = (p1 || '').toString();
        const plain = text.replace(/<[^>]+>/g, '');
        const short = plain.length > 200 ? plain.slice(0, 200).trim() + '…' : plain;
        const moreLabel: Record<'ru' | 'en' | 'uz', string> = {
          ru: 'Подробнее',
          en: 'Read more',
          uz: 'Batafsil',
        };
        if (!short) return null;
        return (
          <div className="mb-4">
            <div className="rounded-xl border border-neutral-200 bg-white p-3 md:p-4 flex items-start justify-between gap-3">
              <p className="m-0 text-[15px] text-[#660000] leading-snug">
                {short}
                <span className="block text-xs text-gray-600 mt-1">
                  {locale === 'en'
                    ? 'POJ PRO: supplier — we sell and consult, no installation. Turnkey delivery on prepayment. Free in Tashkent from 5,000,000 UZS.'
                    : locale === 'uz'
                      ? "POJ PRO: ta’minotchi — sotamiz va maslahat beramiz, montaj qilmaymiz. Oldindan to‘lov bilan yetkazib berish. Toshkent bo‘yicha 5 000 000 so‘mdan bepul."
                      : 'POJ PRO: поставщик — продаём и консультируем, без монтажа. Доставка под ключ по предоплате. По Ташкенту бесплатно от 5 000 000 сум.'}
                </span>
              </p>
              <a href="#category-description" className="shrink-0 btn-ghost whitespace-nowrap">{moreLabel[locale]}</a>
            </div>
          </div>
        );
      })()}

      {/* Products grid (CSR client for filters, but rendered in page) */}
      <CategoryProductsClient 
        products={products} 
        rawCategory={'ognetushiteli'} 
        lang={locale}
        categoryName={NAME_BY_LANG[locale] || NAME_BY_LANG.ru}
      />

      {/* Collapsible SEO/intro content below grid */}
      {(() => {
        const summaryLabel: Record<'ru' | 'en' | 'uz', string> = {
          ru: 'Описание категории',
          en: 'Category description',
          uz: 'Kategoriya tavsifi',
        };
        return (
          <section id="category-description" className="mt-4">
            <details open className="group rounded-2xl border border-neutral-200 bg-white p-4 md:p-6">
              <summary className="cursor-pointer list-none text-lg font-semibold text-[#660000] flex items-center justify-between">
                <span>{summaryLabel[locale]}</span>
                <span className="transition-transform group-open:rotate-180">▾</span>
              </summary>
              <div className="mt-3 prose max-w-none text-[#660000]">
                <p>{p1}</p>
                <p>
                  {p2}
                  {' '}
                  <Link href="/catalog/ognetushiteli" className="underline hover:no-underline">{linkBuy}</Link>
                  {' '}
                  <Link href="/catalog/ognetushiteli" className="underline hover:no-underline">{linkCatalog}</Link>
                </p>
                {longContentHTML && (
                  <div className="mt-3" dangerouslySetInnerHTML={{ __html: longContentHTML }} />
                )}
              </div>
            </details>
          </section>
        );
      })()}

      {/* FAQ UI removed per request; FAQ JSON-LD is kept above */}
    </main>
  );
}
