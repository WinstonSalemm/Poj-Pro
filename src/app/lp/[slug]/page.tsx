import type { Metadata } from 'next';
import Link from 'next/link';
import LocalBusinessJsonLd from '@/components/seo/LocalBusinessJsonLd';
import FaqJsonLd from '@/components/seo/FaqJsonLd';
import { getLpBySlug, getLpCanonical, LP_PAGES } from '@/constants/lp';
import { SITE_URL } from '@/lib/site';
import { notFound } from 'next/navigation';

export const dynamic = 'force-static';

export function generateStaticParams() {
  return (LP_PAGES || []).map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const lp = getLpBySlug(slug);
  if (!lp) return { title: 'Страница не найдена' };
  return {
    title: lp.title,
    description: lp.description,
    alternates: { canonical: getLpCanonical(lp.slug) },
    openGraph: {
      url: getLpCanonical(lp.slug),
      title: lp.title,
      description: lp.description,
      images: [`${SITE_URL}/OtherPics/logo.png`],
    },
  };
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const lp = getLpBySlug(slug);
  if (!lp) return notFound();

  const business = {
    name: 'OOO "Poj Pro"',
    url: SITE_URL,
    telephone: '+998 99 393 66 16',
    image: [`${SITE_URL}/OtherPics/logo.png`],
    priceRange: '$$',
    address: {
      streetAddress: 'Чиланзарский район, 1 квартал, дом 33, магазин BOLID',
      addressLocality: 'Ташкент',
      addressRegion: 'Toshkent',
      postalCode: '',
      addressCountry: 'UZ',
    },
    openingHours: ['Mo-Fr 09:00-18:00', 'Sa 10:00-15:00'],
    sameAs: [
      'https://www.instagram.com/security_system_tashkent/',
      'https://t.me/pojsystema',
    ],
  } as const;

  return (
    <main className="container mx-auto px-4 py-10">
      <LocalBusinessJsonLd {...business} />
      {lp.faq && lp.faq.length > 0 && <FaqJsonLd faqs={lp.faq} />}

      <section className="text-center max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold mb-4">{lp.h1}</h1>
        <p className="text-lg text-gray-700 mb-6">{lp.description}</p>
        <div className="flex gap-3 justify-center flex-wrap">
          {lp.catalogHref && (
            <Link href={lp.catalogHref} className="px-6 py-3 bg-red-600 text-white rounded font-semibold">Перейти в каталог</Link>
          )}
          {(lp.ctas || []).map(({ href, label }) => (
            <Link key={href} href={href} className="px-6 py-3 border rounded font-semibold">{label}</Link>
          ))}
        </div>
      </section>
    </main>
  );
}
