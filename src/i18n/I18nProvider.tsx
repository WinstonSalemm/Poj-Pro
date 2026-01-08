'use client';

import { ReactNode, useEffect, useState } from 'react';
import { I18nextProvider } from 'react-i18next';
import i18n from './index';
import type { Messages } from './server';

type I18nProviderProps = {
  children: ReactNode;
  initialLocale?: string;
  messages?: Messages;
};

export function I18nProvider({ children, initialLocale, messages }: I18nProviderProps) {
  const [isClient, setIsClient] = useState(false);

  // Initialize i18n with saved language preference
  useEffect(() => {
    // Check for saved language preference (client-side only)
    if (typeof window !== 'undefined') {
      const savedLang = localStorage.getItem('i18nextLng') || 
                       document.cookie.split(';').find(c => c.trim().startsWith('i18next='))?.split('=')[1];
      
      if (savedLang) {
        // Use saved language if available
        i18n.changeLanguage(savedLang);
      } else if (initialLocale) {
        // Otherwise use server-side detected locale
        const normalizedLocale = initialLocale === 'eng' ? 'en' : initialLocale === 'uzb' ? 'uz' : initialLocale;
        i18n.changeLanguage(normalizedLocale);
      }
    }

    // Inject server messages if provided
    if (messages && Object.keys(messages).length > 0 && initialLocale) {
      const normalizedLocale = initialLocale === 'eng' ? 'en' : initialLocale === 'uzb' ? 'uz' : initialLocale;
      try {
        const ns = 'translation';
        i18n.addResourceBundle(normalizedLocale, ns, messages, true, true);
        if (normalizedLocale !== initialLocale) {
          i18n.addResourceBundle(initialLocale, ns, messages, true, true);
        }
      } catch {
        // Silently fail
      }
    }
  }, [initialLocale, messages]);

  // Set up client-side initialization
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Set up language change listener
  useEffect(() => {
    if (!isClient) return;

    // Update document language when i18n language changes
    document.documentElement.lang = i18n.language;

    const handleLangChange = (lng: string) => {
      document.documentElement.lang = lng;
    };

    i18n.on('languageChanged', handleLangChange);
    return () => {
      i18n.off('languageChanged', handleLangChange);
    };
  }, [isClient]);

  if (!isClient) {
    return null;
  }

  return (
    <I18nextProvider i18n={i18n}>
      {children}
    </I18nextProvider>
  );
}
