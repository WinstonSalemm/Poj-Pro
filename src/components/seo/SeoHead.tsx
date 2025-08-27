"use client";
import Head from 'next/head';

type SeoHeadProps = {
  title: string;
  description?: string;
  path?: string; // e.g. '/contacts'
  locale?: string; // 'ru' | 'en' | 'uz'
  image?: string | undefined; // path to image
  structuredData?: Record<string, unknown> | undefined;
};

export function SeoHead({ title, description, path, locale, image, structuredData }: SeoHeadProps) {
  const siteUrl =
    (process.env.NEXT_PUBLIC_SITE_URL || process.env.SITE_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : '')) as
      | string
      | undefined;
  const canonical = siteUrl && path ? `${siteUrl.replace(/\/$/, '')}${path}` : undefined;
  const ogImage = image || '/OtherPics/logo.png';

  return (
    <>
      <Head>
        <title>{title}</title>
        {description ? <meta name="description" content={description} /> : null}
        {canonical ? <link rel="canonical" href={canonical} /> : null}
        {locale ? <meta property="og:locale" content={locale} /> : null}
        <meta property="og:title" content={title} />
        {description ? <meta property="og:description" content={description} /> : null}
        {canonical ? <meta property="og:url" content={canonical} /> : null}
        <meta property="og:type" content="website" />
        {ogImage ? <meta property="og:image" content={ogImage} /> : null}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={title} />
        {description ? <meta name="twitter:description" content={description} /> : null}
        {ogImage ? <meta name="twitter:image" content={ogImage} /> : null}
      </Head>
      {structuredData ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      ) : null}
    </>
  );
}
