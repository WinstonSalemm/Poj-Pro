import ru from '@/i18n/dictionaries/ru';
import en from '@/i18n/dictionaries/en';
import uz from '@/i18n/dictionaries/uz';

export type Locale = 'ru' | 'en' | 'uz';

export function normalizeLocale(input?: string | null): Locale {
  const s = (input || '').toLowerCase();
  if (s.startsWith('en')) return 'en';
  if (s.startsWith('uz')) return 'uz';
  return 'ru';
}

// Dictionaries are plain nested objects
export type Messages = Record<string, unknown>;

const DICTS: Record<Locale, Messages> = {
  ru: ru as Messages,
  en: en as Messages,
  uz: uz as Messages,
};

export async function getDictionary(locale: Locale): Promise<Messages> {
  // Already statically imported and tree-shaken; keep async signature for flexibility
  return DICTS[locale] ?? DICTS.ru;
}
