"use client";

import React from 'react';
import { useTranslation } from '@/i18n/useTranslation';
import { SEOTextBlock, SEOSection, FAQItem } from '@/i18n/seo.types';
import { validateSEO } from '@/i18n/seo.schema';
import { CTASection } from './CTASection';

interface SEOContentProps {
  section: SEOSection;
  className?: string;
  wrapperClassName?: string;
  showCTA?: boolean;
  category?: string;
}

const SEOContent: React.FC<SEOContentProps> = ({
  section,
  className = '',
  wrapperClassName = 'prose prose-sm sm:prose lg:prose-lg xl:prose-xl mx-auto py-6',
  showCTA = false,
  category,
}) => {
  const { t } = useTranslation('seo');
  
  try {
    // Get the content using the section path (e.g., 'categories.ognetushiteli')
    const content = t(section, { returnObjects: true }) as unknown;
    
    // If no content found, return null
    if (!content) return null;
    
    // In development, validate the content structure
    if (process.env.NODE_ENV !== 'production') {
      validateSEO(content);
    }

    // Handle different content types
    if (Array.isArray(content)) {
      // Handle FAQ array
      return (
        <div className={wrapperClassName}>
          <h2 className="text-2xl font-bold mb-6">{t('faqTitle')}</h2>
          <div className="space-y-4">
            {(content as FAQItem[]).map((item, index) => (
              <div key={index} className="border-b border-gray-200 pb-4">
                <h3 className="font-semibold text-lg mb-1">{item.q}</h3>
                <p className="text-gray-700">{item.a}</p>
              </div>
            ))}
          </div>
          {showCTA && <CTASection category={category} className="mt-8" />}
        </div>
      );
    } else if (typeof content === 'object' && content !== null) {
      // Handle SEOTextBlock content
      const seoContent = content as SEOTextBlock;
      
      return (
        <div className={`${wrapperClassName} ${className}`}>
          {seoContent.title && (
            <h2 className="text-2xl font-bold mb-4">{seoContent.title}</h2>
          )}
          <div className="space-y-4">
            {seoContent.paragraphs.map((paragraph, index) => (
              <p key={index} dangerouslySetInnerHTML={{ __html: paragraph }} />
            ))}
          </div>
          {showCTA && <CTASection category={category} className="mt-8" />}
        </div>
      );
    }
  } catch (error) {
    console.error(`Error rendering SEO content for section '${section}':`, error);
    return null;
  }
};

export default SEOContent;
export { SEOContent };
