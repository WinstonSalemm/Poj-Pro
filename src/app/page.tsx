import { Suspense } from 'react';
import { getLocale, fetchAPI } from '@/lib/api';
import { SeoHead } from '@/components/seo/SeoHead';
import HomeSectionsClient from '@/components/home/HomeSectionsClient';

// Client-only heavy sections are rendered via HomeSectionsClient

// Normalize app/lang codes to API-accepted ones
const normLocale = (lang: string) => {
  const s = (lang || '').toLowerCase();
  if (s === 'en' || s === 'eng') return 'en';
  if (s === 'uz' || s === 'uzb') return 'uz';
  return 'ru';
};

// Server-side warm-up for ISR cache (no double read)
async function warmProducts(locale: string) {
  try {
    // hit API using server-safe helper; ignore result, just warm cache
    await fetchAPI(`/api/products?locale=${normLocale(locale)}`, {
      cache: 'force-cache',
      next: { revalidate: 60 },
    }).catch(() => undefined);
  } catch (e) {
    console.error('warmProducts failed', e);
  }
}

export const revalidate = 60;

export default async function HomePage() {
  const locale = await getLocale();
  // Warm ISR cache for products list (non-blocking for UI)
  await warmProducts(locale);

  return (
    <>
      <SeoHead
        title={"POJ PRO — пожарное оборудование в Узбекистане."}
        description={
          (locale?.startsWith('en') ?
            'POJ PRO supplies certified fire safety equipment across Uzbekistan. Reliable extinguishers, alarms, hydrants and more.' :
            locale?.startsWith('uz') ?
            'POJ PRO Oʻzbekistonda sertifikatlangan yongʻin xavfsizligi uskunalarini yetkazib beradi. Ishonchli oʻchirgichlar, signalizatsiya va boshqalar.' :
            'POJ PRO — сертифицированное пожарное оборудование в Узбекистане: огнетушители, оповещение, гидранты и др. Поставка и монтаж.')
            .slice(0, 160)
        }
        path={'/'}
        locale={locale || 'ru'}
        image={'/OtherPics/logo.png'}
        structuredData={{
          '@type': 'Organization',
          name: 'POJ PRO',
          url: (process.env.NEXT_PUBLIC_SITE_URL || process.env.SITE_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : '')) || undefined,
          logo: '/OtherPics/logo.png',
          contactPoint: [{ '@type': 'ContactPoint', contactType: 'customer service', telephone: '+998', areaServed: 'UZ' }],
        }}
      />
      <main className="relative min-h-screen bg-white">
        <Suspense>
          <HomeSectionsClient />
        </Suspense>
      </main>
    </>
  );
}

/* Client-only skeletons moved into HomeSectionsClient */