import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import translation files
import ruTranslation from '@/locales/ru/translation.json';
import uzbTranslation from '@/locales/uzb/translation.json';
import engTranslation from '@/locales/eng/translation.json';
import ruSupplies from '@/locales/ru/supplies.json';
import uzbSupplies from '@/locales/uzb/supplies.json';
import engSupplies from '@/locales/eng/supplies.json';

// Export resources for type definitions
export const resources = {
  ru: { 
    translation: ruTranslation,
    supplies: ruSupplies 
  },
  uzb: { 
    translation: uzbTranslation,
    supplies: uzbSupplies 
  },
  eng: { 
    translation: engTranslation,
    supplies: engSupplies 
  },
} as const;

// Initialize i18n
i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    
    // Default language
    lng: 'ru',
    fallbackLng: 'ru',
    supportedLngs: ['ru', 'uzb', 'eng'],
    
    // Debug only in development
    debug: process.env.NODE_ENV === 'development',
    
    // Interpolation config
    interpolation: {
      escapeValue: false, // Not needed for React as it escapes by default
    },
    
    // Detection options
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
    },
    
    // Disable loading via backend for now to avoid CORS issues
    initImmediate: false,
  });

export default i18n;
