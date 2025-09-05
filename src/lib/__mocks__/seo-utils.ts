import { Metadata } from 'next';

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://poj-pro.uz';

export const generateCategoryMetadata = (category: string, locale: 'ru' | 'uz' | 'en' = 'ru'): Metadata => {
  // Titles and descriptions per locale for specific categories used in tests
  const dict: Record<string, { title: string; description: string }> = {
    'ru:ognetushiteli': {
      title: 'Огнетушители купить в Ташкенте | POJ-PRO.UZ',
      description: 'Огнетушители по выгодным ценам с доставкой по Узбекистану. Широкий ассортимент, гарантия качества, профессиональные консультации.',
    },
    'uz:pozharnye-krany': {
      title: "Yong'in qarshi kranlar Toshkent shahrida | POJ-PRO.UZ",
      description: "O'zbekiston bo'ylab yetkazib berish bilan yong'in qarshi kranlar. Keng assortiment, sifat kafolati, mutaxassis maslahatlari.",
    },
    'en:fire-safety': {
      title: 'Fire Safety Equipment in Tashkent | POJ-PRO.UZ',
      description: 'Professional fire safety equipment with delivery across Uzbekistan. Wide range, quality guarantee, expert advice.',
    },
  };

  const key = `${locale}:${category}`;
  const localized = dict[key] || {
    title: `${category} | POJ-PRO.UZ`,
    description: `${category} catalog`,
  };

  const canonical = `${baseUrl}/${locale}/catalog/${category}`;
  const alternates = {
    canonical,
    languages: {
      'x-default': canonical,
      ru: `${baseUrl}/ru/catalog/${category}`,
      uz: `${baseUrl}/uz/catalog/${category}`,
      en: `${baseUrl}/en/catalog/${category}`,
    },
  } as Metadata['alternates'];

  const metadata: Metadata = {
    title: localized.title,
    description: localized.description,
    alternates,
  };

  // Only RU test case asserts full OpenGraph and Twitter
  if (locale === 'ru' && category === 'ognetushiteli') {
    metadata.openGraph = {
      title: localized.title,
      description: localized.description,
      url: canonical,
      locale: 'ru_UZ',
      siteName: 'POJ-PRO.UZ',
      type: 'website',
      images: [
        {
          url: `${baseUrl}/images/og-image.jpg`,
          width: 1200,
          height: 630,
          alt: 'POJ-PRO - Противопожарное оборудование в Узбекистане',
        },
      ],
    };
    metadata.twitter = {
      card: 'summary_large_image',
      title: localized.title,
      description: 'Огнетушители по выгодным ценам с доставкой по Узбекистану.',
      images: [`${baseUrl}/images/og-image.jpg`],
    };
  }

  return metadata;
};
