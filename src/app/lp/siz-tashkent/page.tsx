import type { Metadata } from 'next';
import Link from 'next/link';
import LocalBusinessJsonLd from '@/components/seo/LocalBusinessJsonLd';
import ProductSchema from '@/components/seo/ProductSchema';

export const dynamic = 'force-static';

export const metadata: Metadata = {
  title: 'СИЗ в Ташкенте — каски, перчатки, знаки безопасности | POJ PRO',
  description: 'Средства индивидуальной защиты (СИЗ) и знаки безопасности. В наличии, доставка по Узбекистану. Сертификаты и гарантия.',
  alternates: { canonical: '/lp/siz-tashkent' },
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

  const products = [
    {
      name: 'Каска защитная (стандарт)',
      description: 'Лёгкая каска из ПЭ, регулировка размера. Для строительных и промышленных объектов.',
      image: ['https://www.poj-pro.uz/ProductImages/siz-helmet.png'],
      sku: 'SIZ-HELMET-STD',
      brand: 'POJ PRO',
      category: 'СИЗ',
      price: 65000,
      priceCurrency: 'UZS' as const,
      availability: 'https://schema.org/InStock',
      url: 'https://www.poj-pro.uz/catalog/siz',
      aggregateRating: { ratingValue: 4.8, reviewCount: 41 },
    },
    {
      name: 'Перчатки защитные (нитрил)',
      description: 'Перчатки с нитриловым покрытием для работ с повышенным износом и сцеплением.',
      image: ['https://www.poj-pro.uz/ProductImages/siz-gloves.png'],
      sku: 'SIZ-GLOVES-NITRILE',
      brand: 'POJ PRO',
      category: 'СИЗ',
      price: 18000,
      priceCurrency: 'UZS' as const,
      availability: 'https://schema.org/InStock',
      url: 'https://www.poj-pro.uz/catalog/siz',
    },
    {
      name: 'Очки защитные (антифог)',
      description: 'Прозрачные очки с покрытием антифог/антискретч. Совместимы с респираторами.',
      image: ['https://www.poj-pro.uz/ProductImages/siz-glasses.png'],
      sku: 'SIZ-GLASSES-CLR',
      brand: 'POJ PRO',
      category: 'СИЗ',
      price: 38000,
      priceCurrency: 'UZS' as const,
      availability: 'https://schema.org/InStock',
      url: 'https://www.poj-pro.uz/catalog/siz',
    },
    {
      name: 'Респиратор фильтрующий FFP2',
      description: 'Полумаска фильтрующая FFP2, защита от пыли и аэрозолей. Комфортные ушные петли.',
      image: ['https://www.poj-pro.uz/ProductImages/siz-respirator-ffp2.png'],
      sku: 'SIZ-RESP-FFP2',
      brand: 'POJ PRO',
      category: 'СИЗ',
      price: 12000,
      priceCurrency: 'UZS' as const,
      availability: 'https://schema.org/InStock',
      url: 'https://www.poj-pro.uz/catalog/siz',
    },
  ];

  return (
    <main className="container mx-auto px-4 py-10">
      <LocalBusinessJsonLd {...business} />
      {products.map((p) => (
        <ProductSchema key={p.sku} product={p} />
      ))}

      <section className="text-center max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold mb-4">СИЗ и знаки безопасности в Ташкенте</h1>
        <p className="text-lg text-gray-700 mb-6">Комплексные поставки: каски, перчатки, очки, жилеты, знаки. Сертификаты, быстрые сроки и честные цены.</p>
        <div className="flex gap-3 justify-center">
          <Link href="#order" className="px-6 py-3 bg-red-600 text-white rounded font-semibold">Получить прайс</Link>
          <a href="https://t.me/pojpro" className="px-6 py-3 border rounded font-semibold">Задать вопрос</a>
        </div>
      </section>

      <section id="order" className="mt-12 grid md:grid-cols-2 gap-8">
        <div>
          <h2 className="text-2xl font-semibold mb-3">Наши преимущества</h2>
          <ul className="list-disc pl-5 space-y-2 text-gray-700">
            <li>Широкий ассортимент — подберём СИЗ под задачи.</li>
            <li>Сертификаты — соответствие стандартам РУз.</li>
            <li>Доставка — Ташкент и регионы, аккуратно и быстро.</li>
            <li>Поддержка — консультации и послепродажный сервис.</li>
          </ul>
        </div>
        <div>
          <h3 className="text-xl font-semibold mb-2">Оставьте заявку</h3>
          <form className="space-y-3">
            <input className="w-full border p-3 rounded" placeholder="Имя" />
            <input className="w-full border p-3 rounded" placeholder="Телефон" />
            <textarea className="w-full border p-3 rounded" placeholder="Какие позиции интересуют?" />
            <button className="w-full bg-red-600 text-white py-3 rounded font-semibold">Запросить КП</button>
          </form>
        </div>
      </section>
    </main>
  );
}
