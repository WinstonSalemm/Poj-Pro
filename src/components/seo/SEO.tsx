import { usePathname } from 'next/navigation';
import Head from 'next/head';
import { useTranslation } from '@/i18n/useTranslation';
import { DEFAULT_SEO, SITE_NAME, SITE_URL } from '@/lib/site';

type SEOProps = {
  title?: string;
  description?: string;
  image?: string;
  noindex?: boolean;
  canonicalUrl?: string;
  type?: 'website' | 'article' | 'product' | 'profile' | 'book' | 'music.song' | 'music.album' | 'music.playlist' | 'music.radio_station' | 'video.movie' | 'video.episode' | 'video.tv_show' | 'video.other';
  locale?: 'ru' | 'en' | 'uz';
  siteName?: string;
  twitterCard?: 'summary' | 'summary_large_image' | 'app' | 'player';
  twitterSite?: string;
  twitterCreator?: string;
  publishedTime?: string;
  modifiedTime?: string;
  section?: string;
  tags?: string[];
};

export const SEO = ({
  title,
  description,
  image,
  noindex = false,
  canonicalUrl,
  type = 'website',
  siteName = 'POJ PRO',
  twitterCard = 'summary_large_image',
  twitterSite = '@pojpro',
  twitterCreator = '@pojpro',
  publishedTime,
  modifiedTime,
  section,
  tags = [],
}: SEOProps) => {
  const { t, i18n } = useTranslation();
  const pathname = usePathname();
  
  // Default values
  const defaultTitle = t('seo.default_title', DEFAULT_SEO.title);
  const defaultDescription = t('seo.default_description', DEFAULT_SEO.description);
  const defaultImage = DEFAULT_SEO.image;
  
  // Use provided values or fallback to defaults
  const seo = {
    title: title ? `${title} | ${SITE_NAME}` : defaultTitle,
    description: description || defaultDescription,
    image: image || defaultImage,
    url: canonicalUrl || `${SITE_URL}${pathname}`,
    type,
    locale: i18n.language || 'ru',
    siteName: siteName || SITE_NAME,
  };

  // Open Graph meta tags
  const ogTags = [
    { property: 'og:title', content: seo.title },
    { property: 'og:description', content: seo.description },
    { property: 'og:image', content: seo.image },
    { property: 'og:url', content: seo.url },
    { property: 'og:type', content: seo.type },
    { property: 'og:locale', content: seo.locale },
    { property: 'og:site_name', content: seo.siteName },
  ];

  // Add article specific tags if type is article
  if (type === 'article') {
    if (publishedTime) ogTags.push({ property: 'article:published_time', content: publishedTime });
    if (modifiedTime) ogTags.push({ property: 'article:modified_time', content: modifiedTime });
    if (section) ogTags.push({ property: 'article:section', content: section });
    tags.forEach((tag) => ogTags.push({ property: 'article:tag', content: tag }));
  }

  // Twitter Card meta tags
  const twitterTags = [
    { name: 'twitter:card', content: twitterCard },
    { name: 'twitter:site', content: twitterSite },
    { name: 'twitter:creator', content: twitterCreator },
    { name: 'twitter:title', content: seo.title },
    { name: 'twitter:description', content: seo.description },
    { name: 'twitter:image', content: seo.image },
  ];

  return (
    <Head>
      {/* Base meta tags */}
      <title>{seo.title}</title>
      <meta name="description" content={seo.description} />
      <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5, viewport-fit=cover" />
      
      {/* Canonical URL */}
      <link rel="canonical" href={seo.url} />
      
      {/* Open Graph / Facebook */}
      {ogTags.map((tag, index) => (
        <meta key={`og-${index}`} property={tag.property} content={tag.content} />
      ))}
      
      {/* Twitter */}
      {twitterTags.map((tag, index) => (
        <meta key={`twitter-${index}`} name={tag.name} content={tag.content} />
      ))}
      
      {/* Noindex if specified */}
      {noindex && <meta name="robots" content="noindex, nofollow" />}
      
      {/* Favicon */}
      <link rel="icon" href="/favicon.ico" sizes="any" />
      <link rel="icon" href="/icon.svg" type="image/svg+xml" />
      <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
      <link rel="manifest" href="/site.webmanifest" />
    </Head>
  );
};

export default SEO;
