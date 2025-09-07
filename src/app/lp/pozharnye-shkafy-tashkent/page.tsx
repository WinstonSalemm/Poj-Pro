import type { Metadata } from 'next';
import Link from 'next/link';
import LocalBusinessJsonLd from '@/components/seo/LocalBusinessJsonLd';
import FaqJsonLd from '@/components/seo/FaqJsonLd';
import { SITE_URL } from '@/lib/site';

export const dynamic = 'force-static';

export const metadata: Metadata = {
  title: 'Пожарные шкафы в Ташкенте — ШП настенные и встраиваемые | POJ PRO',
  description: 'Купить пожарные шкафы в Ташкенте: ШП для рукавов 51/66, с отсеками под ствол и кран. Сертификаты, доставка, подбор комплектации.',
  alternates: { canonical: `${SITE_URL}/lp/pozharnye-shkafy-tashkent` },
};

export default function Page() {
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
      <FaqJsonLd
        faqs={[
          { question: 'Какие шкафы выбрать — настенные или встраиваемые?', answer: 'Зависит от проекта и стен. Мы подскажем подходящие модели с учётом рукава и арматуры.' },
          { question: 'Есть ли шкафы под рукав 51/66?', answer: 'Да, доступны варианты с одним/двумя отсеками и местом под рукав, кран и ствол.' },
          { question: 'Доставка и документы?', answer: 'Да, доставляем по Ташкенту и регионам, предоставляем сертификаты.' },
        ]}
      />

      <section className="text-center max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold mb-4">Пожарные шкафы — Ташкент</h1>
        <p className="text-lg text-gray-700 mb-6">Настенные и встраиваемые ШП. Подбор по проекту, комплектация, сертификаты и оперативная доставка.</p>
        <div className="flex gap-3 justify-center">
          <Link href="/catalog/pozharnye_shkafy" className="px-6 py-3 bg-red-600 text-white rounded font-semibold">Перейти в каталог</Link>
          <a href="/contacts" className="px-6 py-3 border rounded font-semibold">Запросить КП</a>
        </div>
      </section>
    </main>
  );
}
