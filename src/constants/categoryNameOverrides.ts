export type Lang = 'ru' | 'en' | 'uz';

export const CATEGORY_NAME_OVERRIDES: Record<
  string,
  Partial<Record<Lang, string>>
> = {
  // Audio and notification systems
  // Fire extinguishers and related
  'fire-extinguishers': { 
    ru: 'Огнетушители',
    en: 'Fire Extinguishers',
    uz: 'Yong\'in o\'chirgichlar'
  },
  'fire-hydrants': { 
    ru: 'Пожарные гидранты',
    en: 'Fire Hydrants',
    uz: 'Yong\'in gidrantlari'
  },
  'fire-hoses': { 
    ru: 'Пожарные рукава',
    en: 'Fire Hoses',
    uz: 'Yong\'in shlanglari'
  },
  'fire-cabinets': { 
    ru: 'Пожарные шкафы',
    en: 'Fire Cabinets',
    uz: 'Yong\'in shkaflari'
  },
  'fire-alarms': { 
    ru: 'Пожарная сигнализация',
    en: 'Fire Alarms',
    uz: 'Yong\'in signalizatsiyasi'
  },
  'fire-blankets': { 
    ru: 'Противопожарные одеяла',
    en: 'Fire Blankets',
    uz: 'Yong\'inga qarshi ko\'rpalar'
  },
  'fire-safety-signs': { 
    ru: 'Знаки пожарной безопасности',
    en: 'Fire Safety Signs',
    uz: 'Yong\'in xavfsizligi belgilari'
  },
  'sprinkler-systems': { 
    ru: 'Спринклерные системы',
    en: 'Sprinkler Systems',
    uz: 'Sovutish tizimlari'
  },
  'fire-doors': { 
    ru: 'Противопожарные двери',
    en: 'Fire Doors',
    uz: 'Yong\'inga qarshi eshiklar'
  },
  'smoke-detectors': { 
    ru: 'Детекторы дыма',
    en: 'Smoke Detectors',
    uz: 'Tutun detektorlari'
  },
  'ppe': { 
    ru: 'Средства индивидуальной защиты',
    en: 'Personal Protective Equipment',
    uz: 'Shaxsiy himoya vositalari'
  },
  'fire-extinguishing-systems': { 
    ru: 'Системы пожаротушения',
    en: 'Fire Extinguishing Systems',
    uz: 'Yong\'in o\'chirish tizimlari'
  },
  'fire-trucks': { 
    ru: 'Пожарные машины',
    en: 'Fire Trucks',
    uz: 'Yong\'in mashinalari'
  },
  'fire-pumps': { 
    ru: 'Пожарные насосы',
    en: 'Fire Pumps',
    uz: 'Yong\'in nasoslari'
  },
  'emergency-lighting': { 
    ru: 'Аудиосистема и оповещение',
    en: 'Audio and Notification Systems',
    uz: 'Audio tizimlari va xabarnomalar'
  },
  'breathing-apparatus': { 
    ru: 'Дыхательные аппараты',
    en: 'Breathing Apparatus',
    uz: 'Nafas olish apparatlari'
  },
  'fire-protection-systems': { 
    ru: 'Системы противопожарной защиты',
    en: 'Fire Protection Systems',
    uz: 'Yong\'indan himoya qilish tizimlari'
  },
  // Transliterated slugs from image/file names (CatalogImage) -> Russian labels
  'ognetushiteli': { ru: 'Огнетушители' },
  'ballony': { ru: 'Баллоны' },
  'dinamiki_potolochnye': { ru: 'Динамики потолочные' },
  'furnitura_dlya_ognetushiteley': { ru: 'Фурнитура для огнетушителей' },
  'istochniki_pitaniya': { ru: 'Источники питания' },
  'kontrolnye_paneli_adresnye_pozharno_ohrannye': { ru: 'Контрольные панели адресные пожарно-охранные' },
  'audiosistema_i_opoveschenie': { ru: 'Аудиосистема и оповещение' },
  'metakom': { ru: 'МЕТАКОМ' },
  'monitory_i_krepleniya': { ru: 'Мониторы и крепления' },
  'oborudovanie_kontrolya_dostupa': { ru: 'Оборудование контроля доступа' },
  'oborudovanie_proizvodstva_npo_bolid_rossiya': { ru: 'Оборудование производства НПО Болид (Россия)' },
  'paneli_gsm_i_besprovodnye_sistemy_ipro': { ru: 'Панели GSM и беспроводные системы iPRO' },
  'pozharnaya_signalizatsiya_i_svetozvukovye_ustroystva': { ru: 'Пожарная сигнализация и светозвуковые устройства' },
  'pozharnye_shkafy': { ru: 'Пожарные шкафы' },
  'rukava_i_pozharnaya_armatura': { ru: 'Рукава и пожарная арматура' },
  'sistemy_opovescheniya_o_pozhare_dsppa_abk': { ru: 'Системы оповещения о пожаре DSPPA, ABK' },
  'sistemy_pozharotusheniya_sprinkler': { ru: 'Системы пожаротушения (спринклер)' },
  'siz': { ru: 'Средства индивидуальной защиты' },
  'tsifral': { ru: 'Цифрал' },
  'usiliteli': { ru: 'Усилители' },
  'videoregistratory_usiliteli_signala_haby': { ru: 'Видеорегистраторы, усилители сигнала, хабы' },
  'zamki_i_aksessuary': { ru: 'Замки и аксессуары' },

  // SIZ (PPE) subcategories
  'siz_zashita_golovy': {
    ru: 'Защита головы',
    en: 'Head Protection',
    uz: 'Boshni himoya qilish',
  },
  'siz_zashita_dyhaniya': {
    ru: 'Защита дыхания',
    en: 'Respiratory Protection',
    uz: 'Nafas olishni himoya qilish',
  },
  'siz_zashita_glaz': {
    ru: 'Защита глаз',
    en: 'Eye Protection',
    uz: 'Koʻzni himoya qilish',
  },
  'siz_zashita_ruk': {
    ru: 'Защита рук',
    en: 'Hand Protection',
    uz: 'Qoʻllarni himoya qilish',
  },
  'siz_odezhda': {
    ru: 'Защитная одежда',
    en: 'Protective Clothing',
    uz: 'Himoya kiyimi',
  },
  'siz_komplekty': {
    ru: 'Комплекты СИЗ',
    en: 'PPE Kits',
    uz: 'SIZ toʻplamlari',
  }
};
