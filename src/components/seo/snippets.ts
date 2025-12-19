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
  '@id': `${SITE_URL}#organization`,
  name: 'POJ PRO',
  url: SITE_URL,
  logo: {
    '@type': 'ImageObject',
    url: `${SITE_URL}/OtherPics/favicon-large.webp`,
    width: 1200,
    height: 630,
  },
  image: `${SITE_URL}/OtherPics/favicon-large.webp`,
  description: 'Профессиональное пожарное оборудование и средства безопасности в Ташкенте. Огнетушители, пожарные шкафы, рукава и СИЗ.',
  address: {
    '@type': 'PostalAddress',
    streetAddress: 'ул. Уста Ширин, 105',
    addressLocality: 'Ташкент',
    addressRegion: 'Toshkent',
    postalCode: '100000',
    addressCountry: 'UZ',
  },
  telephone: '+998 99 393 66 16',
  email: 'info@poj-pro.uz',
  foundingDate: '2012',
  sameAs: [
    'https://t.me/pojsystema',
    'https://www.instagram.com/pojpro',
    'https://www.facebook.com/pojpro',
  ],
  contactPoint: {
    '@type': 'ContactPoint',
    telephone: '+998 99 393 66 16',
    contactType: 'customer service',
    availableLanguage: ['Russian', 'English', 'Uzbek'],
    areaServed: 'UZ',
  },
});

export const generateWebSite = () => ({
  '@type': 'WebSite',
  '@id': `${SITE_URL}#website`,
  name: 'POJ PRO',
  url: SITE_URL,
  description: 'Продажа огнетушителей (ОП, ОУ), пожарных шкафов, рукавов и СИЗ в Ташкенте. Доставка, обслуживание, перезарядка. Официальные сертификаты.',
  publisher: {
    '@id': `${SITE_URL}#organization`,
  },
  inLanguage: ['ru', 'en', 'uz'],
  potentialAction: {
    '@type': 'SearchAction',
    target: {
      '@type': 'EntryPoint',
      urlTemplate: `${SITE_URL}/catalog?search={search_term_string}`,
    },
    'query-input': 'required name=search_term_string',
  },
});

type MinimalProduct = {
  id: string | number;
  name: string;
  image?: string | null;
  short_description?: string | null;
  description?: string | null;
  category: string;
  price: number | string;
};

export const generateProduct = (product: MinimalProduct, categoryName: string) => ({
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
