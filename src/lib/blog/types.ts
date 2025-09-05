export type Locale = 'ru' | 'uz' | 'en';

export type PostFrontmatter = {
  title: string;
  description?: string;
  tags?: string[];
  date: string; // ISO string
  cover?: string;
};

export type Post = {
  slug: string;
  locale: Locale;
  frontmatter: PostFrontmatter;
  content: string; // raw MDX/MD
  html?: string; // rendered HTML
  readingTimeMinutes: number;
  toc: { id: string; text: string; depth: number }[];
};

export type Pagination = {
  page: number;
  perPage: number;
  total: number;
  pages: number;
};
