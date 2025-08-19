import 'next-i18next';

declare module 'next-i18next' {
  interface TFunction {
    (key: string, options?: Record<string, unknown>): string;
    (key: string, defaultValue: string, options?: Record<string, unknown>): string;
  }

  interface UseTranslationResponse {
    t: TFunction;
    i18n: {
      language: string;
      changeLanguage: (lng: string) => Promise<void>;
    };
    ready: boolean;
  }
}
