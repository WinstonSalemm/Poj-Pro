export const defaultNS = 'translation';
export const cookieName = 'i18next';

export const supportedLngs = ['ru', 'eng', 'uzb'] as const;
export type SupportedLanguage = typeof supportedLngs[number];

export function getOptions(lng: SupportedLanguage = 'ru', ns: string | string[] = defaultNS) {
  return {
    debug: process.env.NODE_ENV === 'development',
    supportedLngs: [...supportedLngs],
    fallbackLng: 'ru',
    lng,
    fallbackNS: 'translation',
    defaultNS,
    ns,
    returnNull: false,
    interpolation: {
      escapeValue: false, // React already escapes values
    },
    react: {
      useSuspense: false, // Disable Suspense for better SSR compatibility
    },
    cleanCode: true,
  };
}
