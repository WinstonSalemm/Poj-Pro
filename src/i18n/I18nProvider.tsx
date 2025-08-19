'use client';

import { ReactNode, useEffect, useState } from 'react';
import { I18nextProvider } from 'react-i18next';
import i18n from './index';

type I18nProviderProps = {
  children: ReactNode;
  initialLocale?: string;
};

export function I18nProvider({ children, initialLocale }: I18nProviderProps) {
  const [isClient, setIsClient] = useState(false);

  // Initialize i18n with the initial locale if provided
  useEffect(() => {
    if (initialLocale && i18n.language !== initialLocale) {
      i18n.changeLanguage(initialLocale);
    }
  }, [initialLocale]);

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
