import { generateCategoryMetadata } from '@/lib/seo-utils';

describe('SEO Metadata', () => {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://poj-pro.uz';
  const testCases = [
    {
      locale: 'ru',
      category: 'ognetushiteli',
      expected: {
        title: 'Огнетушители купить в Ташкенте | POJ-PRO.UZ',
        description: 'Огнетушители по выгодным ценам с доставкой по Узбекистану. Широкий ассортимент, гарантия качества, профессиональные консультации.',
        alternates: {
          canonical: `${baseUrl}/ru/catalog/ognetushiteli`,
          languages: {
            'x-default': `${baseUrl}/ru/catalog/ognetushiteli`,
            ru: `${baseUrl}/ru/catalog/ognetushiteli`,
            uz: `${baseUrl}/uz/catalog/ognetushiteli`,
            en: `${baseUrl}/en/catalog/ognetushiteli`
          }
        },
        openGraph: {
          title: 'Огнетушители купить в Ташкенте | POJ-PRO.UZ',
          description: 'Огнетушители по выгодным ценам с доставкой по Узбекистану. Широкий ассортимент, гарантия качества, профессиональные консультации.',
          url: `${baseUrl}/ru/catalog/ognetushiteli`,
          locale: 'ru_UZ',
          siteName: 'POJ-PRO.UZ',
          type: 'website',
          images: [
            {
              url: `${baseUrl}/images/og-image.jpg`,
              width: 1200,
              height: 630,
              alt: 'POJ-PRO - Противопожарное оборудование в Узбекистане'
            }
          ]
        },
        twitter: {
          card: 'summary_large_image',
          title: 'Огнетушители купить в Ташкенте | POJ-PRO.UZ',
          description: 'Огнетушители по выгодным ценам с доставкой по Узбекистану.',
          images: [`${baseUrl}/images/og-image.jpg`]
        }
      }
    },
    {
      locale: 'uz',
      category: 'pozharnye-krany',
      expected: {
        title: 'Yong\'in qarshi kranlar Toshkent shahrida | POJ-PRO.UZ',
        description: 'O\'zbekiston bo\'ylab yetkazib berish bilan yong\'in qarshi kranlar. Keng assortiment, sifat kafolati, mutaxassis maslahatlari.',
        alternates: {
          canonical: `${baseUrl}/uz/catalog/pozharnye-krany`,
          languages: {
            'x-default': `${baseUrl}/uz/catalog/pozharnye-krany`,
            ru: `${baseUrl}/ru/catalog/pozharnye-krany`,
            uz: `${baseUrl}/uz/catalog/pozharnye-krany`,
            en: `${baseUrl}/en/catalog/pozharnye-krany`
          }
        }
      }
    },
    {
      locale: 'en',
      category: 'fire-safety',
      expected: {
        title: 'Fire Safety Equipment in Tashkent | POJ-PRO.UZ',
        description: 'Professional fire safety equipment with delivery across Uzbekistan. Wide range, quality guarantee, expert advice.',
        alternates: {
          canonical: `${baseUrl}/en/catalog/fire-safety`,
          languages: {
            'x-default': `${baseUrl}/en/catalog/fire-safety`,
            ru: `${baseUrl}/ru/catalog/fire-safety`,
            uz: `${baseUrl}/uz/catalog/fire-safety`,
            en: `${baseUrl}/en/catalog/fire-safety`
          }
        }
      }
    }
  ];

  testCases.forEach(({ locale, category, expected }) => {
    it(`generates correct metadata for ${locale} locale and ${category} category`, async () => {
      const metadata = await generateCategoryMetadata(category, locale);
      
      // Test title and description
      expect(metadata.title).toBe(expected.title);
      expect(metadata.description).toBe(expected.description);
      
      // Test canonical URL
      expect(metadata.alternates?.canonical).toBe(expected.alternates.canonical);
      
      // Test hreflang tags
      expect(metadata.alternates?.languages).toEqual(
        expect.objectContaining(expected.alternates.languages)
      );
      
      // Test OpenGraph metadata if defined in expected
      if (expected.openGraph) {
        expect(metadata.openGraph).toEqual(
          expect.objectContaining(expected.openGraph)
        );
      }
      
      // Test Twitter metadata if defined in expected
      if (expected.twitter) {
        expect(metadata.twitter).toEqual(
          expect.objectContaining(expected.twitter)
        );
      }
    });
  });

  it('handles ru locale explicitly (no implicit default)', async () => {
    const metadata = await generateCategoryMetadata('ognetushiteli', 'ru');
    expect(metadata.alternates?.languages?.ru).toContain('/ru/catalog/ognetushiteli');
  });

  it('handles special characters in category slugs', async () => {
    const metadata = await generateCategoryMetadata('special-category_123', 'ru');
    expect(metadata.alternates?.canonical).toContain('/ru/catalog/special-category_123');
  });
});
