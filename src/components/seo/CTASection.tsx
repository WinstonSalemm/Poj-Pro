"use client";

import React from 'react';
import Link from 'next/link';
import { useTranslation } from 'next-i18next';

interface CTASectionProps {
  category?: string;
  className?: string;
}

export const CTASection: React.FC<CTASectionProps> = ({
  category,
  className = '',
}) => {
  const { t } = useTranslation('seo');

  // Get CTA text from translations
  const ctaTexts = t('cta', { returnObjects: true }) as {
    buyNow: string;
    consult: string;
  };

  // Determine the catalog link
  const catalogLink = category ? `/catalog/${category}` : '/catalog';

  return (
    <div className={`flex flex-col sm:flex-row gap-4 mt-8 ${className}`}>
      <Link
        href={catalogLink}
        className="px-6 py-3 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 transition-colors text-center"
        aria-label={t('ariaLabels.buyNow')}
      >
        {ctaTexts.buyNow}
      </Link>
      <Link
        href="/contacts"
        className="px-6 py-3 border-2 border-blue-600 text-blue-600 font-medium rounded-md hover:bg-blue-50 transition-colors text-center"
        aria-label={t('ariaLabels.consult')}
      >
        {ctaTexts.consult}
      </Link>
    </div>
  );
};
