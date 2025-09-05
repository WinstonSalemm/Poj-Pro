import type { Locale } from './types';

type Rule = { pattern: RegExp; to: () => string };
const DICT: Record<Locale, Rule[]> = {
  ru: [
    { pattern: /огнетушитель\s*ОП-?5/gi, to: () => '/catalog/ognetushiteli/op-5' },
  ],
  uz: [
    { pattern: /o'g'ni o'chirgich\s*OP-?5/gi, to: () => '/uz/catalog/ognetushiteli/op-5' },
  ],
  en: [
    { pattern: /extinguisher\s*OP-?5/gi, to: () => '/en/catalog/ognetushiteli/op-5' },
  ],
};

export function autoLinkHTML(html: string, locale: Locale): string {
  const rules = DICT[locale] || [];
  let out = html;
  for (const r of rules) {
    out = out.replace(r.pattern, (match: string) => `<a href="${r.to()}">${match}</a>`);
  }
  return out;
}
