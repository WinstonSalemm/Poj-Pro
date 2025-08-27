import { Suspense } from 'react';
import { getLocale, fetchAPI } from '@/lib/api';
import Hero from '@/components/Hero/Hero';
import SmallAboutUs from '@/components/SmallAboutUs/SmallAboutUs';
import CategoryBlock from '@/components/CategoryBlock/CategoryBlock';
import MapSection from '@/components/MapSection/MapSection';
import { SeoHead } from '@/components/seo/SeoHead';
import PopularProductsBlock from '@/components/PopularProductsBlock/PopularProductsBlock';
import styles from './page.module.css';

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
      <main className={styles.main}>
        {/* Hero */}
        <Hero />
        {/* Контент с каскадной анимацией появления */}
        <section className={styles.section}>

        <div className="animate-in-up" style={{ animationDelay: '0.08s' }}>
          <Suspense fallback={<SectionSkeleton title widthPx={160} lines={3} />}> 
            <SmallAboutUs />
          </Suspense>
        </div>

        <div className="animate-in-up" style={{ animationDelay: '0.14s' }}>
          <Suspense fallback={<CardsSkeleton count={6} />}> 
            <PopularProductsBlock />
          </Suspense>
        </div>

        <div className="animate-in-up" style={{ animationDelay: '0.20s' }}>
          <Suspense fallback={<SectionSkeleton title widthPx={192} lines={2} />}> 
            <CategoryBlock />
          </Suspense>
        </div>

        <div className={styles.mapWrap + ' animate-in-up'} style={{ animationDelay: '0.30s' }}>
          <Suspense fallback={<div className={styles.mapFallback + ' shimmer'} />}> 
            <MapSection />
          </Suspense>
        </div>
      </section>

      
      </main>
    </>
  );
}

/* --- Локальные скелетоны --- */

function SectionSkeleton({ title = true, widthPx = 128, lines = 2 }: { title?: boolean; widthPx?: number; lines?: number }) {
  return (
    <div className={styles.containerPad}>
      {title && <div className={styles.titleSkel} style={{ width: widthPx }} />}
      <div className={styles.lines}>
        {Array.from({ length: lines }).map((_, i) => (
          <div key={i} className={styles.line} />
        ))}
      </div>
    </div>
  );
}

function CardsSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className={styles.containerPad}>
      <div className={styles.titleSkel} style={{ width: 176 }} />
      <div className={styles.gridCards}>
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className={styles.cardSkel}>
            <div className={styles.cardImg} />
            <div className={styles.cardLineWide} />
            <div className={styles.cardLine} />
          </div>
        ))}
      </div>
    </div>
  );
}
