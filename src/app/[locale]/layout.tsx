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

  return {
    title: {
      default: title,
      template: `%s | ${SITE_URL.replace(/^https?:\/\//, '')}`,
    },
    description,
    alternates: {
      canonical: `/${lang}`,
      // Use simple hreflang codes expected by tests, plus x-default
      languages: {
        ru: '/',
        en: '/en',
        uz: '/uz',
        'x-default': '/ru',
      },
    },
    openGraph: {
      locale: i18nAlt[locale],
      url: `${SITE_URL}/${lang}`,
      title,
      description,
    },
    twitter: {
      title,
      description,
    },
  };
}

export default function LocaleLayout({ children, params: _params }: LocaleLayoutProps) {
  // Ensure `_params` is considered used to satisfy ESLint without altering behavior
  void _params;
  return <>{children}</>;
}
