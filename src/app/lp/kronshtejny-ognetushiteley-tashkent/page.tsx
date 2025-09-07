import type { Metadata } from 'next';
import Link from 'next/link';
import LocalBusinessJsonLd from '@/components/seo/LocalBusinessJsonLd';
import FaqJsonLd from '@/components/seo/FaqJsonLd';
import { SITE_URL } from '@/lib/site';

export const dynamic = 'force-static';

export const metadata: Metadata = {
  title: 'Кронштейны для огнетушителей в Ташкенте — настенные и авто | POJ PRO',
  description: 'Купить кронштейны для огнетушителей в Ташкенте: настенные и автомобильные крепления, таблички, пломбы. Сертификаты и доставка по Узбекистану.',
  alternates: { canonical: `${SITE_URL}/lp/kronshtejny-ognetushiteley-tashkent` },
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
          { question: 'Как подобрать кронштейн под огнетушитель?', answer: 'Ориентируйтесь на массу и диаметр баллона, а также место установки: стена или автомобиль. Подскажем совместимые модели.' },
          { question: 'Есть ли сертификаты и доставка?', answer: 'Да, предоставляем сертификаты соответствия и организуем доставку по Ташкенту и Узбекистану.' },
          { question: 'Работаете с организациями?', answer: 'Да, сформируем КП и прайс, возможны оптовые условия.' },
        ]}
      />

      <section className="text-center max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold mb-4">Кронштейны и фурнитура для огнетушителей — Ташкент</h1>
        <p className="text-lg text-gray-700 mb-6">Настенные и автомобильные крепления, таблички, пломбы, аксессуары. Поможем подобрать совместимые крепления под вашу модель огнетушителя.</p>
        <div className="flex gap-3 justify-center">
          <Link href="/catalog/furnitura_dlya_ognetushiteley" className="px-6 py-3 bg-red-600 text-white rounded font-semibold">Каталог кронштейнов</Link>
          <a href="/contacts" className="px-6 py-3 border rounded font-semibold">Запросить КП</a>
        </div>
      </section>
    </main>
  );
}
