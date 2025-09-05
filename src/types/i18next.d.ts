import 'i18next';
import { SEOContent } from '@/i18n/seo.types';

declare module 'i18next' {
  interface CustomTypeOptions {
    defaultNS: 'seo' | 'translation';
    resources: {
      seo: SEOContent;
      translation: typeof import('../../public/locales/en/translation.json');
    };
  }
}

declare module 'react-i18next' {
  import { SEOSection } from '@/i18n/seo.types';
  
  type DefaultTFuncReturn = string;
  
  interface TFunction {
    <TResult = string, TKeys extends string = string>(
      key: TKeys | TKeys[],
      options?: Record<string, unknown> | string | null,
      defaultValue?: string
    ): TResult;
    
    <TResult = unknown, TKeys extends SEOSection = SEOSection>(
      key: TKeys | TKeys[],
      options?: { returnObjects: true } & Record<string, unknown>,
      defaultValue?: string
    ): TResult;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface UseTranslationResponse<N extends string = 'seo'> {
    t: TFunction;
    i18n: {
      language: string;
      changeLanguage: (lng: string) => Promise<void>;
    };
    ready: boolean;
  }
  
  function useTranslation<N extends string = 'seo'>(
    ns?: N | ReadonlyArray<N>,
    options?: {
      keyPrefix?: string;
    }
  ): UseTranslationResponse<N>;
}
