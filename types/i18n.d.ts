// SEO Content Types
export interface ContentSection {
  type: 'h1' | 'h2' | 'h3' | 'p' | 'div';
  content: string;
  className?: string;
}

export interface SEOPageContent {
  title: string;
  description: string;
  sections: ContentSection[];
}

export interface FAQItem {
  question: string;
  answer: string;
}

export interface SEOContent {
  homepage: SEOPageContent;
  categories: {
    [key: string]: SEOPageContent;
  };
  faq: FAQItem[];
}

declare module 'i18next' {
  interface CustomTypeOptions {
    defaultNS: 'translation';
    resources: {
      seo: SEOContent;
    };
  }
}

declare global {
  namespace JSX {
    interface IntrinsicElements {
      [elemName: string]: any;
    }
  }
}
