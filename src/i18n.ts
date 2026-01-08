import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import translation files from src/locales
import ruTranslation from '@/locales/ru/translation.json';
import uzbTranslation from '@/locales/uzb/translation.json';
import engTranslation from '@/locales/eng/translation.json';

// Import additional namespaces from public/locales
import ruSEO from '../public/locales/ru/seo.json';
import uzSEO from '../public/locales/uz/seo.json';
import enSEO from '../public/locales/en/seo.json';

import ruCommon from '../public/locales/ru/common.json';
import uzCommon from '../public/locales/uz/common.json';
import enCommon from '../public/locales/en/common.json';

// Export resources for type definitions
export const resources = {
  ru: { 
    translation: ruTranslation,
    seo: ruSEO,
    common: ruCommon
  },
  uzb: { 
    translation: uzbTranslation,
    seo: uzSEO,
    common: uzCommon
  },
  eng: { 
    translation: engTranslation,
    seo: enSEO,
    common: enCommon
  },
  // Aliases for standard codes
  uz: {
    translation: uzbTranslation,
    seo: uzSEO,
    common: uzCommon
  },
  en: {
    translation: engTranslation,
    seo: enSEO,
    common: enCommon
  }
} as const;

// Get saved language from localStorage/cookie before init
const getSavedLanguage = (): string | undefined => {
  if (typeof window === 'undefined') return undefined;
  
  // Try localStorage first
  const savedLng = localStorage.getItem('i18nextLng');
  if (savedLng) return savedLng;
  
  // Try cookie
  const cookieLng = document.cookie
    .split(';')
    .find(c => c.trim().startsWith('i18next='))
    ?.split('=')[1];
  
  return cookieLng;
};

// Initialize i18n
i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    
    // Use saved language or default to 'ru'
    lng: getSavedLanguage() || 'ru',
    fallbackLng: 'ru',
    supportedLngs: ['ru', 'uzb', 'eng', 'uz', 'en'],
    
    // Default namespace
    defaultNS: 'translation',
    fallbackNS: 'translation',
    
    // Debug only in development
    debug: process.env.NODE_ENV === 'development',
    
    // Interpolation config
    interpolation: {
      escapeValue: false, // Not needed for React as it escapes by default
    },
    
    // Detection options
    detection: {
      order: ['localStorage', 'cookie', 'navigator'],
      caches: ['localStorage', 'cookie'],
      lookupCookie: 'i18next',
      lookupLocalStorage: 'i18nextLng',
    },
    
    // Disable loading via backend for now to avoid CORS issues
    initImmediate: false,
  });

export default i18n;
