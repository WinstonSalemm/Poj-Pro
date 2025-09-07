import type { Metadata } from 'next';
import Link from 'next/link';
import LocalBusinessJsonLd from '@/components/seo/LocalBusinessJsonLd';
import FaqJsonLd from '@/components/seo/FaqJsonLd';
import { SITE_URL } from '@/lib/site';

export const dynamic = 'force-static';

export const metadata: Metadata = {
  title: 'Пожарные рукава в Ташкенте — продажа, доставка, сертификаты | POJ PRO',
  description: 'Купить пожарные рукава в Ташкенте: РПМ(В), напорные, диаметр 51/66/77. Муфты, стволы, арматура. Доставка по Узбекистану, сертификаты и гарантия.',
  alternates: { canonical: `${SITE_URL}/lp/pozharnye-rukava-tashkent` },
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
          { question: 'Какие рукава выбрать для внутреннего пожарного крана?', answer: 'Для ПК применяются напорные рукава диаметром 51/66 мм с головками ГР и рабочим давлением не ниже нормативов. Мы поможем подобрать совместимую арматуру.' },
          { question: 'Есть ли сертификаты?', answer: 'Да, предоставляем сертификаты соответствия. Возможна поставка комплектов: рукав + ствол + головки + шкаф.' },
          { question: 'Доставка по Ташкенту?', answer: 'Да, оперативная доставка по Ташкенту и Узбекистану. В наличии типоразмеры 51/66/77 и комплектующие.' },
        ]}
      />

      <section className="text-center max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold mb-4">Пожарные рукава в Ташкенте — в наличии и под заказ</h1>
        <p className="text-lg text-gray-700 mb-6">Муфты, стволы, переходники, пожарные шкафы. Сертификаты, гарантия, прозрачные цены. Скомплектуем под ваш объект и нормы.</p>
        <div className="flex gap-3 justify-center">
          <Link href="/catalog/rukava_i_pozharnaya_armatura" className="px-6 py-3 bg-red-600 text-white rounded font-semibold">Перейти в каталог</Link>
          <a href="/contacts" className="px-6 py-3 border rounded font-semibold">Запросить КП</a>
        </div>
      </section>
    </main>
  );
}
