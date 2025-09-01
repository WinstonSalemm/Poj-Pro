"use client";
import { Suspense } from 'react';
import dynamic from 'next/dynamic';

const ImageSlider = dynamic(() => import('@/components/ImageSlider/ImageSlider'), {
  // client-side only to avoid blocking LCP
  ssr: false,
  loading: () => <div className="h-[320px] md:h-[420px] w-full shimmer rounded-none" />,
});
const SmallAboutUs = dynamic(() => import('@/components/SmallAboutUs/SmallAboutUs'), {
  loading: () => (
    <div className="container-section section-y"><div className="h-7 w-40 shimmer rounded-md mb-6" /></div>
  ),
});
const CategoryBlock = dynamic(() => import('@/components/CategoryBlock/CategoryBlock'), {
  loading: () => (
    <div className="container-section section-y"><div className="h-7 w-48 shimmer rounded-md mb-6" /></div>
  ),
});
const PopularProductsBlock = dynamic(() => import('@/components/PopularProductsBlock/PopularProductsBlock'), {
  loading: () => (
    <div className="container-section section-y"><div className="h-7 w-44 shimmer rounded-md mb-6" /></div>
  ),
});
const MapSection = dynamic(() => import('@/components/MapSection/MapSection'), {
  ssr: false,
  loading: () => <div className="h-[320px] w-full shimmer rounded-xl  mx-auto max-w-[1260px]" />,
});

export default function HomeSectionsClient() {
  return (
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
  );
}

function SectionSkeleton({ title = true, widthClass = "w-32", lines = 2 }: { title?: boolean; widthClass?: string; lines?: number }) {
  return (
    <div className="container-section section-y">
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
    <div className="container-section section-y">
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
