"use client";

import { useEffect, useState } from "react";
import { useTranslation } from 'next-i18next';
import ImageSlider from '@/components/ImageSlider/ImageSlider';
import SmallAboutUs from '@/components/SmallAboutUs/SmallAboutUs';
import dynamic from 'next/dynamic';
import CategoryBlock from '@/components/CategoryBlock/CategoryBlock';
import MapSection from '@/components/MapSection/MapSection';

// Dynamically import PopularProductsBlock with no SSR
const PopularProductsBlock = dynamic(
  () => import('@/components/PopularProductsBlock/PopularProductsBlock'),
  { ssr: false }
);

interface Product {
  id: string | number;
  name: string;
  description: string;
  short_description: string;
  price: number;
  category: string;
  image: string;
  images: string[];
  characteristics: Record<string, string>;
  sku: string;
  in_stock: boolean;
  rating: number;
  reviews_count: number;
}

// Normalize app/lang codes to API-accepted ones
const normLocale = (lang: string) => {
  const s = (lang || '').toLowerCase();
  if (s === 'en' || s === 'eng') return 'en';
  if (s === 'uz' || s === 'uzb') return 'uz';
  return 'ru';
};

// Function to fetch products from API
const fetchProducts = async (locale: string): Promise<Product[]> => {
  try {
    const response = await fetch(`/api/products?locale=${normLocale(locale)}`);
    if (!response.ok) {
      throw new Error('Failed to fetch products');
    }
    const data = await response.json();
    
    if (!data.success || !Array.isArray(data.data?.products)) {
      throw new Error(data.message || 'Invalid products data');
    }

    // Transform the API response to match the Product type
    return data.data.products.map((product: any) => ({
      id: product.id,
      name: product.title,
      description: product.description || '',
      short_description: product.summary || '',
      price: typeof product.price === 'number' ? product.price : 0,
      category: product.category?.name || '',
      image: product.image || '',
      images: product.image ? [product.image] : [],
      characteristics: {},
      sku: '',
      in_stock: true,
      rating: 0,
      reviews_count: 0
    }));
  } catch (error) {
    console.error(`Error loading products for locale ${locale}:`, error);
    return [];
  }
};

export default function HomePage() {
  const { i18n } = useTranslation();
  const [bootLoading, setBootLoading] = useState(true);
  const [loading, setLoading] = useState(true);

  // Get current language from i18n
  const currentLang = i18n?.language || 'ru';
  const apiLocale = normLocale(currentLang);

  useEffect(() => {
    // Load products when component mounts or language changes
    const loadProducts = async () => {
      try {
        setLoading(true);
        // We're keeping this call to ensure translations are loaded
        await fetchProducts(apiLocale);
      } catch (err) {
        console.error('Failed to load products:', err);
      } finally {
        setLoading(false);
      }
    };

    // Set a minimum loading time for better UX on initial load
    if (bootLoading) {
      const timer = setTimeout(() => {
        loadProducts();
        setBootLoading(false);
      }, 700);
      return () => clearTimeout(timer);
    } else {
      loadProducts();
    }
  }, [apiLocale, bootLoading]);

  // Only show loading indicator if we're still booting or loading products
  const showLoading = bootLoading || loading;

  return (
    <main className="relative min-h-screen bg-white">
      {/* Loading overlay */}
      {showLoading && (
        <div className="fixed inset-0 z-[60] bg-white text-black flex flex-col items-center justify-center animate-fadeIn">
          <div className="text-2xl font-semibold tracking-wide mb-6">Загрузка...</div>
          <div className="w-[240px] h-[6px] rounded-full bg-black/20 overflow-hidden">
            <div className="h-full w-1/3 animate-slideBar rounded-full bg-black" />
          </div>
        </div>
      )}

      {/* Контент с каскадной анимацией появления */}
      <section className={`transition-opacity duration-500 ${bootLoading ? 'opacity-0' : 'opacity-100'}`}>
        <div className="animate-in-up" style={{ animationDelay: '0.05s' }}>
          {/* Скелетон на слайдер (виден только пока bootLoading=true) */}
          {bootLoading ? (
            <div className="h-[320px] md:h-[420px] w-full shimmer rounded-none" />
          ) : (
            <ImageSlider />
          )}
        </div>

        <div className="animate-in-up" style={{ animationDelay: '0.12s' }}>
          {bootLoading ? (
            <SectionSkeleton title widthClass="w-40" lines={3} />
          ) : (
            <SmallAboutUs />
          )}
        </div>

        <div className="animate-in-up" style={{ animationDelay: '0.18s' }}>
          {bootLoading ? (
            <CardsSkeleton count={6} />
          ) : (
            <PopularProductsBlock />
          )}
        </div>

        <div className="animate-in-up" style={{ animationDelay: '0.24s' }}>
          {bootLoading ? (
            <SectionSkeleton title widthClass="w-48" lines={2} />
          ) : (
            <CategoryBlock />
          )}
        </div>

        <div className="!bg-[#F8F9FA] animate-in-up" style={{ animationDelay: '0.30s' }}>
          {bootLoading ? (
            <div className="h-[320px] w-full shimmer rounded-xl  mx-auto max-w-[1260px]" />
          ) : (
            <MapSection />
          )}
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
