/** @type {import('next-i18next').UserConfig} */
module.exports = {
  i18n: {
    defaultLocale: 'ru',
    locales: ['ru', 'eng', 'uzb'],
  },
  localePath: './public/locales',
  reloadOnPrerender: process.env.NODE_ENV === 'development',
  ns: ['translation', 'supplies', 'aboutus'],
  defaultNS: 'aboutus',
  fallbackLng: 'ru',
  localeDetection: true,
}
