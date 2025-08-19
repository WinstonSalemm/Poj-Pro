import 'i18next';

declare module 'i18next' {
  interface CustomTypeOptions {
    defaultNS: 'translation';
    resources: {
      translation: typeof import('../../public/locales/en/translation.json');
    };
  }
}

declare module 'react-i18next' {
  type DefaultTFuncReturn = string;
  
  interface TFunction {
    <TResult = string, TKeys = string>(
      key: TKeys | TKeys[],
      options?: Record<string, unknown> | string | null,
      defaultValue?: string
    ): TResult;
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
