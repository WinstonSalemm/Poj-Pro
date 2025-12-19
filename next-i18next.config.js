import path from "path";
/** @type {import('next-i18next').UserConfig} */
module.exports = {
  i18n: {
    defaultLocale: "ru",
    locales: ["ru", "en", "uz"],
    localeDetection: true,
  },
  // Use absolute path so app router SSR can resolve files in all environments
  localePath: path.resolve("./public/locales"),
  reloadOnPrerender: process.env.NODE_ENV === "development",
  ns: ["common"],
  defaultNS: "common",
  fallbackLng: "ru",
  localeStructure: "{{lng}}/{{ns}}",
  load: "all",
  detection: {
    order: ["cookie", "htmlTag", "localStorage", "path", "subdomain"],
    caches: ["cookie"],
  },
};
