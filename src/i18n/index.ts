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
      },
      preOrderBanner: {
        title: 'Товар по предзаказу',
        body: 'Мы подготовим для вас выгодное коммерческое предложение и доставим товар быстро, качественно и по лучшей цене.',
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
      },
      preOrderBanner: {
        title: 'Pre-order item',
        body: 'We will prepare a favorable commercial offer for you and deliver the goods quickly, with quality, and at the best price.',
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
      },
      preOrderBanner: {
        title: 'Pre-order item',
        body: 'We will prepare a favorable commercial offer for you and deliver the goods quickly, with quality, and at the best price.',
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
      },
      preOrderBanner: {
        title: 'Oldindan buyurtma',
        body: 'Siz uchun qulay tijorat taklifini tayyorlaymiz va tovarni tez, sifatli va eng yaxshi narxda yetkazib beramiz.',
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
      },
      preOrderBanner: {
        title: 'Oldindan buyurtma',
        body: 'Siz uchun qulay tijorat taklifini tayyorlaymiz va tovarni tez, sifatli va eng yaxshi narxda yetkazib beramiz.',
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
  // Only convert navigator language, not manually set languages
  convertDetectedLanguage: (lng: string): string => {
    // If language is already one of our supported codes, keep it as-is
    const supported = ['ru', 'eng', 'uzb', 'en', 'uz'];
    const normalized = lng.toLowerCase().split('-')[0];
    if (supported.includes(normalized)) {
      return normalized;
    }
    // Only convert browser-detected languages
    const langMap: Record<string, string> = {
      en: 'en', // Keep standard codes for manual switching
      en_us: 'en',
      en_gb: 'en',
      uz: 'uz', // Keep standard codes for manual switching
      uz_uz: 'uz',
      ru: 'ru',
      ru_ru: 'ru',
    };
    return langMap[normalized] || 'ru';
  },
};

// Function to update language in both cookie and localStorage
export const updateLanguageStorage = (lng: string) => {
  if (typeof window === 'undefined') return;
  
  try {
    // Normalize language code for storage (keep standard codes: en, uz, ru)
    const normalizedLng = lng.toLowerCase().split('-')[0];
    const storageLng = normalizedLng === 'eng' ? 'en' : normalizedLng === 'uzb' ? 'uz' : normalizedLng;
    
    // Map to backend code for API compatibility
    const backendLng = storageLng === 'en' ? 'eng' : storageLng === 'uz' ? 'uzb' : storageLng;
    
    // Update localStorage with standard code
    localStorage.setItem('i18nextLng', storageLng);
    
    // Update cookie (1 year expiry)
    const expiryDate = new Date();
    expiryDate.setFullYear(expiryDate.getFullYear() + 1);
    // Keep both cookies for compatibility: primary 'i18next' uses standard codes, legacy 'lang' uses backend codes
    document.cookie = `i18next=${storageLng}; expires=${expiryDate.toUTCString()}; path=/; SameSite=Lax`;
    document.cookie = `lang=${backendLng}; expires=${expiryDate.toUTCString()}; path=/; SameSite=Lax`;
  } catch (e) {
    console.warn('Failed to update language storage', e);
  }
};

// Listen for language changes and update storage
// Use a flag to prevent recursive updates
let isUpdatingLanguage = false;
i18n.on('languageChanged', (lng: string) => {
  if (!isUpdatingLanguage) {
    isUpdatingLanguage = true;
    updateLanguageStorage(lng);
    // Reset flag after a short delay to allow the update to complete
    setTimeout(() => {
      isUpdatingLanguage = false;
    }, 100);
  }
});

// Initialize i18next if not already initialized
if (!i18n.isInitialized) {
  i18n
    .use(initReactI18next)
    .use(LanguageDetector)
    .init({
      ...getOptions('ru', ['translation', 'aboutus', 'common']),
      ns: ['translation', 'aboutus', 'common'],
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
