export interface Supplier {
  slug: string;
  name: string;
  href: string;
  logo: string;
}

export const suppliers: Supplier[] = [
  {
    slug: 'ogneborets',
    name: 'ООО "Огнеборец"',
    href: 'https://www.510777.xn--p1ai/ru',
    logo: '/brands/ogneborets.svg'
  },
  {
    slug: 'elis',
    name: 'ООО "ЭЛИС"',
    href: 'https://www.elistver.ru/',
    logo: '/brands/elis.png'
  },
  {
    slug: 'bereg',
    name: 'ООО "Т.Д. БЕРЕГ"',
    href: 'https://tdbereg.ru/',
    logo: '/brands/bereg.png'
  },
  {
    slug: 'tsifral',
    name: 'АО "Цифрал"',
    href: '#',
    logo: '/brands/cyfral.png'
  },
  {
    slug: 'metakom',
    name: 'ООО "Метаком"',
    href: 'https://metakom.ru/',
    logo: '/brands/metakom.png'
  },
  {
    slug: 'magistral',
    name: 'ООО "Магистраль"',
    href: 'https://magistral.uz/',
    logo: '/brands/magistral.png'
  }
];
