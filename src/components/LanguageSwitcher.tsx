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
  // Only run once on initial mount, not on every language change
  useEffect(() => {
    const current = (i18n.language || '').toLowerCase();
    // Check if we need to normalize (only if it's a legacy code)
    if (current === 'eng' || current === 'uzb') {
      // Check what's actually stored to avoid conflicts
      const stored = localStorage.getItem('i18nextLng');
      const cookieLang = document.cookie.split(';').find(c => c.trim().startsWith('i18next='));
      const cookieValue = cookieLang ? cookieLang.split('=')[1] : null;
      
      // Only normalize if stored value matches legacy code
      if (current === 'eng' && (!stored || stored === 'eng') && (!cookieValue || cookieValue === 'eng')) {
        i18n.changeLanguage('en');
        try { localStorage.setItem('i18nextLng', 'en'); } catch {}
        document.cookie = `i18next=en; path=/; max-age=31536000; SameSite=Lax`;
      } else if (current === 'uzb' && (!stored || stored === 'uzb') && (!cookieValue || cookieValue === 'uzb')) {
        i18n.changeLanguage('uz');
        try { localStorage.setItem('i18nextLng', 'uz'); } catch {}
        document.cookie = `i18next=uz; path=/; max-age=31536000; SameSite=Lax`;
      }
    }
    // Keep backend cookie 'lang' as-is so API keeps working
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty deps - only run once on mount

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
