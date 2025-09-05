// SEO Text Block type
export interface SEOTextBlock {
  title?: string;
  paragraphs: string[];
}

// FAQ Item type
export interface FAQItem {
  q: string;
  a: string;
}

// Main SEO Content type
export interface SEOContent {
  // Site-wide metadata
  siteName: string;
  defaultCategoryDescription: string;
  
  // Page content
  homepage: SEOTextBlock;
  categories: {
    ognetushiteli: SEOTextBlock & { description: string };
    siz: SEOTextBlock & { description: string };
    pozharnaiaBezopasnost: SEOTextBlock & { description: string };
    [key: string]: SEOTextBlock & { description?: string }; // Index signature for dynamic access
  };
  
  // FAQ section
  faq: FAQItem[];
  faqTitle: string;
  
  // Call to Action
  cta: {
    buyNow: string;
    consult: string;
  };
  
  // Accessibility labels
  ariaLabels: {
    buyNow: string;
    consult: string;
  };
  
  // Navigation
  navigation: {
    home: string;
    catalog: string;
    contacts: string;
    about: string;
  };
}

// Utility type for dot-notation paths in SEOContent
type DotNestedKeys<T> = T extends object
  ? {
      [K in keyof T]: K extends string
        ? T[K] extends object
          ? `${K}` | `${K}.${DotNestedKeys<T[K]>}`
          : K
        : never;
    }[keyof T]
  : never;

export type SEOSection = DotNestedKeys<SEOContent>;
