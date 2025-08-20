// Prefer public URL for client, fall back to server-side SITE_URL, then localhost.
// Ensure no trailing slash for consistent concatenation.
const rawSiteUrl =
  (typeof process !== 'undefined' && process.env.NEXT_PUBLIC_SITE_URL) ||
  (typeof process !== 'undefined' && process.env.SITE_URL) ||
  'http://localhost:3000';

export const SITE_URL = rawSiteUrl.replace(/\/$/, '');
export const SITE_NAME = 'POJ PRO';

export const LOCALES = ['ru', 'en', 'uz'] as const;
export const DEFAULT_LOCALE = 'ru';

export const i18nAlt: Record<string, string> = {
  ru: 'ru-RU',
  en: 'en-US',
  uz: 'uz-UZ'
};

export const DEFAULT_KEYWORDS = [
  'пожарная безопасность',
  'огнетушители',
  'пожарное оборудование',
  'ПожПро',
  'средства пожаротушения',
  'пожарные шкафы',
  'пожарные краны',
  'пожарные рукава',
  'пожарная сигнализация',
  'противопожарное оборудование'
].join(', ');
