'use client';

import Head from 'next/head';
import { SITE_URL, SITE_NAME } from '@/lib/site';

type StructuredData = {
  '@type'?: string;
  [key: string]: unknown;
};

interface SeoHeadProps {
  title: string;
  description: string;
  path: string;
  locale: string;
  image?: string;
  noIndex?: boolean;
  type?: 'website' | 'article' | 'profile';
  publishedTime?: string;
  modifiedTime?: string;
  section?: string;
  tags?: string[];
  structuredData?: StructuredData | StructuredData[];
  // When true, canonical and hreflang will use subpath locales (/en, /uz). Default: false.
  useLocaleSubpaths?: boolean;
}

export function SeoHead({
  title: customTitle,
  description: customDescription,
  path,
  locale,
  image = '/images/og-default.jpg',
  noIndex = false,
  type = 'website',
  publishedTime,
  modifiedTime,
  section,
  tags = [],
  structuredData,
  useLocaleSubpaths = false,
}: SeoHeadProps) {
  const siteName = SITE_NAME;
  // Use global site URL to ensure absolute canonicals
  const siteUrl = SITE_URL;

  // Tracking hook removed (no-op) to avoid build errors if analytics isn't configured

  // Helpers
  const ensureLeadingSlash = (p: string) => (p.startsWith('/') ? p : `/${p}`);
  const clean = (p: string) => ensureLeadingSlash(p).replace(/\/+/g, '/');
  const isServicePath = /^\s*\/adminProducts(\/|$)/.test(path);

  // Generate title and description
  const title = customTitle.endsWith(siteName) ? customTitle : `${customTitle} | ${siteName}`;
  const description = customDescription;
  const ogImage = image || '';
  const fullOgImage = ogImage.startsWith('http')
    ? ogImage
    : (siteUrl ? `${siteUrl}${ogImage}` : ogImage);
  // Locale-aware canonical (ru at root; en/uz prefixed)
  const pathname = clean(path);
  const localeLower = (locale || 'ru').toLowerCase();
  const isEn = localeLower.startsWith('en');
  const isUz = localeLower.startsWith('uz');
  const canonicalPath = useLocaleSubpaths
    ? (isEn ? `/en${pathname}` : isUz ? `/uz${pathname}` : pathname) // ru default at root
    : pathname;
  const canonicalUrl = isServicePath ? undefined : (siteUrl ? `${siteUrl}${canonicalPath}` : canonicalPath);

  // Hreflang alternates for subpath locales (skip on service paths)
  const altRuPath = pathname;
  const altEnPath = `/en${pathname}`;
  const altUzPath = `/uz${pathname}`;
  const languageAlternates: Record<string, string> | null = isServicePath
    ? null
    : useLocaleSubpaths
      ? {
          ru: siteUrl ? `${siteUrl}${altRuPath}` : altRuPath,
          en: siteUrl ? `${siteUrl}${altEnPath}` : altEnPath,
          uz: siteUrl ? `${siteUrl}${altUzPath}` : altUzPath,
        }
      : null;
  const ogLocale = isEn ? 'en-US' : isUz ? 'uz-UZ' : 'ru-RU';

  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="description" content={description} />
        {noIndex && <meta name="robots" content="noindex, nofollow" />}
        
        {/* Canonical URL (skipped on service paths) */}
        {!isServicePath && canonicalUrl && <link rel="canonical" href={canonicalUrl} />}
        
        {/* Language Alternates (ru root; en/uz prefixed). x-default -> ru */}
        {!isServicePath && languageAlternates && (
          <>
            <link rel="alternate" hrefLang="x-default" href={languageAlternates.ru} />
            {Object.entries(languageAlternates).map(([lang, href]) => (
              <link key={lang} rel="alternate" hrefLang={lang} href={href} />
            ))}
          </>
        )}
        
        {/* Open Graph / Facebook */}
        <meta property="og:type" content={type} />
        {!isServicePath && canonicalUrl && (
          <meta property="og:url" content={canonicalUrl} />
        )}
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:image" content={fullOgImage} />
        <meta property="og:site_name" content={siteName} />
        <meta property="og:locale" content={ogLocale} />
        
        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:url" content={canonicalUrl} />
        <meta name="twitter:title" content={title} />
        <meta name="twitter:description" content={description} />
        <meta name="twitter:image" content={fullOgImage} />
        
        {/* Additional meta tags */}
        {publishedTime && (
          <meta property="article:published_time" content={publishedTime} />
        )}
        {modifiedTime && (
          <meta property="article:modified_time" content={modifiedTime} />
        )}
        {section && <meta property="article:section" content={section} />}
        {tags.map((tag) => (
          <meta key={tag} property="article:tag" content={tag} />
        ))}
        
        {/* Structured Data */}
        {structuredData && (
          Array.isArray(structuredData) ? (
            structuredData.map((sd, i) => (
              <script
                key={i}
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                  __html: JSON.stringify({ '@context': 'https://schema.org', ...sd }),
                }}
              />
            ))
          ) : (
            <script
              type="application/ld+json"
              dangerouslySetInnerHTML={{
                __html: JSON.stringify({ '@context': 'https://schema.org', ...structuredData }),
              }}
            />
          )
        )}
      </Head>
    </>
  );
}
