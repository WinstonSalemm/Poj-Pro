// List of all available product categories
export const CATEGORIES = [
  'fire-extinguishers',
  'fire-hydrants',
  'fire-hoses',
  'fire-cabinets',
  'fire-alarms',
  'fire-blankets',
  'emergency-lighting',
  'fire-safety-signs',
  'firefighting-tools',
  'sprinkler-systems',
  'fire-doors',
  'smoke-detectors',
  'fire-resistance-materials',
  'fire-safety-equipment',
  'ppe',
  'fire-extinguishing-systems',
  'fire-trucks',
  'fire-pumps',
  'breathing-apparatus',
  'fire-safety-cabinets',
  'fire-protection-systems'
] as const;

export type Category = typeof CATEGORIES[number];

// Category display names for different languages
export const CATEGORY_NAMES: Record<string, Record<string, string>> = {
  'fire-extinguishers': {
    ru: 'Огнетушители',
    en: 'Fire Extinguishers',
    uz: 'Yong\'in o\'chirgichlar',
  },
  'fire-hydrants': {
    ru: 'Пожарные гидранты',
    en: 'Fire Hydrants',
    uz: 'Yong\'in gidrantlari',
  },
  // Add other categories with translations...
};

// Category descriptions for SEO
interface CategoryMeta {
  title: Record<string, string>;
  description: Record<string, string>;
}

export const CATEGORY_META: Record<string, CategoryMeta> = {
  'fire-extinguishers': {
    title: {
      ru: 'Купить огнетушители в Ташкенте | POJ PRO',
      en: 'Buy Fire Extinguishers in Tashkent | POJ PRO',
      uz: 'Toshkentda yong\'in o\'chirgichlar sotib olish | POJ PRO',
    },
    description: {
      ru: 'Широкий выбор огнетушителей по выгодным ценам. Официальный дилер, гарантия качества, доставка по Узбекистану.',
      en: 'Wide range of fire extinguishers at competitive prices. Official dealer, quality guarantee, delivery across Uzbekistan.',
      uz: 'Keng doiradagi yong\'in o\'chirgichlar arzon narxlarda. Rasmiy diler, sifat kafolati, O\'zbekiston bo\'ylab yetkazib berish.',
    },
  },
  // Add meta for other categories...
};

// Helper function to get category name by slug and language
export function getCategoryName(slug: string, lang: string): string {
  return CATEGORY_NAMES[slug]?.[lang] || slug;
}

// Helper function to get category meta by slug and language
export function getCategoryMeta(slug: string, lang: string) {
  const meta = CATEGORY_META[slug] || {
    title: { ru: '', en: '', uz: '' },
    description: { ru: '', en: '', uz: '' },
  };
  
  return {
    title: meta.title[lang] || meta.title['ru'],
    description: meta.description[lang] || meta.description['ru'],
  };
}
