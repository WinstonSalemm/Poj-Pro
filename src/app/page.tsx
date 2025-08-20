import { Suspense } from 'react';
import { getLocale } from '@/lib/api';
import ImageSlider from '@/components/ImageSlider/ImageSlider';
import SmallAboutUs from '@/components/SmallAboutUs/SmallAboutUs';
import dynamic from 'next/dynamic';
import CategoryBlock from '@/components/CategoryBlock/CategoryBlock';
import MapSection from '@/components/MapSection/MapSection';
import { SeoHead } from '@/components/seo/SeoHead';

// Dynamically import PopularProductsBlock with no SSR
const PopularProductsBlock = dynamic(
  () => import('@/components/PopularProductsBlock/PopularProductsBlock'),
  { ssr: false }
);

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
    const res = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || ''}/api/products?locale=${normLocale(locale)}`,
      { cache: 'force-cache', next: { revalidate: 60 } });
    // Single JSON read to avoid body stream issues
    if (res.ok) await res.json().catch(() => undefined);
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
      {/* Контент с каскадной анимацией появления */}
      <section className={`transition-opacity duration-500 opacity-100`}>
        <div className="animate-in-up" style={{ animationDelay: '0.05s' }}>
          <Suspense fallback={<div className="h-[320px] md:h-[420px] w-full shimmer rounded-none" />}> 
            <ImageSlider />
          </Suspense>
        </div>

        <div className="animate-in-up" style={{ animationDelay: '0.12s' }}>
          <Suspense fallback={<SectionSkeleton title widthClass="w-40" lines={3} />}> 
            <SmallAboutUs />
          </Suspense>
        </div>

        <div className="animate-in-up" style={{ animationDelay: '0.18s' }}>
          <Suspense fallback={<CardsSkeleton count={6} />}> 
            <PopularProductsBlock />
          </Suspense>
        </div>

        <div className="animate-in-up" style={{ animationDelay: '0.24s' }}>
          <Suspense fallback={<SectionSkeleton title widthClass="w-48" lines={2} />}> 
            <CategoryBlock />
          </Suspense>
        </div>

        <div className="!bg-[#F8F9FA] animate-in-up" style={{ animationDelay: '0.30s' }}>
          <Suspense fallback={<div className="h-[320px] w-full shimmer rounded-xl  mx-auto max-w-[1260px]" />}> 
            <MapSection />
          </Suspense>
        </div>
      </section>

      {/* keyframes и утилиты */}
      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0 }
          to { opacity: 1 }
        }
        .animate-fadeIn { animation: fadeIn .25s ease-out }

        @keyframes slideBar {
          0% { transform: translateX(-120%) }
          60% { transform: translateX(160%) }
          100% { transform: translateX(160%) }
        }
        .animate-slideBar { animation: slideBar 1.2s ease-in-out infinite }

        /* Каскадное появление секций */
        @keyframes inUp {
          0% { opacity: 0; transform: translateY(16px) }
          100% { opacity: 1; transform: translateY(0) }
        }
        .animate-in-up {
          animation: inUp .6s cubic-bezier(.22,.61,.36,1) both;
        }

        /* Шимер-скелетон */
        .shimmer {
          position: relative;
          background: linear-gradient(90deg, #f3f4f6 25%, #e5e7eb 37%, #f3f4f6 63%);
          background-size: 400% 100%;
          animation: shimmerMove 1.2s ease-in-out infinite;
        }
        @keyframes shimmerMove {
          0% { background-position: 100% 0 }
          100% { background-position: 0 0 }
        }
      `}</style>
      </main>
    </>
  );
}

/* --- Локальные скелетоны --- */

function SectionSkeleton({ title = true, widthClass = "w-32", lines = 2 }: { title?: boolean; widthClass?: string; lines?: number }) {
  return (
    <div className="max-w-[1260px] mx-auto px-4 py-10">
      {title && <div className={`h-7 ${widthClass} shimmer rounded-md mb-6`} />}
      <div className="space-y-3">
        {Array.from({ length: lines }).map((_, i) => (
          <div key={i} className="h-4 shimmer rounded-md" />
        ))}
      </div>
    </div>
  );
}

function CardsSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="max-w-[1260px] mx-auto px-4 py-10">
      <div className="h-7 w-44 shimmer rounded-md mb-6" />
      <div className="grid [grid-template-columns:repeat(auto-fit,minmax(220px,1fr))] gap-6">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="rounded-2xl border border-[#eee] p-3">
            <div className="h-[150px] shimmer rounded-xl mb-3" />
            <div className="h-4 w-3/4 shimmer rounded-md mb-2" />
            <div className="h-4 w-1/2 shimmer rounded-md" />
          </div>
        ))}
      </div>
    </div>
  );
}
