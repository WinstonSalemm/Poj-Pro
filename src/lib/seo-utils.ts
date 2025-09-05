import { Metadata } from 'next';


export const generateCategoryMetadata = async (
  category: string,
  locale: string
): Promise<Metadata> => {
  const { t } = await import(`@/public/locales/${locale}/seo.json`);
  
  // Get category-specific metadata or fallback to default
  const categoryData = t.categories?.[category] || {};
  const siteName = t('siteName', { defaultValue: 'POJ PRO' });
  
  const title = categoryData.title || `${t(`categories.${category}`, category)} | ${siteName}`;
  const description = categoryData.description || t('defaultCategoryDescription', { category });
  const canonical = `https://poj-pro.uz/${locale === 'ru' ? '' : `${locale}/`}catalog/${category}`;

  return {
    title,
    description,
    alternates: {
      canonical,
      languages: {
        'ru': `https://poj-pro.uz/catalog/${category}`,
        'uz': `https://poj-pro.uz/uz/catalog/${category}`,
        'en': `https://poj-pro.uz/en/catalog/${category}`,
      },
    },
    openGraph: {
      title,
      description,
      url: canonical,
      siteName,
      locale,
      type: 'website',
      images: [
        {
          url: `https://poj-pro.uz/images/og-${category}.jpg`,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [`https://poj-pro.uz/images/og-${category}.jpg`],
    },
  };
};

export const generateFaqStructuredData = (faqItems: Array<{q: string, a: string}>) => {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqItems.map(item => ({
      '@type': 'Question',
      name: item.q,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.a,
      },
    })),
  };
};
