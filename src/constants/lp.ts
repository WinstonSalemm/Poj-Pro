// src/constants/lp.ts
// Declarative config for landing pages under /lp/[slug]
// Each LP targets a local-intent query (e.g., "огнетушители ташкент купить").

import { SITE_URL } from '@/lib/site';

export type LP = {
  slug: string;               // url slug under /lp
  title: string;              // <title>
  description: string;        // meta description
  h1: string;                 // page H1
  catalogHref?: string;       // link to related catalog category
  ctas?: { href: string; label: string }[];
  faq?: { question: string; answer: string }[];
};

export const LP_PAGES: readonly LP[] = [
  {
    slug: 'ognetushiteli-tashkent',
    title: 'Огнетушители в Ташкенте — продажа, доставка, сертификаты | POJ PRO',
    description: 'Купить огнетушители в Ташкенте: ОП-2, ОП-5, ОУ-5. Доставка, сертификаты, обслуживание. Лучшие цены от POJ PRO.',
    h1: 'Огнетушители — Ташкент',
    catalogHref: '/catalog/ognetushiteli',
    ctas: [
      { href: '/catalog/ognetushiteli', label: 'Перейти в каталог' },
      { href: '/contacts', label: 'Запросить КП' },
    ],
    faq: [
      { question: 'Какие огнетушители выбрать для офиса?', answer: 'Чаще используют ОП‑4/ОП‑5 и ОУ‑3/ОУ‑5 для электрооборудования.' },
      { question: 'Есть ли доставка по Ташкенту?', answer: 'Да, доставка по Ташкенту и Узбекистану, сертификаты предоставляются.' },
    ],
  },
  {
    slug: 'pozharnye-rukava-tashkent',
    title: 'Пожарные рукава в Ташкенте — продажа, доставка, сертификаты | POJ PRO',
    description: 'Рукава РПМ(В) 51/66/77, муфты, стволы, арматура. Сертификаты и поставка по Узбекистану.',
    h1: 'Пожарные рукава — Ташкент',
    catalogHref: '/catalog/rukava_i_pozharnaya_armatura',
    ctas: [
      { href: '/catalog/rukava_i_pozharnaya_armatura', label: 'Перейти в каталог' },
      { href: '/contacts', label: 'Запросить КП' },
    ],
    faq: [
      { question: 'Какие рукава для ПК?', answer: 'Напорные рукава 51/66 с головками ГР и соответствующим давлением.' },
      { question: 'Соберёте комплект?', answer: 'Да, рукав + ствол + головки + шкаф.' },
    ],
  },
  {
    slug: 'kronshtejny-ognetushiteley-tashkent',
    title: 'Кронштейны для огнетушителей в Ташкенте — настенные и авто | POJ PRO',
    description: 'Настенные и автомобильные крепления к огнетушителям. Сертификаты и доставка.',
    h1: 'Кронштейны для огнетушителей — Ташкент',
    catalogHref: '/catalog/furnitura_dlya_ognetushiteley',
    ctas: [
      { href: '/catalog/furnitura_dlya_ognetushiteley', label: 'Каталог кронштейнов' },
      { href: '/contacts', label: 'Запросить КП' },
    ],
    faq: [
      { question: 'Как подобрать кронштейн?', answer: 'Ориентируйтесь на массу/диаметр баллона и тип установки (стена/авто). Подскажем совместимые модели.' },
    ],
  },
  {
    slug: 'pozharnye-shkafy-tashkent',
    title: 'Пожарные шкафы в Ташкенте — ШП настенные и встраиваемые | POJ PRO',
    description: 'ШП под рукава 51/66, ствол и кран. Сертификаты, доставка, подбор комплектации.',
    h1: 'Пожарные шкафы — Ташкент',
    catalogHref: '/catalog/pozharnye_shkafy',
    ctas: [
      { href: '/catalog/pozharnye_shkafy', label: 'Перейти в каталог' },
      { href: '/contacts', label: 'Запросить КП' },
    ],
  },
  {
    slug: 'pozharnaya-signalizatsiya-tashkent',
    title: 'Пожарная сигнализация в Ташкенте — адресная/неадресная | POJ PRO',
    description: 'Панели, извещатели, оповещатели. Подбор, совместимость, документация и поставка.',
    h1: 'Пожарная сигнализация — Ташкент',
    catalogHref: '/catalog/pozharnaya_signalizatsiya_i_svetozvukovye_ustroystva',
  },
  {
    slug: 'datchiki-dyma-tashkent',
    title: 'Датчики дыма в Ташкенте — адресные и неадресные | POJ PRO',
    description: 'Дымовые/тепловые извещатели, совместимость с системами, поставка и консультации.',
    h1: 'Датчики дыма — Ташкент',
    catalogHref: '/catalog/smoke-detectors',
  },
  {
    slug: 'sprinkler-sistemy-tashkent',
    title: 'Спринклерные системы в Ташкенте — проектные поставки | POJ PRO',
    description: 'Системы пожаротушения, подбор по площади и классу пожара. Сертификаты и документация.',
    h1: 'Спринклерные системы — Ташкент',
    catalogHref: '/catalog/sistemy_pozharotusheniya_sprinkler',
  },
  {
    slug: 'pozharnye-gidranty-tashkent',
    title: 'Пожарные гидранты в Ташкенте — поставка и комплектующие | POJ PRO',
    description: 'Гидранты и узлы, помощь со стыковкой с существующей сетью. Поставка по Узбекистану.',
    h1: 'Пожарные гидранты — Ташкент',
    catalogHref: '/catalog/fire-hydrants',
  },
  {
    slug: 'audio-opoveschenie-tashkent',
    title: 'Аудиосистема и оповещение — Ташкент | POJ PRO',
    description: 'Системы оповещения и звуковые решения для объектов. Подбор совместимых усилителей/динамиков.',
    h1: 'Аудиосистема и оповещение — Ташкент',
    catalogHref: '/catalog/audiosistema_i_opoveschenie',
  },
  {
    slug: 'siz-tashkent',
    title: 'Средства индивидуальной защиты в Ташкенте | POJ PRO',
    description: 'Каски, очки, перчатки, респираторы, защитная одежда. Подбор под задачи.',
    h1: 'СИЗ — Ташкент',
    catalogHref: '/catalog/siz',
  },
] as const;

export function getLpBySlug(slug: string): LP | undefined {
  return LP_PAGES.find((p) => p.slug === slug);
}

export function getLpCanonical(slug: string): string {
  return `${SITE_URL}/lp/${slug}`;
}
