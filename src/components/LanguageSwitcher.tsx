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
    // Persist cookies for server-side locale detection (keep legacy 'lang' for compatibility)
    // 1 year expiry
    document.cookie = `i18next=${normalized}; path=/; max-age=31536000; SameSite=Lax`;
    document.cookie = `lang=${normalized}; path=/; max-age=31536000; SameSite=Lax`;
    // Persist to localStorage for client detector
    try { localStorage.setItem('i18nextLng', normalized); } catch {}
    // Re-render server components with new cookie
    router.refresh();
  };

  return (
    <div className="flex items-center gap-1 bg-white/80 backdrop-blur-sm rounded-full p-1 border border-gray-200 shadow-sm">
      {languages.map((lang) => (
        <button
          key={lang.code}
          onClick={() => changeLanguage(lang.code)}
          className={`btn-ghost h-8 w-8 rounded-full text-xs ${
            (i18n.language === lang.code || (i18n.language || '').toLowerCase().startsWith(lang.code))
              ? 'bg-brand text-white hover:bg-[#520000]'
              : ''
          }`}
        >
          {lang.name}
        </button>
      ))}
    </div>
  );
}
