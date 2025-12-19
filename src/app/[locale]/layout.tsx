// src/app/[locale]/layout.tsx
import type { Metadata } from 'next';
import { DEFAULT_SEO, SITE_URL, i18nAlt } from '@/lib/site';

interface LocaleLayoutProps {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: LocaleLayoutProps): Promise<Metadata> {
  const { locale: lang } = await params;
  const locale = lang as keyof typeof i18nAlt;

  const title = {
    ru: 'POJ PRO - Пожарное оборудование и средства безопасности',
    en: 'POJ PRO - Fire Safety Equipment',
    uz: 'POJ PRO - Yong\'in muhofazasi uskunalari',
  }[locale] || DEFAULT_SEO.title;

  const description = {
    ru: 'Профессиональное пожарное оборудование и средства безопасности в Ташкенте. Огнетушители, пожарные краны, сигнализация и другое оборудование для вашей безопасности.',
    en: 'Professional fire safety equipment in Tashkent. Fire extinguishers, fire hydrants, alarms and other safety equipment.',
    uz: 'Toshkent shahrida professional yong\'in xavfsizligi uskunalari. Yong\'in o\'chirgichlar, yong\'in kranlari, signalizatsiya va boshqa xavfsizlik uskunalari.',
  }[locale] || DEFAULT_SEO.description;

  const keywords = {
    ru: 'огнетушители, пожарная безопасность, пожарное оборудование, Ташкент, POJ PRO, огнетушители ОП, огнетушители ОУ, пожарные шкафы, пожарные рукава, СИЗ',
    en: 'fire extinguishers, fire safety, fire equipment, Tashkent, POJ PRO, fire cabinets, fire hoses, PPE',
    uz: 'o\'t o\'chirgichlar, yong\'in xavfsizligi, yong\'in uskunalari, Toshkent, POJ PRO, yong\'in shkablari, yong\'in shlanglari, SIZ',
  }[locale] || 'fire safety, POJ PRO';

  return {
    title: {
      default: title,
      template: `%s | ${SITE_URL.replace(/^https?:\/\//, '')}`,
    },
    description,
    keywords,
    alternates: {
      canonical: lang === 'ru' ? SITE_URL : `${SITE_URL}/${lang}`,
      // Use simple hreflang codes expected by tests, plus x-default
      languages: {
        ru: SITE_URL,
        en: `${SITE_URL}/en`,
        uz: `${SITE_URL}/uz`,
        'x-default': SITE_URL,
      },
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    openGraph: {
      locale: i18nAlt[locale],
      url: lang === 'ru' ? SITE_URL : `${SITE_URL}/${lang}`,
      title,
      description,
      type: 'website',
      siteName: 'POJ PRO',
      images: [{
        url: `${SITE_URL}/OtherPics/favicon-large.webp`,
        width: 1200,
        height: 630,
        alt: title,
      }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [`${SITE_URL}/OtherPics/favicon-large.webp`],
    },
  };
}

export default function LocaleLayout({ children, params: _params }: LocaleLayoutProps) {
  // Ensure `_params` is considered used to satisfy ESLint without altering behavior
  void _params;
  return <>{children}</>;
}
