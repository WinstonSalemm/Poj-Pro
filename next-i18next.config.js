import path from 'path';
/** @type {import('next-i18next').UserConfig} */
module.exports = {
  i18n: {
    defaultLocale: 'ru',
    locales: ['ru', 'en', 'uz'],
  },
  // Use absolute path so app router SSR can resolve files in all environments
  localePath: path.resolve('./public/locales'),
  reloadOnPrerender: process.env.NODE_ENV === 'development',
  ns: ['translation', 'supplies', 'aboutus'],
  defaultNS: 'translation',
  fallbackLng: 'ru',
  localeDetection: true,
}
