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
  'fire-hoses': {
    ru: 'Пожарные рукава',
    en: 'Fire Hoses',
    uz: 'Yong\'in shlanglari',
  },
  'fire-cabinets': {
    ru: 'Пожарные шкафы',
    en: 'Fire Cabinets',
    uz: 'Yong\'in shkaflari',
  },
  'fire-alarms': {
    ru: 'Пожарная сигнализация',
    en: 'Fire Alarms',
    uz: 'Yong\'in signalizatsiyasi',
  },
  'fire-blankets': {
    ru: 'Огнеупорные покрывала',
    en: 'Fire Blankets',
    uz: 'Yong\'inga chidamli yopqichlar',
  },
  'emergency-lighting': {
    ru: 'Аварийное освещение',
    en: 'Emergency Lighting',
    uz: 'Favqulodda yoritish',
  },
  'fire-safety-signs': {
    ru: 'Знаки пожарной безопасности',
    en: 'Fire Safety Signs',
    uz: 'Yong\'in xavfsizligi belgilar',
  },
  'firefighting-tools': {
    ru: 'Пожарный инструмент',
    en: 'Firefighting Tools',
    uz: 'Yong\'in o\'chirish asboblari',
  },
  'sprinkler-systems': {
    ru: 'Спринклерные системы',
    en: 'Sprinkler Systems',
    uz: 'Sprinkler tizimlari',
  },
  'fire-doors': {
    ru: 'Противопожарные двери',
    en: 'Fire Doors',
    uz: 'Yong\'inga chidamli eshiklar',
  },
  'smoke-detectors': {
    ru: 'Датчики дыма',
    en: 'Smoke Detectors',
    uz: 'Tutun detektorlari',
  },
  'fire-resistance-materials': {
    ru: 'Огнестойкие материалы',
    en: 'Fire-Resistant Materials',
    uz: 'Yong\'inga chidamli materiallar',
  },
  'fire-safety-equipment': {
    ru: 'Оборудование по пожарной безопасности',
    en: 'Fire Safety Equipment',
    uz: 'Yong\'in xavfsizligi uskunalari',
  },
  ppe: {
    ru: 'Средства индивидуальной защиты',
    en: 'Personal Protective Equipment',
    uz: 'Shaxsiy himoya vositalari',
  },
  'fire-extinguishing-systems': {
    ru: 'Системы пожаротушения',
    en: 'Fire Extinguishing Systems',
    uz: 'Yong\'inni o\'chirish tizimlari',
  },
  'fire-trucks': {
    ru: 'Пожарные машины',
    en: 'Fire Trucks',
    uz: 'Yong\'in mashinalari',
  },
  'fire-pumps': {
    ru: 'Пожарные насосы',
    en: 'Fire Pumps',
    uz: 'Yong\'in nasoslari',
  },
  'breathing-apparatus': {
    ru: 'Дыхательные аппараты',
    en: 'Breathing Apparatus',
    uz: 'Nafas olish apparatlari',
  },
  'fire-safety-cabinets': {
    ru: 'Шкафы безопасности',
    en: 'Fire Safety Cabinets',
    uz: 'Xavfsizlik shkaflari',
  },
  'fire-protection-systems': {
    ru: 'Системы противопожарной защиты',
    en: 'Fire Protection Systems',
    uz: 'Yong\'indan himoya tizimlari',
  },
  // Подставки и кронштейны
  'podstandkronshten': {
    ru: 'Подставки и кронштейны',
    en: 'Stands and Brackets',
    uz: 'Tayanchlar va shteynlar',
  },
  'podstavki-i-kronshteyny': {
    ru: 'Подставки и кронштейны',
    en: 'Stands and Brackets',
    uz: 'Tayanchlar va shteynlar',
  },
};

// Mapping from category slug to image filename
// This map only includes categories for which an image file actually exists.
export const CATEGORY_IMAGE_MAP: Record<string, string> = {
  'fire-extinguishers': 'ognetushiteli.png',
  'fire-hoses': 'rukava_i_pozharnaya_armatura.png',
  'fire-cabinets': 'pozharnye_shkafy.png',
  'fire-alarms': 'pozharnaya_signalizatsiya_i_svetozvukovye_ustroystva.png',
  'ppe': 'siz.png',
  'sprinkler-systems': 'sistemy_pozharotusheniya_sprinkler.png',
  // Extra mappings to reduce fallbacks
  'emergency-lighting': 'audiosistema_i_opoveschenie.png',
  'firefighting-tools': 'furnitura_dlya_ognetushiteley.png',
  'smoke-detectors': 'pozharnaya_signalizatsiya_i_svetozvukovye_ustroystva.png',
  'fire-hydrants': 'rukava_i_pozharnaya_armatura.png',
  'fire-doors': 'zamki_i_aksessuary.png',
  'fire-safety-equipment': 'oborudovanie_kontrolya_dostupa.png',
  'fire-extinguishing-systems': 'sistemy_pozharotusheniya_sprinkler.png',
  'fire-safety-cabinets': 'pozharnye_shkafy.png',
  'fire-protection-systems': 'kontrolnye_paneli_adresnye_pozharno_ohrannye.png',
  'fire-blankets': 'furnitura_dlya_ognetushiteley.png',
  'fire-safety-signs': 'sistemy_opovescheniya_o_pozhare_dsppa_abk.png',
  'fire-resistance-materials': 'oborudovanie_proizvodstva_npo_bolid_rossiya.png',
  'fire-trucks': 'monitory_i_krepleniya.png',
  'fire-pumps': 'istochniki_pitaniya.png',
  'breathing-apparatus': 'siz.png',
  // Подставки и кронштейны
  'podstandkronshten': 'furnitura_dlya_ognetushiteley.png',
  'podstavki-i-kronshteyny': 'furnitura_dlya_ognetushiteley.png',
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
  'fire-hoses': {
    title: { ru: 'Пожарные рукава — купить в Ташкенте | POJ PRO', en: '', uz: '' },
    description: { ru: 'Пожарные рукава 51/66/77, головки и стволы. Сертификаты, комплектация под объект, быстрая доставка по Ташкенту и Узбекистану.', en: '', uz: '' },
  },
  'fire-cabinets': {
    title: { ru: 'Пожарные шкафы — настенные и встраиваемые | POJ PRO', en: '', uz: '' },
    description: { ru: 'Шкафы для внутреннего пожарного водопровода. Комплектация под рукава и арматуру. Документы и оперативная поставка.', en: '', uz: '' },
  },
  'fire-alarms': {
    title: { ru: 'Пожарная сигнализация — панели, извещатели, оповещение | POJ PRO', en: '', uz: '' },
    description: { ru: 'Адресные/неадресные решения, датчики дыма/тепла, оповещатели. Подбор совместимых устройств, документы, доставка.', en: '', uz: '' },
  },
  'fire-doors': {
    title: { ru: 'Противопожарные двери — продажа и поставка | POJ PRO', en: '', uz: '' },
    description: { ru: 'Огнестойкие двери разных классов. Консультации по фурнитуре и доводчикам, документы, поставка по Узбекистану.', en: '', uz: '' },
  },
  'smoke-detectors': {
    title: { ru: 'Датчики дыма и тепла — купить в Ташкенте | POJ PRO', en: '', uz: '' },
    description: { ru: 'Датчики для раннего обнаружения пожара. Совместимы с адресными/неадресными системами. Подбор и доставка.', en: '', uz: '' },
  },
  'fire-safety-equipment': {
    title: { ru: 'Оборудование по пожарной безопасности | POJ PRO', en: '', uz: '' },
    description: { ru: 'Комплексные поставки: шкафы, рукава, стволы, знаки, огнетушители. Подбор под нормы, документы и логистика.', en: '', uz: '' },
  },
  ppe: {
    title: { ru: 'СИЗ — каски, очки, перчатки, респираторы | POJ PRO', en: '', uz: '' },
    description: { ru: 'Средства индивидуальной защиты под задачи и нормы. Готовые комплекты, документы, доставка по Узбекистану.', en: '', uz: '' },
  },
  'fire-extinguishing-systems': {
    title: { ru: 'Системы пожаротушения — спринклеры и модули | POJ PRO', en: '', uz: '' },
    description: { ru: 'Подбор по площади и классу пожара. Совместимость с системами безопасности, документация, поставка.', en: '', uz: '' },
  },
  'fire-hydrants': {
    title: { ru: 'Пожарные гидранты и комплектующие | POJ PRO', en: '', uz: '' },
    description: { ru: 'Подбор по давлению и диаметрам, совместимость с сетью. Сертифицированные решения, быстрая поставка.', en: '', uz: '' },
  },
  'fire-pumps': {
    title: { ru: 'Пожарные насосы и источники питания | POJ PRO', en: '', uz: '' },
    description: { ru: 'Насосы и ИБП для систем пожаротушения и оповещения. Подбор по проекту и гидравлике, поддержка и гарантия.', en: '', uz: '' },
  },
  'breathing-apparatus': {
    title: { ru: 'Дыхательные аппараты и комплектующие | POJ PRO', en: '', uz: '' },
    description: { ru: 'СИЗОД: баллоны, маски и аксессуары. Подбор под задачи, консультации по обслуживанию, документы.', en: '', uz: '' },
  },
  'fire-blankets': {
    title: { ru: 'Огнеупорные покрывала — купить в Ташкенте | POJ PRO', en: '', uz: '' },
    description: { ru: 'Огнеупорные покрывала для локализации возгораний и работ с горячими поверхностями. Сертификаты, доставка по Узбекистану.', en: '', uz: '' },
  },
  'emergency-lighting': {
    title: { ru: 'Аварийное освещение и оповещение | POJ PRO', en: '', uz: '' },
    description: { ru: 'Аварийные светильники, табло «Выход», блоки питания. Подбор под нормы, документы, поставка по Ташкенту и регионам.', en: '', uz: '' },
  },
  'fire-safety-signs': {
    title: { ru: 'Знаки пожарной безопасности — фотолюминесцентные | POJ PRO', en: '', uz: '' },
    description: { ru: 'Знаки и указатели эвакуации, пожарной безопасности и запрета. Соответствие ГОСТ, быстрая поставка.', en: '', uz: '' },
  },
  'firefighting-tools': {
    title: { ru: 'Пожарный инструмент и инвентарь | POJ PRO', en: '', uz: '' },
    description: { ru: 'Инструмент для пожарных постов: багры, ломы, ведра, ящики с песком. Комплектация узлов, доставка.', en: '', uz: '' },
  },
  'sprinkler-systems': {
    title: { ru: 'Спринклерные системы — комплектующие и узлы | POJ PRO', en: '', uz: '' },
    description: { ru: 'Спринклеры, коллекторы, арматура. Подбор по проекту и нормам, совместимость, документы и поставка.', en: '', uz: '' },
  },
  'fire-resistance-materials': {
    title: { ru: 'Огнестойкие материалы — решения для защиты | POJ PRO', en: '', uz: '' },
    description: { ru: 'Материалы для огнезащиты и изоляции. Подбор по узлам и классам огнестойкости, документация, поставка.', en: '', uz: '' },
  },
  'fire-trucks': {
    title: { ru: 'Пожарные машины и оборудование | POJ PRO', en: '', uz: '' },
    description: { ru: 'Оборудование и комплектующие для пожарной техники. Консультации, документы, поставка по запросу.', en: '', uz: '' },
  },
  'fire-safety-cabinets': {
    title: { ru: 'Шкафы безопасности — решения для хранения | POJ PRO', en: '', uz: '' },
    description: { ru: 'Шкафы безопасности и аксессуары. Подбор по задачам, документы и поставка по Узбекистану.', en: '', uz: '' },
  },
  'fire-protection-systems': {
    title: { ru: 'Системы противопожарной защиты | POJ PRO', en: '', uz: '' },
    description: { ru: 'Комплексные решения ППЗ: подбор совместимых узлов и оборудования, документация, логистика.', en: '', uz: '' },
  },
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
