// src/constants/categorySeo.ts
// Centralized SEO content (intro + FAQ) per category slug
// Use normalized slug with hyphens e.g. 'fire-extinguishers', 'rukava-i-armatura'

export type FAQ = { question: string; answer: string };

export type CategorySEO = {
  alias?: string[]; // alternate slugs that should map to this one
  intro?: string[]; // paragraphs of text shown under H1 (legacy, ru-only)
  introByLang?: { ru?: string[]; en?: string[]; uz?: string[] }; // localized intros
  links?: { href: string; label: string }[]; // internal links to LP / category
  faqs?: FAQ[];
};

export const CATEGORY_SEO: Record<string, CategorySEO> = {
  // Огнетушители
  'fire-extinguishers': {
    alias: ['ognetushiteli'],
    intro: [
      'В нашем магазине вы можете купить огнетушители в Ташкенте с доставкой и официальными сертификатами. В наличии порошковые ОП‑2/ОП‑5/ОП‑10 и углекислотные ОУ‑3/ОУ‑5. Помогаем подобрать для офиса, магазина, склада и авто.',
      'Предоставляем сервис: перезарядка, плановое обслуживание и обучение персонала. Цены прозрачные — отправим КП и прайс. Быстрая доставка по Ташкенту и всей Республике Узбекистан.',
    ],
    introByLang: {
      ru: [
        'Купить огнетушители в Ташкенте с доставкой и официальными сертификатами. В наличии порошковые ОП‑2/ОП‑5/ОП‑10 и углекислотные ОУ‑3/ОУ‑5.',
        'Перезарядка и обслуживание. Отправим КП и прайс. Быстрая доставка по Узбекистану.',
      ],
      en: [
        'Buy fire extinguishers in Tashkent with delivery and official certificates. In stock: powder OP‑2/OP‑5/OP‑10 and CO₂ OU‑3/OU‑5.',
        'Recharge and maintenance. We will send a quote and price list. Fast delivery across Uzbekistan.',
      ],
      uz: [
        'Toshkentda o‘t o‘chirgichlar — yetkazib berish va rasmiy sertifikatlar bilan. Omborda: kukunli OP‑2/OP‑5/OP‑10 va CO₂ OU‑3/OU‑5.',
        'Qayta zaryadlash va servis. KP va price-list yuboramiz. Oʻzbekiston bo‘ylab tez yetkazib berish.',
      ],
    },
    links: [
      { href: '/catalog/ognetushiteli', label: 'огнетушители ташкент купить' },
      { href: '/catalog/ognetushiteli', label: 'каталог огнетушителей' },
    ],
    faqs: [
      { question: 'Какие огнетушители подходят для офиса?', answer: 'Для офисов чаще всего используют порошковые ОП‑4/ОП‑5 и углекислотные ОУ‑3/ОУ‑5 для электрооборудования.' },
      { question: 'Где купить огнетушители в Ташкенте?', answer: 'В POJ PRO: продажа, доставка по Ташкенту и Узбекистану, сертификаты, гарантия, обслуживание и перезарядка.' },
      { question: 'Доставляете по Ташкенту и регионам?', answer: 'Да, доставка по Ташкенту и всей Республике Узбекистан. Сроки зависят от наличия и объёма заказа.' },
    ],
  },
  // Пожарные рукава и арматура
  'fire-hoses': {
    alias: ['rukava-i-pozharnaya-armatura', 'rukava_i_pozharnaya_armatura'],
    intro: [
      'Пожарные рукава в наличии и под заказ: типоразмеры 51/66/77, напорные РПМ(В). Подберём совместимые головки, стволы и шкафы для внутреннего пожарного водопровода.',
      'Предоставляем сертификаты соответствия, сборку комплектов, быструю доставку по Ташкенту и Узбекистану. Поможем с выбором по нормам и условиям эксплуатации.',
    ],
    introByLang: {
      ru: [
        'Пожарные рукава 51/66/77 в наличии и под заказ. Подберём головки, стволы и шкафы под внутренний пожарный водопровод.',
        'Сертификаты, комплектация, быстрая доставка по Ташкенту и Узбекистану.',
      ],
      en: [
        'Fire hoses 51/66/77 available in stock and on order. We will select couplings, nozzles and cabinets for indoor hydrant systems.',
        'Certificates, kitting and fast delivery in Tashkent and across Uzbekistan.',
      ],
      uz: [
        'Yong‘in shlanglari 51/66/77 — omborda va buyurtma asosida. Ichki yong‘in tarmog‘i uchun mufta, stvol va shkaflarni tanlab beramiz.',
        'Sertifikatlar, komplektatsiya va tez yetkazib berish (Toshkent va Oʻzbekiston bo‘ylab).',
      ],
    },
    links: [
      { href: '/catalog/rukava_i_pozharnaya_armatura', label: 'пожарные рукава ташкент купить' },
      { href: '/catalog/rukava_i_pozharnaya_armatura', label: 'каталог пожарных рукавов' },
    ],
    faqs: [
      { question: 'Какие рукава выбрать для внутреннего пожарного крана?', answer: 'Для ПК применяются напорные рукава диаметром 51/66 мм с головками ГР и рабочим давлением не ниже нормативов.' },
      { question: 'Есть ли сертификаты?', answer: 'Да, предоставляем сертификаты соответствия. Возможна поставка комплектов: рукав + ствол + головки + шкаф.' },
      { question: 'Доставка по Ташкенту?', answer: 'Да, оперативная доставка по Ташкенту и Узбекистану.' },
    ],
  },
  // Фурнитура/кронштейны для огнетушителей
  'furnitura-dlya-ognetushiteley': {
    alias: ['furnitura_dlya_ognetushiteley', 'kronshtejny-dlya-ognetushiteley'],
    intro: [
      'Кронштейны и фурнитура для огнетушителей: настенные и автомобильные крепления, таблички, пломбы и другие аксессуары. Подберём совместимые крепления под нужную модель.',
      'В наличии и под заказ. Прозрачные цены и быстрая доставка по Ташкенту. Поможем укомплектовать объект под требования безопасности.',
    ],
    introByLang: {
      ru: [
        'Кронштейны и фурнитура для огнетушителей: настенные и автомобильные крепления, таблички и пломбы.',
        'Подбор под модель, прозрачные цены и быстрая доставка по Ташкенту.',
      ],
      en: [
        'Brackets and fittings for fire extinguishers: wall and car mounts, signs and seals.',
        'Model compatibility assistance, transparent pricing and fast delivery in Tashkent.',
      ],
      uz: [
        'O‘t o‘chirgichlar uchun kronshteyn va furnitura: devor/avto kronshteynlari, belgilar va plombalar.',
        'Moslikni tanlashda yordam, oshkora narxlar va tez yetkazib berish (Toshkent).',
      ],
    },
    links: [
      { href: '/catalog/furnitura_dlya_ognetushiteley', label: 'кронштейны для огнетушителей — каталог' },
    ],
    faqs: [
      { question: 'Как подобрать кронштейн под огнетушитель?', answer: 'Ориентируйтесь на массу/диаметр баллона и место установки (стена/авто). Мы подскажем совместимые модели.' },
      { question: 'Можно ли заказать оптом?', answer: 'Да, работаем с организациями и частными клиентами, предоставляем КП и прайс.' },
    ],
  },
  // Пожарные шкафы
  'fire-cabinets': {
    alias: ['pozharnye-shkafy', 'pozharnye_shkafy'],
    intro: [
      'Пожарные шкафы для внутреннего пожарного водопровода: ШП настенные/встраиваемые, с местом под рукав, ствол и кран. Металлические корпуса с порошковым покрытием.',
      'Подберём комплектацию под ваши рукава и арматуру. Сертификаты, быстрая доставка по Ташкенту, оптовые цены для организаций.',
    ],
    introByLang: {
      ru: [
        'Пожарные шкафы: настенные и встраиваемые, для рукава, ствола и крана.',
        'Комплектация под объект, сертификаты и быстрая доставка по Ташкенту.',
      ],
      en: [
        'Fire cabinets: surface-mounted and recessed, with space for hose, nozzle and valve.',
        'Kitting per project, certificates and fast delivery in Tashkent.',
      ],
      uz: [
        'Yong‘in shkaflari: devorga o‘rnatiladigan va ichiga o‘rnatiladigan, shlang, stvol va kran uchun.',
        'Loyihaga mos komplektatsiya, sertifikatlar va tez yetkazib berish (Toshkent).',
      ],
    },
    links: [
      { href: '/catalog/pozharnye_shkafy', label: 'пожарные шкафы — каталог' },
    ],
    faqs: [
      { question: 'Какие размеры шкафов бывают?', answer: 'Стандартные размеры под рукав 51/66, с одним или двумя отсеками. Поможем подобрать по проекту.' },
      { question: 'Есть ли встроенные модели?', answer: 'Да, доступны как накладные (настенные), так и встраиваемые шкафы.' },
    ],
  },
  // Пожарная сигнализация
  'fire-alarms': {
    alias: ['pozharnaya-signalizatsiya', 'pozharnaya_signalizatsiya_i_svetozvukovye_ustroystva'],
    intro: [
      'Системы пожарной сигнализации: адресные и неадресные панели, извещатели дыма/тепла, светозвуковые оповещатели.',
      'Комплектуем под объект, помогаем с выбором совместимых устройств, предоставляем сертификаты и документацию.',
    ],
    introByLang: {
      ru: [
        'Системы пожарной сигнализации: адресные/неадресные панели, датчики дыма/тепла, оповещатели.',
        'Подбор совместимых устройств и документация.',
      ],
      en: [
        'Fire alarm systems: addressable/non-addressable panels, smoke/heat detectors, sounders/beacons.',
        'Compatible device selection and documentation support.',
      ],
      uz: [
        'Yong‘in signalizatsiyasi: adresli/adressiz panellar, tutun/issiqlik detektorlari, ogohlantirish qurilmalari.',
        'Mos qurilmalarni tanlash va hujjatlar bilan yordam.',
      ],
    },
    links: [
      { href: '/catalog/pozharnaya_signalizatsiya_i_svetozvukovye_ustroystva', label: 'каталог пожарной сигнализации' },
    ],
    faqs: [
      { question: 'Адресная или неадресная система?', answer: 'Зависит от масштаба и требуемого функционала. Поможем выбрать по ТЗ и нормам.' },
      { question: 'Есть ли проектирование и монтаж?', answer: 'Мы поможем с подбором и снабжением. По монтажу — возможны партнёры.' },
    ],
  },
  // Гидранты
  'fire-hydrants': {
    alias: ['pozharnye-gidranty', 'fire-hydrants'],
    intro: [
      'Пожарные гидранты и комплектующие. Подберём по давлению и диаметрам, поможем со стыковкой с существующей сетью.',
      'Поставляем сертифицированное оборудование, организуем поставку в сжатые сроки по Ташкенту и регионам.',
    ],
    introByLang: {
      ru: [
        'Пожарные гидранты и комплектующие — подберём по давлению и диаметрам.',
        'Сертифицированные решения и оперативная поставка по Узбекистану.',
      ],
      en: [
        'Fire hydrants and accessories — selected by pressure and diameter.',
        'Certified equipment with fast delivery across Uzbekistan.',
      ],
      uz: [
        'Yong‘in gidrantlari va aksessuarlar — bosim va diametr bo‘yicha tanlab beramiz.',
        'Sertifikatlangan jihozlar, Oʻzbekiston bo‘ylab tez yetkazib berish.',
      ],
    },
    links: [
      { href: '/catalog/fire-hydrants', label: 'каталог пожарных гидрантов' },
    ],
  },
  // Дымовые извещатели
  'smoke-detectors': {
    alias: ['detektory-dyma', 'pozharnye-detektory'],
    intro: [
      'Дымовые и тепловые извещатели для раннего обнаружения пожара. Совместимость с адресными/неадресными системами.',
      'Поможем подобрать под условия эксплуатации и требования проекта.',
    ],
    introByLang: {
      ru: [
        'Дымовые и тепловые извещатели для раннего обнаружения пожара.',
        'Совместимы с адресными/неадресными системами. Поможем с подбором.',
      ],
      en: [
        'Smoke and heat detectors for early fire detection.',
        'Compatible with addressable/non-addressable systems. We will help you choose.',
      ],
      uz: [
        'Yong‘inni erta aniqlash uchun tutun va issiqlik detektorlari.',
        'Adresli/adressiz tizimlar bilan mos. Tanlashda yordam beramiz.',
      ],
    },
    links: [
      { href: '/catalog/smoke-detectors', label: 'каталог датчиков дыма' },
    ],
  },
  // Противопожарные двери
  'fire-doors': {
    alias: ['protivopozharnye-dveri', 'fire-doors'],
    intro: [
      'Противопожарные двери с различным классом огнестойкости. Возможны остеклённые варианты и технологические размеры.',
      'Сертификаты, поставка и консультации по выбору фурнитуры и доводчиков.',
    ],
    introByLang: {
      ru: [
        'Противопожарные двери — разные классы огнестойкости, возможны остеклённые варианты.',
        'Консультации по фурнитуре и доводчикам, поставка и документы.',
      ],
      en: [
        'Fire doors — various fire resistance classes, glazed options available.',
        'Consulting on hardware and closers, supply and documentation.',
      ],
      uz: [
        'Yong‘inga chidamli eshiklar — turli yong‘inga chidamlilik sinflari, oynali variantlar.',
        'Furnitura va yopqichlar bo‘yicha maslahat, ta’minot va hujjatlar.',
      ],
    },
    links: [
      { href: '/catalog/fire-doors', label: 'каталог противопожарных дверей' },
    ],
  },
  // Оборудование пожарной безопасности (общая категория)
  'fire-safety-equipment': {
    alias: ['oborudovanie-pozharnoy-bezopasnosti'],
    intro: [
      'Комплексное оснащение объектов: шкафы, рукава, стволы, знаки, огнетушители и другое оборудование пожарной безопасности.',
      'Сформируем комплект под нормы и специфику вашего объекта. Документация и поставка.',
    ],
    introByLang: {
      ru: [
        'Комплексное оснащение: шкафы, рукава, стволы, знаки, огнетушители.',
        'Подбор под нормы объекта. Документация и поставка.',
      ],
      en: [
        'Comprehensive supply for facilities: cabinets, hoses, nozzles, signs, extinguishers.',
        'Selection per standards. Documentation and delivery.',
      ],
      uz: [
        'Obʼektlar uchun kompleks jihozlash: shkaflar, shlanglar, stvollar, belgilar, o‘t o‘chirgichlar.',
        'Meʼyorlarga mos tanlash. Hujjatlar va yetkazib berish.',
      ],
    },
    links: [
      { href: '/catalog/fire-safety-equipment', label: 'каталог оборудования' },
    ],
  },
  // Системы пожаротушения
  'fire-extinguishing-systems': {
    alias: ['sistemy-pozhartusheniya', 'sistemy_pozharotusheniya_sprinkler'],
    intro: [
      'Системы пожаротушения: спринклерные и модульные решения. Поможем с подбором по площади, классу пожара и источнику воды.',
      'Совместим с существующими системами сигнализации и оповещения. Сертификаты и документация.',
    ],
    introByLang: {
      ru: [
        'Системы пожаротушения: спринклерные и модульные решения под площадь и класс пожара.',
        'Совместимость с системами безопасности, сертификаты и документация.',
      ],
      en: [
        'Fire extinguishing systems: sprinkler and modular solutions for area and fire class.',
        'Compatible with safety systems, with certificates and documentation.',
      ],
      uz: [
        'Yong‘inni o‘chirish tizimlari: sprinkler va modulli yechimlar — maydon va yong‘in sinfiga ko‘ra.',
        'Xavfsizlik tizimlari bilan mos, sertifikatlar va hujjatlar bilan.',
      ],
    },
    links: [
      { href: '/catalog/sistemy_pozharotusheniya_sprinkler', label: 'системы пожаротушения — каталог' },
    ],
  },
  // Системы противопожарной защиты
  'fire-protection-systems': {
    alias: ['sistemy-protivopozharnoy-zashchity', 'fire-protection-systems'],
    intro: [
      'Системы противопожарной защиты для комплексной безопасности объекта. Консультации по совместимости узлов и оборудования.',
      'Поставка, сопроводительная документация, помощь с выбором комплектующих.',
    ],
    introByLang: {
      ru: [
        'Системы противопожарной защиты для комплексной безопасности объекта.',
        'Подбор совместимых узлов, поставка и документация.',
      ],
      en: [
        'Fire protection systems for comprehensive facility safety.',
        'Selection of compatible components, delivery and documentation.',
      ],
      uz: [
        'Obʼektning kompleks xavfsizligi uchun yong‘indan himoya tizimlari.',
        'Mos tugunlarni tanlash, yetkazib berish va hujjatlar.',
      ],
    },
    links: [
      { href: '/catalog/fire-protection-systems', label: 'каталог систем ППЗ' },
    ],
  },
  // СИЗ
  'ppe': {
    alias: ['siz'],
    intro: [
      'Средства индивидуальной защиты: каски, очки, перчатки, респираторы, защитная одежда и комплекты.',
      'Поможем подобрать СИЗ под задачи, нормы и условия эксплуатации.',
    ],
    introByLang: {
      ru: [
        'СИЗ: каски, очки, перчатки, респираторы, спецодежда и комплекты.',
        'Подбор под задачи, нормы и условия эксплуатации.',
      ],
      en: [
        'PPE: helmets, goggles, gloves, respirators, protective clothing and kits.',
        'Selection for your tasks, standards and operating conditions.',
      ],
      uz: [
        'SHV: kaska, ko‘zoynak, qo‘lqop, respirator, maxsus kiyim va to‘plamlar.',
        'Vazifa va meʼyorlarga mos tanlab beramiz.',
      ],
    },
    links: [
      { href: '/catalog/siz', label: 'каталог СИЗ' },
    ],
  },
  // Дыхательные аппараты
  'breathing-apparatus': {
    alias: ['dyhatelnye-apparaty', 'breathing-apparatus'],
    intro: [
      'Дыхательные аппараты и комплектующие для СИЗОД. Различные типы баллонов и масок.',
      'Подбор под специфику задач, консультируем по совместимости и обслуживанию.',
    ],
    introByLang: {
      ru: [
        'Дыхательные аппараты и комплектующие для СИЗОД: баллоны, маски.',
        'Подбор под задачи, рекомендации по обслуживанию.',
      ],
      en: [
        'Breathing apparatus and components for respiratory protection: cylinders, masks.',
        'Selection for your tasks, maintenance guidance.',
      ],
      uz: [
        'Nafas olish apparatlari va SIZOD uchun qismlar: ballonlar, niqoblar.',
        'Vazifaga mos tanlov va xizmat ko‘rsatish bo‘yicha maslahat.',
      ],
    },
    links: [
      { href: '/catalog/breathing-apparatus', label: 'каталог дыхательных аппаратов' },
    ],
  },
  // Пожарные насосы
  'fire-pumps': {
    alias: ['pozharnye-nasosy', 'istochniki_pitaniya'],
    intro: [
      'Пожарные насосы и источники питания для систем пожаротушения и оповещения. Подберём по требованиям проекта и гидравлике.',
      'Поставляем сертифицированные решения с гарантией и поддержкой.',
    ],
    introByLang: {
      ru: [
        'Пожарные насосы и источники питания для систем пожаротушения и оповещения.',
        'Подбор по проекту и гидравлике. Сертификаты и поддержка.',
      ],
      en: [
        'Fire pumps and power supplies for extinguishing and PA systems.',
        'Selection per project and hydraulics. Certified with support.',
      ],
      uz: [
        'Yong‘in nasoslari va ogohlantirish tizimlari uchun quvvat manbalari.',
        'Loyiha va gidravlikaga ko‘ra tanlash. Sertifikatlar va qo‘llab-quvvatlash.',
      ],
    },
    links: [
      { href: '/catalog/fire-pumps', label: 'каталог пожарных насосов' },
    ],
  },
  // Аудиосистема и оповещение
  'emergency-lighting': {
    alias: ['audiosistema_i_opoveschenie'],
    intro: [
      'Системы оповещения и аудиооборудование: усилители, громкоговорители, микрофонные пульты. Совместимость с системами безопасности.',
      'Подбор под объект и нормативы, поставка по Ташкенту и Узбекистану.',
    ],
    introByLang: {
      ru: [
        'Системы оповещения и аудиооборудование: усилители, акустика, пульты.',
        'Подбор под нормы объекта. Поставка по Ташкенту и Узбекистану.',
      ],
      en: [
        'Public address and audio equipment: amplifiers, speakers, paging consoles.',
        'Selection per facility standards. Delivery in Tashkent and Uzbekistan.',
      ],
      uz: [
        'Ovozli ogohlantirish va audio uskunalar: kuchaytirgichlar, karnaylar, pultlar.',
        'Obʼekt meʼyorlariga mos tanlov. Toshkent va Oʻzbekistonga yetkazib berish.',
      ],
    },
    links: [
      { href: '/catalog/audiosistema_i_opoveschenie', label: 'аудиосистема и оповещение — каталог' },
    ],
  },
  // Баллоны
  'ballony': {
    intro: [
      'Баллоны и комплектующие для пожаротушения. Консультации по подбору и обслуживанию.',
      'Поставка с документами и гарантией по Ташкенту и регионам.',
    ],
    links: [
      { href: '/catalog/ballony', label: 'баллоны — каталог' },
    ],
  },
  // Динамики потолочные
  'dinamiki_potolochnye': {
    intro: [
      'Потолочные динамики для систем оповещения и фонового звука. Различные мощности и диаграммы направленности.',
      'Совместим с существующими усилителями и матричными системами.',
    ],
    links: [
      { href: '/catalog/dinamiki_potolochnye', label: 'динамики потолочные — каталог' },
    ],
  },
  // Контрольные панели адресные пожарно-охранные
  'kontrolnye_paneli_adresnye_pozharno_ohrannye': {
    intro: [
      'Адресные контрольные панели для пожарно-охранных систем. Подберём по топологии и количеству шлейфов/устройств.',
      'Сертификаты, документация, помощь с совместимостью датчиков и модулей.',
    ],
    links: [
      { href: '/catalog/kontrolnye_paneli_adresnye_pozharno_ohrannye', label: 'контрольные панели — каталог' },
    ],
  },
  // Мониторы и крепления
  'monitory_i_krepleniya': {
    intro: [
      'Мониторы и крепления для диспетчерских и постов охраны. Решения под разные диагонали и условия установки.',
    ],
    links: [
      { href: '/catalog/monitory_i_krepleniya', label: 'мониторы и крепления — каталог' },
    ],
  },
  // Оборудование контроля доступа
  'oborudovanie_kontrolya_dostupa': {
    intro: [
      'СКУД: считыватели, контроллеры, турникеты, замки. Интеграция с системами безопасности.',
    ],
    links: [
      { href: '/catalog/oborudovanie_kontrolya_dostupa', label: 'оборудование контроля доступа — каталог' },
    ],
  },
  // Панели GSM и беспроводные системы iPRO
  'paneli_gsm_i_besprovodnye_sistemy_ipro': {
    intro: [
      'GSM-панели и беспроводные решения iPRO для оповещения и интеграции. Настройка и консультации по совместимости.',
    ],
    links: [
      { href: '/catalog/paneli_gsm_i_besprovodnye_sistemy_ipro', label: 'GSM панели и беспроводные системы — каталог' },
    ],
  },
  // Видеорегистраторы, усилители сигнала, хабы
  'videoregistratory_usiliteli_signala_haby': {
    intro: [
      'Видеорегистраторы, усилители сигнала и хабы для систем видеонаблюдения и безопасности.',
    ],
    links: [
      { href: '/catalog/videoregistratory_usiliteli_signala_haby', label: 'видеорегистраторы и хабы — каталог' },
    ],
  },
  // Замки и аксессуары
  'zamki_i_aksessuary': {
    intro: [
      'Замки и аксессуары для дверей и шкафов, совместимые с СКУД и противопожарными системами.',
    ],
    links: [
      { href: '/catalog/zamki_i_aksessuary', label: 'замки и аксессуары — каталог' },
    ],
  },
  // Цифрал
  'tsifral': {
    intro: [
      'Оборудование Цифрал: домофоны, панели, блоки управления. Подбор под существующую систему.',
    ],
    links: [
      { href: '/catalog/tsifral', label: 'Цифрал — каталог' },
    ],
  },
  // Усилители
  'usiliteli': {
    intro: [
      'Усилители мощности для систем оповещения и фонового звука. Различные каналы и мощности.',
    ],
    links: [
      { href: '/catalog/usiliteli', label: 'усилители — каталог' },
    ],
  },
  // Источники питания (как отдельная категория)
  'istochniki_pitaniya': {
    intro: [
      'Источники питания для систем безопасности и оповещения. Подбор по напряжению, току и дублированию.',
    ],
    links: [
      { href: '/catalog/istochniki_pitaniya', label: 'источники питания — каталог' },
    ],
  },
};

export function resolveCategoryKey(raw: string): string | null {
  const key = raw.replace(/_/g, '-');
  if (CATEGORY_SEO[key]) return key;
  // try aliases
  for (const [k, v] of Object.entries(CATEGORY_SEO)) {
    if (v.alias?.includes(key)) return k;
  }
  return null;
}
