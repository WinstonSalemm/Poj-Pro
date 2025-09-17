export type Lang = 'ru' | 'en' | 'uz';

export interface BuildParams {
  lang: Lang;
  categoryKey?: string; // e.g. 'fire-extinguishers', 'fire-hoses'
  categoryName: string; // display name for H2
}

// Single source of truth for policy bits
// Use narrow no-break spaces U+202F for readability: 5 000 000
const FREE_DELIVERY_TASHKENT = '5 000 000';

const COMMON = {
  // Headings
  h2: {
    ru: (name: string) => `Почему стоит выбрать ${name} в POJ PRO`,
    en: (name: string) => `Why choose ${name} from POJ PRO`,
    uz: (name: string) => `Nega ${name} — POJ PRO dan`,
  },
  whoWeAreTitle: {
    ru: 'Кто мы: POJ PRO',
    en: 'Who we are: POJ PRO',
    uz: 'Biz kimmiz: POJ PRO',
  },
  whoWeAreText: {
    ru: '<strong>POJ PRO — поставщик.</strong> Мы <strong>продаём</strong>, <strong>подсказываем</strong> и <strong>консультируем</strong>. <strong>Мы не выполняем монтаж</strong>. Помогаем собрать комплектность и документы, чтобы вы безопасно и быстро внедрили решение.',
    en: '<strong>POJ PRO is a supplier.</strong> We <strong>sell</strong>, <strong>advise</strong> and <strong>consult</strong>. <strong>We are not installers</strong>. We help you assemble a compliant set with documents so you implement it safely and quickly.',
    uz: '<strong>POJ PRO — ta’minotchi.</strong> Biz <strong>sotamiz</strong>, <strong>maslahat beramiz</strong> va <strong>konsultatsiya</strong> qilamiz. <strong>Montaj qilmaymiz</strong>. Hujjatlar bilan mos to‘plamni tez va xavfsiz joriy etishga yordam beramiz.',
  },
  criteriaTitle: {
    ru: 'Ключевые критерии выбора',
    en: 'Key selection criteria',
    uz: 'Asosiy tanlash mezonlari',
  },
  criteriaList: {
    ru: [
      'Класс риска и назначение объекта — подберём совместимые модели и аксессуары.',
      'Условия эксплуатации — температура, влажность, пыль, вибрации, доступ.',
      'Наличие и сроки — сообщим актуальные остатки и предложим альтернативы.',
      'Сервис — маркировка, пломбы, журналы, регламент осмотров.',
    ],
    en: [
      'Risk class and use case — compatible models and accessories.',
      'Operating conditions — temperature, humidity, dust, vibration, access.',
      'Availability and timing — stock updates and alternatives.',
      'Service — labeling, sealing, journals, inspection schedule.',
    ],
    uz: [
      'Xavf darajasi va vazifa — mos modellar va aksessuarlar.',
      'Ish sharoitlari — harorat, namlik, chang, tebranish, kirish.',
      'Mavjudlik va muddatlar — zaxira va alternativlar.',
      'Xizmat — yorliqlash, plomba, jurnal va ko‘riklar.',
    ],
  },
  docsTitle: { ru: 'Документы и соответствие', en: 'Documentation and compliance', uz: 'Hujjatlar va muvofiqlik' },
  docsText: {
    ru: 'Предоставим паспорта, сертификаты и инструкции. Поможем подготовить пакет документов для внутренних проверок.',
    en: 'We provide passports, certificates and instructions. We can help prepare a document set for internal checks.',
    uz: 'Pasport, sertifikat va yo‘riqnoma taqdim etamiz. Ichki tekshiruvlar uchun hujjatlar to‘plamini tayyorlashda yordam beramiz.',
  },
  logisticsTitle: { ru: 'Логистика и доставка', en: 'Logistics and delivery', uz: 'Logistika va yetkazib berish' },
  logisticsText: {
    ru: `<strong>Доставка под ключ по предоплате.</strong> <strong>По Ташкенту — бесплатно от ${FREE_DELIVERY_TASHKENT} сум</strong> (ниже порога — по тарифу). По регионам — транспортными компаниями. Возможны поэтапные отгрузки и резервирование на складе под ваш график.`,
    en: `<strong>Turnkey delivery on prepayment.</strong> <strong>Tashkent — free from ${FREE_DELIVERY_TASHKENT} UZS</strong> (below threshold — by tariff). Regions — via transport companies. Staged deliveries and warehouse reservation are available.`,
    uz: `<strong>Oldindan to‘lov bilan “kalit topshirish”.</strong> <strong>Toshkent — ${FREE_DELIVERY_TASHKENT} so‘mdan bepul</strong> (porgacha — tarif bo‘yicha). Mintaqalarga — transport kompaniyalari. Bosqichma‑bosqich yetkazib berish va omborda bron qilish mumkin.`,
  },
  tcoTitle: { ru: 'Экономика владения (TCO)', en: 'Total cost of ownership (TCO)', uz: 'Umumiy egalik qiymati (TCO)' },
  tcoText: {
    ru: 'Сопоставим решения с разной начальной стоимостью и затратами на обслуживание. Найдём баланс бюджета, долговечности и удобства.',
    en: 'We compare solutions with different upfront and service costs to balance budget, durability and convenience.',
    uz: 'Boshlang‘ich va xizmat xarajatlari turlicha bo‘lgan yechimlarni solishtirib, byudjet, chidamlilik va qulaylik o‘rtasida muvozanat topamiz.',
  },
  warrantyTitle: { ru: 'Гарантия и поддержка', en: 'Warranty and support', uz: 'Kafolat va qo‘llab-quvvatlash' },
  warrantyText: {
    ru: 'Гарантия на поставку. Контролируем комплектацию, упаковку и маркировку. Быстро отвечаем на запросы после поставки.',
    en: 'Warranty on supply. We control completeness, packaging and labeling. Fast responses to post‑delivery questions.',
    uz: 'Kafolat. Komplektlik, o‘rash va markirovkani nazorat qilamiz. Yetkazib berilgandan so‘ng savollarga tez javob beramiz.',
  },
  orderTitle: { ru: 'Как заказать', en: 'How to order', uz: 'Qanday buyurtma berish' },
  orderText: {
    ru: 'Отправьте параметры и количество. Подготовим несколько конфигураций с ценами и сроками, согласуем график и документы.',
    en: 'Send parameters and quantity. We prepare several configurations with prices and lead times, agree on the schedule and documents.',
    uz: 'Parametrlar va miqdorni yuboring. Bir necha konfiguratsiyani narx va muddatlar bilan tayyorlaymiz, jadval va hujjatlarni kelishamiz.',
  },
  conclusionTitle: { ru: 'Итог', en: 'Conclusion', uz: 'Xulosa' },
  conclusionText: {
    ru: (name: string) => `${name} — это не только соответствие нормам, но и удобство эксплуатации и прозрачная экономика владения. Мы поможем выбрать оптимальный вариант под ваш объект и бюджет.`,
    en: (name: string) => `${name} is not only about compliance — it’s about ease of use and transparent ownership cost. We’ll help you choose the optimal option for your site and budget.`,
    uz: (name: string) => `${name} faqat moslik emas — balki qulay foydalanish va shaffof egalik qiymati haqida. Obyektingiz va byudjetingiz uchun optimal variantni tanlashga yordam beramiz.`,
  },
};

// Category‑specific inserts (translated), kept concise and consistent
const SPECIFICS: Record<string, { title: Record<Lang, string>; items: Record<Lang, string[]> }> = {
  'fire-extinguishers': {
    title: { ru: 'Типы и применение', en: 'Types and application', uz: 'Turlar va qo‘llanishi' },
    items: {
      ru: [
        'Порошковые (ОП) — классы А/В/С и электроустановки.',
        'Углекислотные (ОУ) — электрооборудование и точечные очаги.',
        'Воздушно‑пенные (ОВП) — жидкости и твёрдые материалы.',
        'Передвижные — увеличенный запас ОТВ для больших площадей.',
      ],
      en: [
        'Powder (OP) — classes A/B/C and electrical systems.',
        'CO₂ (OU) — electrical equipment and spot fires.',
        'Foam (OVP) — liquids and solid materials.',
        'Mobile — larger agent supply for large areas.',
      ],
      uz: [
        'Kukunli (OP) — A/B/C sinflari va elektro‑uskunalar.',
        'CO₂ (OU) — elektro‑uskunalar va lokal o‘choqlar.',
        'Ko‘pikli (OVP) — suyuqliklar va qattiq materiallar.',
        'Aravachali — katta maydonlar uchun O‘TV zaxirasi katta.',
      ],
    },
  },
  'fire-hoses': {
    title: { ru: 'Рукава и комплектующие', en: 'Hoses and components', uz: 'Rukavlar va komplektlar' },
    items: {
      ru: [
        'Рукава 51/66/77 — с учётом давления и длины.',
        'ГР‑головки, стволы, шкафы и крепления.',
        'Совместимость по присоединениям и рабочему давлению.',
      ],
      en: [
        'Hoses 51/66/77 — pressure and length matched.',
        'Couplings, nozzles, cabinets and brackets.',
        'Compatibility by connections and working pressure.',
      ],
      uz: [
        '51/66/77 rukavlar — bosim va uzunlik bo‘yicha.',
        'GR ulagichlar, stvol, shkaf va kronshteynlar.',
        'Ulanish va ish bosimi bo‘yicha moslik.',
      ],
    },
  },
};

function ul(items: string[]): string {
  return `<ul>\n${items.map((i) => `  <li>${i}</li>`).join('\n')}\n</ul>`;
}

export function buildCategoryLongContent({ lang, categoryKey, categoryName }: BuildParams): string {
  const parts: string[] = [];

  // H2
  parts.push(`<h2>${COMMON.h2[lang](categoryName)}</h2>`);

  // Who we are
  parts.push(`<h3>${COMMON.whoWeAreTitle[lang]}</h3>`);
  parts.push(`<p>${COMMON.whoWeAreText[lang]}</p>`);

  // Category specifics (if known)
  const spec = categoryKey && SPECIFICS[categoryKey];
  if (spec) {
    parts.push(`<h3>${spec.title[lang]}</h3>`);
    parts.push(ul(spec.items[lang]));
  }

  // Criteria
  parts.push(`<h3>${COMMON.criteriaTitle[lang]}</h3>`);
  parts.push(ul(COMMON.criteriaList[lang]));

  // Docs
  parts.push(`<h3>${COMMON.docsTitle[lang]}</h3>`);
  parts.push(`<p>${COMMON.docsText[lang]}</p>`);

  // Logistics
  parts.push(`<h3>${COMMON.logisticsTitle[lang]}</h3>`);
  parts.push(`<p>${COMMON.logisticsText[lang]}</p>`);

  // TCO
  parts.push(`<h3>${COMMON.tcoTitle[lang]}</h3>`);
  parts.push(`<p>${COMMON.tcoText[lang]}</p>`);

  // Warranty
  parts.push(`<h3>${COMMON.warrantyTitle[lang]}</h3>`);
  parts.push(`<p>${COMMON.warrantyText[lang]}</p>`);

  // Order
  parts.push(`<h3>${COMMON.orderTitle[lang]}</h3>`);
  parts.push(`<p>${COMMON.orderText[lang]}</p>`);

  // Conclusion
  parts.push(`<h3>${COMMON.conclusionTitle[lang]}</h3>`);
  parts.push(`<p>${COMMON.conclusionText[lang](categoryName)}</p>`);

  return parts.join('\n\n');
}
