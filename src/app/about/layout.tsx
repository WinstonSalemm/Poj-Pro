import type { Metadata } from 'next';
import { headers } from 'next/headers';
import { buildPageMetadata, langFromCookieHeader } from '@/lib/metadata';

export async function generateMetadata(): Promise<Metadata> {
  const h = await headers();
  const cookie = h.get('cookie');
  const lang = langFromCookieHeader(cookie);
  return buildPageMetadata({
    titleKey: 'aboutus.title',
    descriptionKey: 'aboutus.meta.description',
    path: '/about',
    lang,
    keywords: ['о нас', 'компания', 'POJ PRO', 'пожарная безопасность', 'Ташкент'],
  });
}

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
