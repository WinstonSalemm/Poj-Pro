import { generateCategoryMetadata } from '@/lib/seo-utils';

describe('SEO metadata', () => {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://poj-pro.uz';

  it.each(['ru', 'uz', 'en'] as const)(
    'uses the single public catalog URL for the %s UI locale',
    async (locale) => {
      const metadata = await generateCategoryMetadata('ognetushiteli', locale);

      expect(metadata.alternates?.canonical).toBe(`${baseUrl}/catalog/ognetushiteli`);
      expect(metadata.alternates?.languages).toBeUndefined();
    }
  );

  it('keeps special characters in the canonical path', async () => {
    const metadata = await generateCategoryMetadata('special-category_123', 'ru');

    expect(metadata.alternates?.canonical).toContain('/catalog/special-category_123');
  });
});
