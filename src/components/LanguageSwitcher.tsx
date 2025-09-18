'use client';

import { useTranslation } from 'react-i18next';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export function LanguageSwitcher() {
  const { i18n } = useTranslation();
  const router = useRouter();

  const languages = [
    { code: 'ru', name: 'RU' },
    { code: 'en', name: 'EN' },
    { code: 'uz', name: 'UZ' }
  ];

  const changeLanguage = (lng: string) => {
    // UI/i18n code uses standard Next i18n codes
    const uiCode = lng === 'en' ? 'en' : lng === 'uz' ? 'uz' : 'ru';
    // Backend cookie stays on legacy codes to not break API expectations
    const backendCode = uiCode === 'en' ? 'eng' : uiCode === 'uz' ? 'uzb' : 'ru';

    // Update i18next client state and persist for detectors
    i18n.changeLanguage(uiCode);
    document.cookie = `i18next=${uiCode}; path=/; max-age=31536000; SameSite=Lax`;
    document.cookie = `lang=${backendCode}; path=/; max-age=31536000; SameSite=Lax`;
    try { localStorage.setItem('i18nextLng', uiCode); } catch {}

    // Re-render server components with new cookie
    router.refresh();
  };

  // On mount, normalize any legacy stored language codes to standard ones for i18next UI
  useEffect(() => {
    const current = (i18n.language || '').toLowerCase();
    if (current === 'eng') {
      i18n.changeLanguage('en');
      try { localStorage.setItem('i18nextLng', 'en'); } catch {}
      document.cookie = `i18next=en; path=/; max-age=31536000; SameSite=Lax`;
    } else if (current === 'uzb') {
      i18n.changeLanguage('uz');
      try { localStorage.setItem('i18nextLng', 'uz'); } catch {}
      document.cookie = `i18next=uz; path=/; max-age=31536000; SameSite=Lax`;
    }
    // Keep backend cookie 'lang' as-is so API keeps working
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
