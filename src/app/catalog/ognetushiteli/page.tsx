import type { Metadata } from 'next';
import { SITE_URL, SITE_NAME } from '@/lib/site';
import { cookies } from 'next/headers';
import { getLocale, fetchAPI } from '@/lib/api';
import { JsonLd } from '@/components/seo/JsonLd';
import { getDictionary } from '@/i18n/server';
import { breadcrumbJsonLd, faqJsonLd, itemListJsonLd } from '@/lib/seo/jsonld';
import CategoryProductsClient from '@/components/catalog/CategoryProductsClient';
import type { Product } from '@/types/product';
import { sortProductsAsc } from '@/lib/sortProducts';

const CANONICAL_PATH = '/catalog/ognetushiteli';

async function getProducts(locale: 'ru' | 'en' | 'uz') {
  const data = await fetchAPI<{ products: Array<{
    id: string | number;
    slug: string;
    title?: string;
    category?: { name?: string; slug?: string };
    image?: string;
    price?: number | string;
    description?: string;
  }> }>(`/api/categories/ognetushiteli?locale=${locale}`, { cache: 'force-cache', next: { revalidate: 60 } });
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

export async function generateMetadata({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }): Promise<Metadata> {
  const sp = await searchParams;
  const hasFilters = sp && Object.keys(sp).length > 0;

  const title = 'Огнетушители в Ташкенте — купить, цена | POJ PRO';
  const description = 'Купить огнетушители: порошковые ОП‑2/ОП‑5/ОП‑10, углекислотные ОУ‑3/ОУ‑5. Сертификация, гарантия, доставка по Ташкенту, самовывоз, оплата Payme/Click.';
  const canonical = `${SITE_URL}${CANONICAL_PATH}`;

  // Стратегия для query-фильтров: noindex,follow, чтобы избежать дублей.
  const robots = hasFilters ? { index: false, follow: true } : { index: true, follow: true };

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
    robots,
    openGraph: {
      url: canonical,
      title,
      description,
      siteName: SITE_NAME,
      type: 'website',
    },
    twitter: {
      card: 'summary',
      title,
      description,
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
  const p1 = (dict?.lp as any)?.ognetushiteli?.intro1 || P1_BY_LANG[locale] || P1_BY_LANG.ru;

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
  const p2 = (dict?.lp as any)?.ognetushiteli?.intro2 || P2_BY_LANG[locale] || P2_BY_LANG.ru;
  const linkBuy = (dict?.lp as any)?.ognetushiteli?.links?.buyLabel || LINK_BUY_BY_LANG[locale] || LINK_BUY_BY_LANG.ru;
  const linkCatalog = (dict?.lp as any)?.ognetushiteli?.links?.catalogLabel || LINK_CAT_BY_LANG[locale] || LINK_CAT_BY_LANG.ru;

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

  const TITLE_BY_LANG: Record<'ru' | 'en' | 'uz', string> = {
    ru: 'Огнетушители в Ташкенте',
    en: 'Fire extinguishers in Tashkent',
    uz: "Toshkentda o‘t o‘chirgichlar",
  };
  const h1Title = TITLE_BY_LANG[locale] || TITLE_BY_LANG.ru;

  return (
    <main className="container-section section-y">
      {/* JSON-LD */}
      <JsonLd data={breadcrumb} type="BreadcrumbList" keyOverride="breadcrumb" />
      <JsonLd data={list} type="CollectionPage" keyOverride="itemlist" />
      <JsonLd data={faq} type="FAQPage" keyOverride="faq" />

      {/* H1 */}
      <h1 className="text-2xl font-semibold text-[#660000] mb-3">{h1Title}</h1>

      {/* Intro content (SSR) */}
      <section className="prose max-w-none mb-4 text-[#660000]">
        <p>{p1}</p>
        <p>
          {p2}
          {" "}
          <a href="/catalog/ognetushiteli" className="underline hover:no-underline">{linkBuy}</a>
          {" "}
          <a href="/catalog/ognetushiteli" className="underline hover:no-underline">{linkCatalog}</a>
        </p>
      </section>

      

      {/* Products grid (CSR client for filters, but rendered in page) */}
      <CategoryProductsClient products={products} rawCategory={'ognetushiteli'} lang={locale} />

      {/* FAQ UI removed per request; FAQ JSON-LD is kept above */}
    </main>
  );
}
