export interface ProductCategory {
  id?: string | number;
  name: string;
  slug: string;
}

export interface ProductI18n {
  id?: string | number;
  title: string;
  description?: string;
  summary?: string;
  locale: string;
}

export interface Product {
  name?: string;
  id: string | number;
  slug: string;
  title?: string;
  image?: string;
  i18n?: ProductI18n[];
  images?: string[];
  description?: string;
  short_description?: string;
  price?: number;
  category?: string | ProductCategory;
  specs?: Record<string, unknown>;
}
