import type { Metadata } from 'next';
import Link from 'next/link';
import LocalBusinessJsonLd from '@/components/seo/LocalBusinessJsonLd';
import FaqJsonLd from '@/components/seo/FaqJsonLd';
import { SITE_URL } from '@/lib/site';

export const dynamic = 'force-static';

export const metadata: Metadata = {
  title: 'Пожарная безопасность под ключ — проекты, монтаж, сервис | POJ PRO',
  description: 'Проектирование, поставка и монтаж средств пожарной безопасности: огнетушители, знаки, планы эвакуации, обучение. Работы под ключ.',
  alternates: { canonical: `${SITE_URL}/lp/pozharnaia-bezopasnost` },
};

export default function Page() {
  const business = {
    name: 'OOO "Poj Pro"',
    url: 'https://www.poj-pro.uz/',
    telephone: '+998 99 393 66 16',
    priceRange: '$$',
    address: {
      streetAddress: 'Чиланзарский район, 1 квартал, дом 33, магазин BOLID',
      addressLocality: 'Ташкент',
      addressRegion: 'Toshkent',
      addressCountry: 'UZ',
    },
    openingHours: ['Mo-Fr 09:00-18:00', 'Sa 10:00-15:00', 'Su 12:00-17:00'],
    sameAs: [
      'https://www.google.com/maps/place/POj+PRO+(%D0%BC%D0%B0%D0%B3%D0%B0%D0%B7%D0%B8%D0%BD+BOLID)/@41.2840709,69.2296625,18z/data=!4m6!3m5!1s0x38ae8b654ce3be15:0x764ece0d6201569b!8m2!3d41.283467!4d69.2303922!16s%2Fg%2F11xn1gh5vq?entry=ttu',
      'https://www.instagram.com/security_system_tashkent/',
      'https://t.me/pojsystema',
      'https://t.me/Pro_security_uz',
    ],
  } as const;

  return (
    <main className="container mx-auto px-4 py-10">
      <LocalBusinessJsonLd {...business} />
      <FaqJsonLd
        faqs={[
          { question: 'Делаете проектирование и монтаж?', answer: 'Да, выполняем проектирование, поставку и монтаж. Также обучение и обслуживание систем.' },
          { question: 'Предоставляете документы и сертификаты?', answer: 'Да, сертификаты доступны на сайте, выдаём сопроводительную документацию.' },
          { question: 'Работаете по Ташкенту и регионам?', answer: 'Да, работаем по всему Узбекистану. Сроки оговариваются при заказе.' },
        ]}
      />

      <section className="text-center max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold mb-4">Пожарная безопасность — поставки и доставка по Узбекистану</h1>
        <p className="text-lg text-gray-700 mb-6">Комплектация объектов противопожарным оборудованием: огнетушители, шкафы, знаки, планы эвакуации. Организуем поставку и доставку. Сертификаты доступны.</p>
        <div className="flex gap-3 justify-center">
          <Link href="#order" className="px-6 py-3 bg-red-600 text-white rounded font-semibold">Запросить КП</Link>
          <a href="https://t.me/pojpro" className="px-6 py-3 border rounded font-semibold">Консультация</a>
        </div>
      </section>

      <section id="order" className="mt-12 grid md:grid-cols-2 gap-8">
        <div>
          <h2 className="text-2xl font-semibold mb-3">Что мы предлагаем</h2>
          <ul className="list-disc pl-5 space-y-2 text-gray-700">
            <li>Поставки: огнетушители, пожарные шкафы, знаки, планы эвакуации.</li>
            <li>Организация доставки по Ташкенту и регионам Узбекистана.</li>
            <li>Сертификаты на продукцию доступны на сайте.</li>
            <li>Консультации по подбору оборудования.</li>
          </ul>
        </div>
        <div>
          <h3 className="text-xl font-semibold mb-2">Оставьте заявку</h3>
          <form className="space-y-3">
            <input className="w-full border p-3 rounded" placeholder="Имя" />
            <input className="w-full border p-3 rounded" placeholder="Телефон" />
            <textarea className="w-full border p-3 rounded" placeholder="Опишите задачу" />
            <button className="w-full bg-red-600 text-white py-3 rounded font-semibold">Получить КП</button>
          </form>
        </div>
      </section>
    </main>
  );
}
