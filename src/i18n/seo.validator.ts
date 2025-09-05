import { SEOTextBlock, FAQItem, SEOContent } from './seo.types';

type ValidationResult = {
  valid: boolean;
  errors: string[];
};

function validateSEOTextBlock(data: unknown, path: string): ValidationResult {
  const errors: string[] = [];
  
  if (!data || typeof data !== 'object') {
    return {
      valid: false,
      errors: [`${path}: Expected an object`]
    };
  }
  
  const block = data as Partial<SEOTextBlock>;
  
  if (block.title !== undefined && typeof block.title !== 'string') {
    errors.push(`${path}.title: Expected string or undefined`);
  }
  
  if (!Array.isArray(block.paragraphs)) {
    errors.push(`${path}.paragraphs: Expected an array`);
  } else if (block.paragraphs.length === 0) {
    errors.push(`${path}.paragraphs: At least one paragraph is required`);
  } else {
    block.paragraphs.forEach((p, i) => {
      if (typeof p !== 'string') {
        errors.push(`${path}.paragraphs[${i}]: Expected string`);
      }
    });
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}

function validateFAQItem(data: unknown, path: string): ValidationResult {
  const errors: string[] = [];
  
  if (!data || typeof data !== 'object') {
    return {
      valid: false,
      errors: [`${path}: Expected an object`]
    };
  }
  
  const item = data as Partial<FAQItem>;
  
  if (typeof item.q !== 'string' || !item.q.trim()) {
    errors.push(`${path}.q: Question is required`);
  }
  
  if (typeof item.a !== 'string' || !item.a.trim()) {
    errors.push(`${path}.a: Answer is required`);
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}

export function validateSEO(data: unknown): data is SEOContent {
  if (process.env.NODE_ENV === 'production') {
    return true; // Skip validation in production
  }

  const errors: string[] = [];
  
  if (!data || typeof data !== 'object') {
    console.error('SEO Content Validation Error: Expected an object');
    return false;
  }
  
  const content = data as Partial<SEOContent>;
  
  // Validate homepage
  if (!content.homepage) {
    errors.push('homepage: Required');
  } else {
    const result = validateSEOTextBlock(content.homepage, 'homepage');
    if (!result.valid) {
      errors.push(...result.errors);
    }
  }
  
  // Validate categories
  if (!content.categories || typeof content.categories !== 'object') {
    errors.push('categories: Required');
  } else {
    const categories = ['ognetushiteli', 'siz', 'pozharnaiaBezopasnost'] as const;
    for (const category of categories) {
      const result = validateSEOTextBlock(
        content.categories?.[category], 
        `categories.${category}`
      );
      if (!result.valid) {
        errors.push(...result.errors);
      }
    }
  }
  
  // Validate FAQ
  if (!Array.isArray(content.faq)) {
    errors.push('faq: Expected an array');
  } else if (content.faq.length === 0) {
    errors.push('faq: At least one FAQ item is required');
  } else {
    content.faq.forEach((item, index) => {
      const result = validateFAQItem(item, `faq[${index}]`);
      if (!result.valid) {
        errors.push(...result.errors);
      }
    });
  }
  
  // Validate CTA (optional)
  if (content.cta) {
    if (typeof content.cta !== 'object') {
      errors.push('cta: Expected an object');
    } else {
      if (typeof content.cta.buyNow !== 'string' || !content.cta.buyNow.trim()) {
        errors.push('cta.buyNow: Required');
      }
      if (typeof content.cta.consult !== 'string' || !content.cta.consult.trim()) {
        errors.push('cta.consult: Required');
      }
    }
  }
  
  if (errors.length > 0) {
    console.error('SEO Content Validation Errors:', errors);
    return false;
  }
  
  return true;
}

export function assertSEO(data: unknown): asserts data is SEOContent {
  if (!validateSEO(data)) {
    throw new Error('Invalid SEO content structure');
  }
}
