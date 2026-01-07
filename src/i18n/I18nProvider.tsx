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

  // Initialize i18n with the initial locale and preload messages
  useEffect(() => {
    if (!initialLocale) return;

    // Normalize locale: convert legacy codes to standard codes
    const normalizedLocale = initialLocale === 'eng' ? 'en' : initialLocale === 'uzb' ? 'uz' : initialLocale;

    try {
      if (messages && Object.keys(messages).length > 0) {
        // Inject server-loaded messages into the default namespace
        const ns = 'translation';
        // Deep merge enabled (true, true) to not overwrite existing keys
        // Add messages for both normalized and original locale codes for compatibility
        i18n.addResourceBundle(normalizedLocale, ns, messages, true, true);
        if (normalizedLocale !== initialLocale) {
          i18n.addResourceBundle(initialLocale, ns, messages, true, true);
        }
      }
      // Only change language if it's different and not already set by user interaction
      // Check if language was manually set by checking if it matches a standard code
      const currentLang = i18n.language?.toLowerCase() || '';
      const isManuallySet = ['en', 'uz', 'ru'].includes(currentLang);
      
      if (!isManuallySet && i18n.language !== normalizedLocale) {
        i18n.changeLanguage(normalizedLocale);
      }
    } catch {
      // Fail-safe: still attempt to set language only if not manually set
      const currentLang = i18n.language?.toLowerCase() || '';
      const isManuallySet = ['en', 'uz', 'ru'].includes(currentLang);
      
      if (!isManuallySet && i18n.language !== normalizedLocale) {
        i18n.changeLanguage(normalizedLocale);
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
