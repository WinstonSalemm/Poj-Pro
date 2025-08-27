export type OpeningHours = {
  dayOfWeek: (
    | 'Monday'
    | 'Tuesday'
    | 'Wednesday'
    | 'Thursday'
    | 'Friday'
    | 'Saturday'
    | 'Sunday'
  )[];
  opens: string; // "09:00"
  closes: string; // "18:00"
};

export const COMPANY = {
  name: 'POJ PRO',
  legalName: 'POJ PRO LLC',
  email: 'info@poj-pro.uz',
  phoneE164: '+998000000000', // только цифры с + (E.164)
  phoneHuman: '+998 (00) 000-00-00',
  whatsappE164: '+998000000000',
  telegramHandle: 'pojpro',
  url: 'https://www.poj-pro.uz/',
  logoUrl: 'https://www.poj-pro.uz/logo.png',
  address: {
    streetAddress: 'Улица Пример, 1',
    addressLocality: 'Ташкент',
    postalCode: '100000',
    addressCountry: 'UZ',
  },
  geo: { lat: 41.311081, lng: 69.240562 }, // Ташкент центр (замени при необходимости)
  openingHours: [
    { dayOfWeek: ['Monday','Tuesday','Wednesday','Thursday','Friday'], opens:'09:00', closes:'18:00' },
    { dayOfWeek: ['Saturday'], opens:'10:00', closes:'16:00' },
  ] as OpeningHours[],
  sameAs: [
    'https://t.me/pojpro',
    'https://www.facebook.com/pojpro'
  ],
} as const;

export function waLink(e164: string){ return `https://wa.me/${e164.replace(/[^\d]/g,'')}`; }
export function tgLink(handle: string){ return `https://t.me/${handle.replace(/^@/,'')}`; }
