export const SITE_URL = 'https://pojpro.uz';
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
