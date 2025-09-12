// Site configuration with SEO defaults

// Prefer public URL for client, fall back to server-side SITE_URL, then default to canonical prod domain.
// Ensure no trailing slash for consistent concatenation.
const rawSiteUrl =
  (typeof process !== 'undefined' && process.env.NEXT_PUBLIC_SITE_URL) ||
  (typeof process !== 'undefined' && process.env.SITE_URL) ||
  'https://poj-pro.uz';

export const SITE_URL = rawSiteUrl.replace(/\/$/, '');
export const SITE_NAME = 'POJ PRO';

export const LOCALES = ['ru', 'en', 'uz'] as const;
export const DEFAULT_LOCALE = 'ru';

// i18n configuration
export const i18nAlt: Record<string, string> = {
  ru: 'ru_RU',
  en: 'en_US',
  uz: 'uz_UZ'
};

// Social media handles
export const SOCIAL = {
  twitter: '@pojpro',
  facebook: 'pojpro.uz',
  instagram: 'pojpro.uz',
};

// Default SEO configuration
export const DEFAULT_SEO = {
  title: 'POJ PRO - Пожарное оборудование и средства безопасности',
  description: 'Профессиональное пожарное оборудование и средства безопасности в Ташкенте. Огнетушители, пожарные краны, сигнализация и другое оборудование для вашей безопасности.',
  image: `${SITE_URL}/images/og-default.jpg`,
  twitterCard: 'summary_large_image',
  siteName: SITE_NAME,
  locale: 'ru_RU',
  type: 'website',
};

// Default meta keywords
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
