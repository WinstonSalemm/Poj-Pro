'use client';

import Head from 'next/head';
import Script from 'next/script';
import { usePageView } from '@/lib/analytics';

type StructuredData = {
  '@type'?: string;
  [key: string]: any;
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
  structuredData?: StructuredData;
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
}: SeoHeadProps) {
  const siteName = 'POJ PRO';
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://poj-pro.uz';
  
  // Track page views
  usePageView();

  // Generate title and description
  const title = customTitle.endsWith(siteName) ? customTitle : `${customTitle} | ${siteName}`;
  const description = customDescription;
  const ogImage = image || '';
  const fullOgImage = ogImage.startsWith('http') ? ogImage : `${siteUrl}${ogImage}`;
  const canonicalUrl = `${siteUrl}${path}`;

  // Get alternate language URLs
  const languageAlternates = {
    'ru': `${siteUrl}/ru${path}`,
    'en': `${siteUrl}/en${path}`,
    'uz': `${siteUrl}/uz${path}`,
  };

  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="description" content={description} />
        {noIndex && <meta name="robots" content="noindex, nofollow" />}
        
        {/* Canonical URL */}
        <link rel="canonical" href={canonicalUrl} />
        
        {/* Language Alternates */}
        <link rel="alternate" hrefLang="x-default" href={canonicalUrl} />
        {Object.entries(languageAlternates).map(([lang, href]) => (
          <link key={lang} rel="alternate" hrefLang={lang} href={href} />
        ))}
        
        {/* Open Graph / Facebook */}
        <meta property="og:type" content={type} />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:image" content={fullOgImage} />
        <meta property="og:site_name" content={siteName} />
        <meta property="og:locale" content={locale || 'ru_RU'} />
        
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
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                '@context': 'https://schema.org',
                ...structuredData,
              }),
            }}
          />
        )}
      </Head>
      
      {/* Google Analytics */}
      <Script
        strategy="afterInteractive"
        src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID}`}
      />
      <Script
        id="google-analytics"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID}', {
              page_path: window.location.pathname,
            });
          `,
        }}
      />
      
      {/* Yandex.Metrika */}
      {process.env.NEXT_PUBLIC_YM_ID && (
        <Script
          id="yandex-metrika"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              (function(m,e,t,r,i,k,a){m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};
              m[i].l=1*new Date();
              for (var j = 0; j < document.scripts.length; j++) {if (document.scripts[j].src === r) { return; }}
              k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)})
              (window, document, "script", "https://mc.yandex.ru/metrika/tag.js", "ym");
              
              ym(${process.env.NEXT_PUBLIC_YM_ID}, "init", {
                clickmap:true,
                trackLinks:true,
                accurateTrackBounce:true,
                webvisor:true
              });
            `,
          }}
        />
      )}
      
      {/* Yandex.Metrika noscript fallback */}
      {process.env.NEXT_PUBLIC_YM_ID && (
        <noscript>
          <div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img 
              src={`https://mc.yandex.ru/watch/${process.env.NEXT_PUBLIC_YM_ID}`} 
              style={{ position: 'absolute', left: '-9999px' }} 
              alt="" 
            />
          </div>
        </noscript>
      )}
    </>
  );
}
