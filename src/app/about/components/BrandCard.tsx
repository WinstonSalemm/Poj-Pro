'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';

interface BrandCardProps {
  name: string;
  logo: string;
  href: string;
}

export const BrandCard = ({ name, logo, href }: BrandCardProps) => {
  const { t } = useTranslation();
  
  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm flex flex-col items-center gap-4 transition-all hover:shadow-md h-full">
      <div className="relative h-16 w-full flex items-center justify-center">
        <Image
          src={logo}
          alt={name}
          width={105}
          height={18}
          className="h-4 w-auto object-contain"
          priority={false}
        />
      </div>
      <h3 className="text-lg font-medium text-center text-gray-900">
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
