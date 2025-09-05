import { Metadata } from 'next';
import { Product } from './api/products';
import { SEOSection } from '@/i18n/seo.types';

// Site configuration
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://poj-pro.uz';

type MetadataType = 'website' | 'article' | 'profile';

interface GenerateMetadataParams {
  title: string;
  description: string;
  path: string;
  locale: string;
  type?: MetadataType;
  image?: string;
  noIndex?: boolean;
  publishedTime?: string;
  modifiedTime?: string;
  section?: string;
  tags?: string[];
  keywords?: string[];
}

export function generateSiteMetadata({
  title,
  description,
  path,
  locale,
  image = '/images/og-default.jpg',
  noIndex = false,
  type = 'website' as const,
  publishedTime,
  modifiedTime,
  section,
  tags = [],
  keywords = [],
}: GenerateMetadataParams): Metadata {
  const url = `${SITE_URL}${path}`;
  const ogImage = image.startsWith('http') ? image : `${SITE_URL}${image}`;

  return {
    title: {
      default: title,
      template: `%s | POJ PRO`,
    },
    description,
    ...(keywords.length > 0 && { keywords: keywords.join(', ') }),
    metadataBase: new URL(SITE_URL),
    alternates: {
      canonical: url
    },
    openGraph: {
      title,
      description,
      url,
      siteName: 'POJ PRO',
      locale,
      type,
      ...(publishedTime && { publishedTime }),
      ...(modifiedTime && { modifiedTime }),
      ...(section && { section }),
      ...(tags.length > 0 && { tags }),
      images: [
        {
          url: ogImage,
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
      images: [ogImage],
    },
    robots: {
      index: !noIndex,
      follow: true,
      googleBot: {
        index: !noIndex,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
  };
}

export function generateProductStructuredData(product: Product) {
  return {
    '@context': 'https://schema.org/',
    '@type': 'Product',
    name: product.name,
    image: product.images?.length ? `${SITE_URL}${product.images[0]}` : undefined,
    description: product.description || product.short_description,
    sku: product.sku,
    brand: {
      '@type': 'Brand',
      name: 'POJ PRO',
    },
    offers: {
      '@type': 'Offer',
      url: `${SITE_URL}/catalog/${product.category}/${product.id}`,
      priceCurrency: 'UZS',
      price: product.price,
      availability: product.in_stock 
        ? 'https://schema.org/InStock' 
        : 'https://schema.org/OutOfStock',
    },
  };
}

export function generateBreadcrumbList(
  items: Array<{ name: string; path: string }>,
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: `${SITE_URL}${item.path}`,
    })),
  };
}

export function generateOrganizationStructuredData() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'POJ PRO',
    url: SITE_URL,
    logo: `${SITE_URL}/images/logo.png`,
    sameAs: [
      'https://t.me/pojpro_uz',
      'https://www.instagram.com/poj_pro_uz/',
      'https://www.facebook.com/pojpro.uz/',
    ],
  };
}

interface SEOContentMetadataParams {
  section: SEOSection;
  locale: string;
  title?: string;
  description?: string;
  image?: string;
  type?: MetadataType;
}

/**
 * Generates metadata for SEO content pages
 */
export function generateSEOContentMetadata({
  section,
  locale,
  title: customTitle,
  description: customDescription,
  image = '/images/og-default.jpg',
  type = 'website',
}: SEOContentMetadataParams): Metadata {
  // Default title and description based on section
  let title = 'POJ PRO';
  let description = 'Профессиональные решения в области пожарной безопасности';
  
  // In a real implementation, you would fetch these from i18n
  // const { t } = await import(`@/i18n/server`);
  // const content = t(section, { returnObjects: true });
  // const meta = content.meta || {};
  // title = meta.title || title;
  // description = meta.description || description;
  
  // Use custom values if provided
  if (customTitle) title = customTitle;
  if (customDescription) description = customDescription;
  
  // Generate canonical URL
  const path = section === 'homepage' ? '/' : `/${section?.replace(/\./g, '/') || ''}`;
  const url = `${SITE_URL}${locale === 'ru' ? '' : `/${locale}`}${path}`;
  
  return {
    title,
    description,
    alternates: {
      canonical: url,
      languages: {
        'ru': locale === 'ru' ? url : `${SITE_URL}${path}`,
        'uz': locale === 'uz' ? url : `${SITE_URL}/uz${path}`,
        'en': locale === 'en' ? url : `${SITE_URL}/en${path}`,
      },
    },
    openGraph: {
      title,
      description,
      url,
      siteName: 'POJ PRO',
      locale,
      type,
      images: [
        {
          url: image.startsWith('http') ? image : `${SITE_URL}${image}`,
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
      images: [image.startsWith('http') ? image : `${SITE_URL}${image}`],
    },
  };
}
