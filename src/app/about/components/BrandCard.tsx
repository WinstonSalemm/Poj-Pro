'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';

interface BrandCardProps {
  name: string;
  logo: string;
  href: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export const BrandCard = ({ name, logo, href, size = 'md' }: BrandCardProps) => {
  const { t } = useTranslation();
  
  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-5 md:p-4 shadow-sm flex flex-col items-center gap-3 transition-all hover:shadow-md h-full">
      <div className={`relative w-full flex items-center justify-center flex-1 ${
        size === 'xl' ? 'min-h-36 md:min-h-40' : size === 'lg' ? 'min-h-28 md:min-h-32' : size === 'sm' ? 'min-h-20 md:min-h-24' : 'min-h-24 md:min-h-28'
      }`}>
        <Image
          src={logo}
          alt={name}
          width={size === 'xl' ? 420 : size === 'lg' ? 320 : 240}
          height={size === 'xl' ? 90 : size === 'lg' ? 64 : 48}
          className={`${size === 'xl' ? 'h-20 md:h-24' : size === 'lg' ? 'h-14 md:h-16' : size === 'sm' ? 'h-8 md:h-10' : 'h-10 md:h-12'} w-auto object-contain`}
          priority={false}
          sizes={size === 'xl' ? '(max-width: 768px) 260px, 420px' : size === 'lg' ? '(max-width: 768px) 200px, 320px' : '(max-width: 768px) 160px, 240px'}
        />
      </div>
      <h3 className="text-base md:text-lg font-medium text-center text-gray-900">
        {name}
      </h3>
      <Link
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-2 text-sm font-medium text-red-700 hover:text-red-800 transition-colors"
      >
        {t('common.officialWebsite')}
      </Link>
    </div>
  );
};
