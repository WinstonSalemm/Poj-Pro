'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useTranslation } from '@/i18n/useTranslation';

interface Partner {
    id: number;
    name: string;
    slug: string;
    url?: string;
}

const PARTNERS: Partner[] = [
    { id: 1, name: 'Havas', slug: 'havas' },
    { id: 2, name: 'Korzinka', slug: 'korzinka' },
    { id: 3, name: 'nestOne', slug: 'nestone' },
    { id: 4, name: 'M Сosmetic', slug: 'magnit-сosmetic' },
    { id: 5, name: 'Tashkent City Mall', slug: 'tashkent-city-mall' },
    { id: 6, name: 'UzbekNeftGaz', slug: 'uzbekneftgaz' },
    { id: 7, name: 'KFC', slug: 'kfc' },
    { id: 8, name: 'OSTIN', slug: 'ostin' },
    { id: 9, name: 'Uzbekistan Airports', slug: 'uzbekistan-airports' },
    { id: 10, name: 'Спортмастер', slug: 'sportmaster' },
    { id: 11, name: 'ADM', slug: 'adm' },
    { id: 12, name: 'SamAuto', slug: 'samauto' },
    { id: 13, name: 'Uzbekistan AirWays', slug: 'uzbekistan-airways' },
    { id: 14, name: 'Astana Motors', slug: 'astana-motors' },
    { id: 15, name: 'Trest 12', slug: 'trest12' },
];

export function PartnersSection() {
    const { t } = useTranslation();

    return (
        <section className="relative w-full mx-auto mt-16 mb-8">
            <h2 className="text-center text-2xl md:text-3xl font-bold mb-2 text-[#660000]">
                {t('partners.title')}
            </h2>
            <p className="text-center max-w-3xl mx-auto mb-8 text-[#660000]">
                {t('partners.subtitle')}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {PARTNERS.map((partner, idx) => (
                    <div
                        key={partner.slug}
                        className="animate-in-up rounded-2xl border border-gray-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow"
                        style={{
                            animationDelay: `${idx * 0.07}s`,
                            animationFillMode: 'backwards',
                        }}
                    >
                        <div className="flex flex-col items-center h-full">
                            <div className="relative w-full h-32 flex items-center justify-center mb-4">
                                <Image
                                    src={`/partners/${partner.slug}.svg`}
                                    alt={partner.name}
                                    width={220}
                                    height={120}
                                    className="mx-auto h-24 w-auto object-contain"
                                    onError={(e) => {
                                        // Fallback to SVG if WebP is not available
                                        const target = e.target as HTMLImageElement;
                                        target.src = target.src.replace('.webp', '.png');
                                    }}
                                />
                            </div>
                            <h3 className="text-lg font-semibold text-[#660000] text-center">
                                {partner.name}
                            </h3>
                            {partner.url && (
                                <Link
                                    href={partner.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="mt-2 text-sm text-[#660000] hover:underline"
                                >
                                    {partner.name}
                                </Link>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}
