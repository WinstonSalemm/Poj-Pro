export type DocItem = {
  id: string;
  title: string;
  href: string;     // /documents/*.pdf или абсолютный URL
  category?: string; // Сертификаты, Инструкции, Нормы и т.п.
  lang?: 'ru'|'en'|'uz';
  sizeKb?: number;  // необязательно
  updatedAt?: string;
};

export type SupplyItem = {
  id: string;
  supplier?: string;  // Огнеборец и т.п.
  eta?: string;       // ISO-дата ожидаемого прихода
  note?: string;
  lines: Array<{ name: string; qty: number|string; unit?: string }>;
};
