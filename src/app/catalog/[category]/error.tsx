"use client";

import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const { t } = useTranslation();

  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Catalog category error:', error);
  }, [error]);

  return (
    <div className="min-h-[60vh] flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-lg p-8 max-w-2xl w-full text-center">
        <h2 className="text-2xl font-bold text-red-600 mb-4">
          {t('errors.somethingWentWrong', 'Something went wrong!')}
        </h2>
        <p className="text-gray-700 mb-6">
          {t('errors.failedToLoadCategory', 'Failed to load category. Please try again.')}
        </p>
        <button
          onClick={() => reset()}
          className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          {t('common.tryAgain', 'Try again')}
        </button>
      </div>
    </div>
  );
}
