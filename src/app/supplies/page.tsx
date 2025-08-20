'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTranslation } from 'next-i18next';
import SupplyCard from '@/components/supplies/SupplyCard';
import { Supply } from '@/types/supply';

export interface SupplyItem {
  name: string;
  quantity: number;
  supplier?: string;
  notes?: string;
}

export default function SuppliesPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { t } = useTranslation();
  const [supplies, setSupplies] = useState<Supply[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAll, setShowAll] = useState(false);
  const [filteredSupplies, setFilteredSupplies] = useState<Supply[]>([]);

  // Шторка загрузки (короткая, как на других экранах)
  const [bootLoading, setBootLoading] = useState(true);
  useEffect(() => {
    const tm = setTimeout(() => setBootLoading(false), 800);
    return () => clearTimeout(tm);
  }, []);

  useEffect(() => {
    const allParam = searchParams.get('all');
    setShowAll(allParam === '1');
  }, [searchParams]);

  useEffect(() => {
    const fetchSupplies = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`/api/supplies?search=${encodeURIComponent(searchQuery)}`);
        if (!response.ok) throw new Error('Failed to fetch supplies');
        const data = await response.json();
        setSupplies(data);
        setError(null);
      } catch (error) {
        console.error('Error fetching supplies:', error);
        setError(t('supplies.error.loadingError'));
      } finally {
        setIsLoading(false);
      }
    };

    const timer = setTimeout(() => {
      fetchSupplies();
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery, t]);

  useEffect(() => {
    if (showAll) {
      setFilteredSupplies(supplies);
    } else {
      setFilteredSupplies(supplies.slice(0, 5));
    }
  }, [supplies, showAll]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const toggleShowAll = () => {
    if (showAll) {
      router.push('/supplies');
    } else {
      router.push('/supplies?all=1');
    }
    setShowAll(!showAll);
  };

  const showSkeleton = bootLoading || isLoading;

  return (
    <main className="min-h-screen bg-gray-50 mt-[100px] py-8 px-4 sm:px-6 lg:px-8 !text-[#660000] relative">
      {/* ШТОРКА */}
      {bootLoading && (
        <div className="fixed inset-0 z-[60] bg-white text-black flex flex-col items-center justify-center animate-fadeIn">
          <div className="text-2xl font-semibold tracking-wide mb-6">...</div>
          <div className="w-[240px] h-[6px] rounded-full bg-black/10 overflow-hidden">
            <div className="h-full w-1/3 animate-slideBar rounded-full bg-black/70" />
          </div>
        </div>
      )}

      <div className={`max-w-7xl mx-auto transition-opacity duration-500 ${bootLoading ? 'opacity-0' : 'opacity-100'}`}>
        <div className="text-center mb-8">
          <h1 className="!text-[#660000] text-3xl font-bold mb-2">{t('supplies.title')}</h1>
          <p className="!text-[#660000]">{t('supplies.subtitle')}</p>
        </div>

        {/* Search Bar */}
        <div className="mb-8 max-w-2xl mx-auto">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 !text-[#660000]" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
              </svg>
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-md leading-5 bg-white !text-[#660000] placeholder-[#660000] focus:outline-none focus:!ring-[#660000] focus:!border-[#660000] sm:text-sm"
              placeholder={t('supplies.searchPlaceholder')}
              value={searchQuery}
              onChange={handleSearchChange}
            />
          </div>
        </div>

        {showSkeleton ? (
          <div className="space-y-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg border border-gray-200 p-6 shimmer">
                <div className="h-6 w-1/3 rounded mb-4 shimmer" />
                <div className="h-4 w-1/4 rounded mb-4 shimmer" />
                <div className="h-4 w-1/2 rounded shimmer" />
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <svg
              className="mx-auto h-12 w-12 text-red-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            <h3 className="mt-2 text-lg font-medium text-black">{t('supplies.error.loadingError')}</h3>
            <p className="mt-1 text-sm text-gray-500">{t('supplies.error.tryAgain')}</p>
            <div className="mt-6">
              <button
                onClick={() => window.location.reload()}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-[#660000] hover:bg-[#4d0000] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#660000]"
              >
                {t('supplies.error.reloadPage')}
              </button>
            </div>
          </div>
        ) : (
          <>
            {filteredSupplies.length === 0 ? (
              <div className="text-center py-12">
                <svg
                  className="mx-auto h-12 w-12 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <h3 className="mt-2 text-lg font-medium text-black">{t('supplies.noSupplies')}</h3>
                <p className="mt-1 text-sm text-gray-500">
                  {searchQuery ? t('supplies.tryDifferentSearch') : t('supplies.noSuppliesDescription')}
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {filteredSupplies.map((supply, idx) => (
                  <div
                    key={supply.id ?? `${supply.title}-${idx}`}
                    className="animate-in-up"
                    style={{ animationDelay: `${idx * 0.07}s`, animationFillMode: 'backwards' }}
                  >
                    <SupplyCard
                      id={String(supply.id ?? '')}
                      title={supply.title}
                      etaDate={supply.etaDate}
                      status={supply.status}
                      items={supply.items}
                      isAdmin={false}
                    />
                  </div>
                ))}

                <div className="flex justify-center mt-6">
                  <button
                    onClick={toggleShowAll}
                    className="px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md !text-[#660000] bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#660000]"
                  >
                    {t('supplies.showAll')}
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* keyframes — те же, что на других страницах */}
      <style jsx global>{`
        @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
        .animate-fadeIn { animation: fadeIn .25s ease-out }

        @keyframes slideBar {
          0% { transform: translateX(-120%) }
          60% { transform: translateX(160%) }
          100% { transform: translateX(160%) }
        }
        .animate-slideBar { animation: slideBar 1.2s ease-in-out infinite }

        @keyframes inUp {
          0% { opacity: 0; transform: translateY(16px) }
          100% { opacity: 1; transform: translateY(0) }
        }
        .animate-in-up { animation: inUp .6s cubic-bezier(.22,.61,.36,1) both }

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
