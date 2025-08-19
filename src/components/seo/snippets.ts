import { SITE_URL } from '@/lib/site';

type BreadcrumbItem = {
  name: string;
  path: string;
};

export const generateBreadcrumbList = (items: BreadcrumbItem[]) => ({
  '@type': 'BreadcrumbList',
  itemListElement: items.map((item, index) => ({
    '@type': 'ListItem',
    position: index + 1,
    name: item.name,
    item: `${SITE_URL}${item.path}`,
  })),
});

export const generateOrganization = () => ({
  '@type': 'Organization',
  name: 'POJ PRO',
  url: SITE_URL,
  logo: `${SITE_URL}/images/logo.png`,
  sameAs: [
    'https://t.me/pojpro',
    'https://www.instagram.com/pojpro',
    'https://www.facebook.com/pojpro',
  ],
  contactPoint: {
    '@type': 'ContactPoint',
    telephone: '+998901234567',
    contactType: 'customer service',
    availableLanguage: ['Russian', 'English', 'Uzbek'],
  },
});

export const generateWebSite = () => ({
  '@type': 'WebSite',
  name: 'POJ PRO',
  url: SITE_URL,
  potentialAction: {
    '@type': 'SearchAction',
    target: `${SITE_URL}/search?q={search_term_string}`,
    'query-input': 'required name=search_term_string',
  },
});

export const generateProduct = (product: any, categoryName: string) => ({
  '@type': 'Product',
  name: product.name,
  image: product.image ? [`${SITE_URL}${product.image}`] : [],
  description: product.short_description || product.description || '',
  sku: product.id,
  mpn: product.id,
  brand: {
    '@type': 'Brand',
    name: 'POJ PRO',
  },
  category: categoryName,
  offers: {
    '@type': 'Offer',
    url: `${SITE_URL}/catalog/${product.category}/${product.id}`,
    priceCurrency: 'UZS',
    price: product.price,
    priceValidUntil: new Date(
      new Date().setFullYear(new Date().getFullYear() + 1)
    ).toISOString().split('T')[0],
    availability: 'https://schema.org/InStock',
    itemCondition: 'https://schema.org/NewCondition',
  },
});

export const generateCategoryPage = (categoryName: string) => ({
  '@type': 'CollectionPage',
  name: `${categoryName} | POJ PRO`,
  description: `Купить ${categoryName.toLowerCase()} в Ташкенте. Официальный дилер, гарантия качества, доставка по Узбекистану.`,
  url: `${SITE_URL}/catalog/${encodeURIComponent(
    categoryName.toLowerCase().replace(/\s+/g, '-')
  )}`,
});
