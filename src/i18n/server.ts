import ru from '@/i18n/dictionaries/ru';
import en from '@/i18n/dictionaries/en';
import uz from '@/i18n/dictionaries/uz';

export type Locale = 'ru' | 'en' | 'uz';

export function normalizeLocale(input?: string | null): Locale {
  const s = (input || '').toLowerCase();
  // handle legacy/custom codes from client (eng/uzb)
  if (s === 'eng') return 'en';
  if (s === 'uzb') return 'uz';
  if (s.startsWith('en')) return 'en';
  if (s.startsWith('uz')) return 'uz';
  return 'ru';
}

// Dictionaries are plain nested objects
export type Messages = typeof ru;

const DICTS: Record<Locale, Messages> = {
  ru: ru,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  en: en as any, // Cast because en dictionary is incomplete
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  uz: uz as any, // Cast because uz dictionary is incomplete
};

export async function getDictionary(locale: Locale): Promise<Messages> {
  // Already statically imported and tree-shaken; keep async signature for flexibility
  return DICTS[locale] ?? DICTS.ru;
}
