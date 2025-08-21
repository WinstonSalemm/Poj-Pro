import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { getOptions, supportedLngs } from './settings';

// Import translations
import ruTranslation from '@/locales/ru/translation.json';
import engTranslation from '@/locales/eng/translation.json';
import uzbTranslation from '@/locales/uzb/translation.json';

type AboutUsSection = Record<string, unknown>;

export const resources = {
  ru: {
    translation: {
      ...ruTranslation,
      cookieConsent: {
        message: 'Мы используем cookie для хранения языка и содержимого корзины. Продолжая использовать сайт, вы соглашаетесь на их использование.',
        accept: 'Принять',
        close: 'Закрыть'
      }
    },
    aboutus: (ruTranslation as unknown as { aboutus?: AboutUsSection }).aboutus || {},
  },
  eng: {
    translation: {
      ...engTranslation,
      cookieConsent: {
        message: 'We use cookies to store language and cart contents. By continuing to use the site, you agree to their use.',
        accept: 'Accept',
        close: 'Close'
      }
    },
    aboutus: (engTranslation as unknown as { aboutus?: AboutUsSection }).aboutus || {},
  },
  // Alias standard code 'en' to the same resources as 'eng'
  en: {
    translation: {
      ...engTranslation,
      cookieConsent: {
        message: 'We use cookies to store language and cart contents. By continuing to use the site, you agree to their use.',
        accept: 'Accept',
        close: 'Close'
      }
    },
    aboutus: (engTranslation as unknown as { aboutus?: AboutUsSection }).aboutus || {},
  },
  uzb: {
    translation: {
      ...uzbTranslation,
      cookieConsent: {
        message: 'Biz til va savat tarkibini saqlash uchun cookie-fayllardan foydalanamiz. Saytdan foydalanishda siz ularning ishlatilishiga rozilik bildirasiz.',
        accept: 'Qabul qilish',
        close: 'Yopish'
      }
    },
    aboutus: (uzbTranslation as unknown as { aboutus?: AboutUsSection }).aboutus || {},
  },
  // Alias standard code 'uz' to the same resources as 'uzb'
  uz: {
    translation: {
      ...uzbTranslation,
      cookieConsent: {
        message: 'Biz til va savat tarkibini saqlash uchun cookie-fayllardan foydalanamiz. Saytdan foydalanishda siz ularning ishlatilishiga rozilik bildirasiz.',
        accept: 'Qabul qilish',
        close: 'Yopish'
      }
    },
    aboutus: (uzbTranslation as unknown as { aboutus?: AboutUsSection }).aboutus || {},
  },
} as const;

// Language detection configuration
const detectionOptions = {
  order: ['cookie', 'localStorage', 'navigator'],
  // Use the same cookie name the app sets everywhere
  lookupCookie: 'i18next',
  lookupLocalStorage: 'i18nextLng',
  caches: ['localStorage', 'cookie'],
  cookieMinutes: 60 * 24 * 365, // 1 year
  // Convert browser language to our supported codes
  convertDetectedLanguage: (lng: string): string => {
    const langMap: Record<string, string> = {
      en: 'eng',
      en_us: 'eng',
      en_gb: 'eng',
      uz: 'uzb',
      uz_uz: 'uzb',
      ru: 'ru',
      ru_ru: 'ru',
    };
    return langMap[lng.toLowerCase()] || 'ru';
  },
};

// Function to update language in both cookie and localStorage
export const updateLanguageStorage = (lng: string) => {
  if (typeof window === 'undefined') return;
  
  try {
    // Update localStorage
    localStorage.setItem('i18nextLng', lng);
    
    // Update cookie (1 year expiry)
    const expiryDate = new Date();
    expiryDate.setFullYear(expiryDate.getFullYear() + 1);
    // Keep both cookies for compatibility: primary 'i18next', legacy 'lang'
    document.cookie = `i18next=${lng}; expires=${expiryDate.toUTCString()}; path=/; SameSite=Lax`;
    document.cookie = `lang=${lng}; expires=${expiryDate.toUTCString()}; path=/; SameSite=Lax`;
  } catch (e) {
    console.warn('Failed to update language storage', e);
  }
};

// Listen for language changes and update storage
i18n.on('languageChanged', (lng: string) => {
  updateLanguageStorage(lng);
});

// Initialize i18next if not already initialized
if (!i18n.isInitialized) {
  i18n
    .use(initReactI18next)
    .use(LanguageDetector)
    .init({
      ...getOptions('ru', ['translation', 'aboutus']),
      ns: ['translation', 'aboutus'],
      defaultNS: 'aboutus',
      resources,
      detection: detectionOptions,
      supportedLngs: [...supportedLngs],
      load: 'languageOnly', // Only use language code without region
      cleanCode: true, // Clean language codes to match our supported formats
      nonExplicitSupportedLngs: true, // Allow non-explicit language codes to be matched
    });
}

export default i18n;
