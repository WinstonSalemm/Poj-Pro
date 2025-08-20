import ru from '@/imports/ru.json';
import en from '@/imports/en.json';
import uz from '@/imports/uz.json';

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
