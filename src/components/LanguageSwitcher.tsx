'use client';

import { useTranslation } from 'react-i18next';
import { useRouter } from 'next/navigation';

export function LanguageSwitcher() {
  const { i18n } = useTranslation();
  const router = useRouter();

  const languages = [
    { code: 'ru', name: 'РУ' },
    { code: 'eng', name: 'EN' },
    { code: 'uzb', name: 'UZ' }
  ];

  const changeLanguage = (lng: string) => {
    // Normalize to the codes our backend expects
    const normalized = lng === 'eng' ? 'eng' : lng === 'uzb' ? 'uzb' : 'ru';
    // Update i18next client state
    i18n.changeLanguage(normalized);
    // Persist cookie for server-side getLocale()
    // 1 year expiry
    document.cookie = `i18next=${normalized}; path=/; max-age=31536000`;
    // Re-render server components with new cookie
    router.refresh();
  };

  return (
    <div className="flex items-center space-x-1 bg-white/80 backdrop-blur-sm rounded-full p-1 border border-gray-200 shadow-sm">
      {languages.map((lang) => (
        <button
          key={lang.code}
          onClick={() => changeLanguage(lang.code)}
          className={`w-8 h-8 flex items-center justify-center rounded-full text-sm font-medium transition-colors ${
            i18n.language === lang.code 
              ? 'bg-[#660000] text-white' 
              : 'text-gray-700 hover:bg-gray-100'
          }`}
        >
          {lang.name}
        </button>
      ))}
    </div>
  );
}
