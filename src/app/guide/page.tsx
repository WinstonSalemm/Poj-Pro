import type { Metadata } from 'next';
import { headers } from 'next/headers';
import { SITE_URL } from '@/lib/site';
import { buildPageMetadata, langFromCookieHeader } from '@/lib/metadata';
import GuideClient from '@/components/guide/GuideClient';

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  const h = await headers();
  const cookie = h.get('cookie');
  const lang = langFromCookieHeader(cookie);
  return buildPageMetadata({
    titleKey: 'guide.title',
    descriptionKey: 'guide.intro',
    path: '/guide',
    lang,
    keywords: ['гид по пожарной безопасности', 'пожарная безопасность', 'руководство', 'инструкция', 'POJ PRO'],
  });
}

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
