import type { Metadata } from 'next';
import { SITE_URL, SITE_NAME } from '@/lib/site';
import GuideClient from '@/components/guide/GuideClient';

export const revalidate = 60;

export const metadata: Metadata = {
  title: 'Гид по пожарной безопасности — POJ PRO',
  description:
    'Практические советы по подбору и размещению противопожарного оборудования: где, сколько и почему ставить. Частые вопросы.',
  alternates: {
    canonical: `${SITE_URL}/guide`,
  },
  openGraph: {
    url: `${SITE_URL}/guide`,
    title: 'Гид по пожарной безопасности — POJ PRO',
    description:
      'Советы по размещению оборудования и ответы на частые вопросы.',
    siteName: SITE_NAME,
  },
};

export default function GuidePage() {
  const breadcrumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: SITE_URL,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Guide',
        item: `${SITE_URL}/guide`,
      },
    ],
  } as const;

  return (
    <main className="container-section section-y">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd, null, 2) }}
      />
      <GuideClient />
    </main>
  );
}
