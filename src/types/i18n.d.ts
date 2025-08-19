import 'i18next';
import type { resources } from '../i18n';

declare module 'i18next' {
  interface CustomTypeOptions {
    defaultNS: 'translation';
    resources: {
      translation: typeof resources.ru.translation & {
        showLess: string;
        tryDifferentSearch: string;
      };
    };
  }
}
