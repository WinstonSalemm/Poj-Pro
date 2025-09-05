import type { Metadata } from 'next';
import Link from 'next/link';
import LocalBusinessJsonLd from '@/components/seo/LocalBusinessJsonLd';
import ProductSchema from '@/components/seo/ProductSchema';
import FaqJsonLd from '@/components/seo/FaqJsonLd';
import { SITE_URL } from '@/lib/site';

export const dynamic = 'force-static';

export const metadata: Metadata = {
  title: 'Огнетушители в Ташкенте — продажа, доставка, сертификаты | POJ PRO',
  description: 'Купить огнетушители в Ташкенте: ОП-5, ОП-2, ОУ-5. Доставка по Узбекистану, сертификаты, обслуживание. Лучшие цены и гарантии от POJ PRO.',
  alternates: { canonical: `${SITE_URL}/lp/ognetushiteli-tashkent` },
};

export default function Page() {
  const business = {
    name: 'OOO "Poj Pro"',
    url: 'https://www.poj-pro.uz/',
    telephone: '+998 99 393 66 16',
    image: ['https://www.poj-pro.uz/static/logo.png'],
    priceRange: '$$',
    address: {
      streetAddress: 'Чиланзарский район, 1 квартал, дом 33, магазин BOLID',
      addressLocality: 'Ташкент',
      addressRegion: 'Toshkent',
      postalCode: '',
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
      name: 'Огнетушитель ОП‑2 (з) АВСЕ РИФ',
      description: 'Компактный порошковый огнетушитель на 2 кг — для авто, дома и офиса. –40…+50°C, перезарядка раз в 5 лет.',
      image: ['https://www.poj-pro.uz/ProductImages/Op-2.png'],
      sku: 'OP-2',
      brand: 'РИФ',
      category: 'Огнетушители',
      price: 85000,
      priceCurrency: 'UZS' as const,
      availability: 'https://schema.org/InStock',
      url: 'https://www.poj-pro.uz/catalog/ognetushiteli',
      aggregateRating: { ratingValue: 4.9, reviewCount: 57 },
    },
    {
      name: 'Огнетушитель ОП‑5 (з) АВСЕ РИФ',
      description: 'Универсальная модель на 5 кг порошка — офисы, склады, магазины. Длина струи до 3 м.',
      image: ['https://www.poj-pro.uz/ProductImages/Op-5.png'],
      sku: 'OP-5',
      brand: 'РИФ',
      category: 'Огнетушители',
      price: 115000,
      priceCurrency: 'UZS' as const,
      availability: 'https://schema.org/InStock',
      url: 'https://www.poj-pro.uz/catalog/ognetushiteli',
      aggregateRating: { ratingValue: 4.9, reviewCount: 57 },
    },
    {
      name: 'Огнетушитель ОП‑10 (з) АВСЕ РИФ',
      description: 'ОП‑10: 10 кг порошка, зона тушения до 100 м², для крупных помещений.',
      image: ['https://www.poj-pro.uz/ProductImages/Op-10.png'],
      sku: 'OP-10',
      brand: 'РИФ',
      category: 'Огнетушители',
      price: 205000,
      priceCurrency: 'UZS' as const,
      availability: 'https://schema.org/InStock',
      url: 'https://www.poj-pro.uz/catalog/ognetushiteli',
    },
    {
      name: 'Огнетушитель углекислотный ОУ‑5 (з) РИФ',
      description: 'CO₂-огнетушитель на 5 кг — чистое тушение электрооборудования, серверные, офисы.',
      image: ['https://www.poj-pro.uz/ProductImages/Oy-5.png'],
      sku: 'OY-5',
      brand: 'РИФ',
      category: 'Огнетушители',
      price: 400000,
      priceCurrency: 'UZS' as const,
      availability: 'https://schema.org/InStock',
      url: 'https://www.poj-pro.uz/catalog/ognetushiteli',
    },
  ];

  return (
    <main className="container mx-auto px-4 py-10">
      <LocalBusinessJsonLd {...business} />
      <FaqJsonLd
        faqs={[
          { question: 'Какие огнетушители подходят для офиса?', answer: 'Для офисов чаще всего используют порошковые ОП‑4/ОП‑5 и углекислотные ОУ‑3/ОУ‑5 для электрооборудования.' },
          { question: 'Доставляете по Ташкенту и регионам?', answer: 'Да, доставка по Ташкенту и Узбекистану. Сроки зависят от наличия и объёма заказа.' },
          { question: 'Есть ли сертификаты на продукцию?', answer: 'Да, сертификаты соответствия предоставляются. Раздел «Документы/Сертификаты» доступен на сайте.' },
        ]}
      />
      {products.map((p) => (
        <ProductSchema key={p.sku} product={p} />
      ))}

      <section className="text-center max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold mb-4">Огнетушители в Ташкенте — в наличии и с доставкой</h1>
        <p className="text-lg text-gray-700 mb-6">Сертифицированная продукция, прозрачные прайсы, обслуживание и перезарядка. Быстрые сроки поставки и удобная оплата.</p>
        <div className="flex gap-3 justify-center">
          <Link href="#order" className="px-6 py-3 bg-red-600 text-white rounded font-semibold">Заказать сейчас</Link>
          <a href="https://t.me/pojpro" className="px-6 py-3 border rounded font-semibold">Консультация</a>
        </div>
        <div className="mt-6 text-sm text-gray-600">Есть КП и прайс-лист. Предоставляем сертификаты соответствия и гарантию.</div>
      </section>

      <section id="order" className="mt-12 grid md:grid-cols-2 gap-8">
        <div>
          <h2 className="text-2xl font-semibold mb-3">Почему POJ PRO лучше, чем Vidcom</h2>
          <ul className="list-disc pl-5 space-y-2 text-gray-700">
            <li>Цены — без скрытых доплат. Прайс фиксируем на этапе КП.</li>
            <li>Сертификаты и паспорта — предоставляем сразу с поставкой.</li>
            <li>Сервис — перезарядка, обслуживание, обучение персонала.</li>
            <li>Сроки — в наличии, доставка по Ташкенту и Узбекистану.</li>
          </ul>
        </div>
        <div>
          <h3 className="text-xl font-semibold mb-2">Оставьте заявку</h3>
          <form className="space-y-3">
            <input className="w-full border p-3 rounded" placeholder="Имя" />
            <input className="w-full border p-3 rounded" placeholder="Телефон" />
            <input className="w-full border p-3 rounded" placeholder="Компания (опц.)" />
            <button className="w-full bg-red-600 text-white py-3 rounded font-semibold">Получить КП и прайс</button>
          </form>
        </div>
      </section>
    </main>
  );
}
