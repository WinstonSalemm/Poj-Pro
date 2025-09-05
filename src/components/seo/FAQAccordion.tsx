'use client';
import React, { useState, useMemo } from 'react';
import { useTranslation } from 'next-i18next';
import { FaChevronDown, FaChevronUp } from 'react-icons/fa';
import { FAQItem } from '@/i18n/seo.types';

interface FAQAccordionProps {
  /** 
   * Key to fetch FAQ items from i18n (e.g., 'faq' or 'categories.ognetushiteli.faq')
   * If not provided, items prop must be used
   */
  faqKey?: string;
  
  /** 
   * FAQ items to display directly
   * If not provided, will be fetched using faqKey
   */
  items?: FAQItem[];
  
  /** Whether to render JSON-LD structured data */
  jsonLd?: boolean;
  
  /** Additional CSS class for the container */
  className?: string;
  
  /** Whether to have the first item open by default */
  defaultOpenFirst?: boolean;
}

const FAQAccordion: React.FC<FAQAccordionProps> = ({
  faqKey,
  items: propItems,
  jsonLd = false,
  className = '',
  defaultOpenFirst = false,
}) => {
  const { t } = useTranslation('seo');
  const [openIndex, setOpenIndex] = useState<number | null>(defaultOpenFirst ? 0 : null);
  
  // Get FAQ items either from props or i18n
  const faqItems = useMemo<FAQItem[]>(() => {
    if (Array.isArray(propItems)) {
      return propItems;
    }
    
    if (faqKey) {
      try {
        const content = t(faqKey, { returnObjects: true });
        if (Array.isArray(content)) {
          return content as FAQItem[];
        }
      } catch (error) {
        console.error(`Error loading FAQ items for key '${faqKey}':`, error);
      }
    }
    
    return [];
  }, [faqKey, propItems, t]);
  
  // Generate JSON-LD for FAQ structured data
  const faqStructuredData = useMemo(() => {
    if (!jsonLd || faqItems.length === 0) return null;
    
    return {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: faqItems.map(item => ({
        '@type': 'Question',
        name: item.q,
        acceptedAnswer: {
          '@type': 'Answer',
          text: item.a
        }
      }))
    };
  }, [faqItems, jsonLd]);
  
  const toggleItem = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };
  
  if (!faqItems || faqItems.length === 0) {
    return null;
  }
  
  return (
    <div className={`space-y-4 ${className}`}>
      {/* JSON-LD Structured Data */}
      {jsonLd && faqStructuredData && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(faqStructuredData, null, 2)
          }}
        />
      )}
      
      {faqItems.map((item, index) => (
        <div 
          key={index} 
          className="border border-gray-200 rounded-lg overflow-hidden"
          itemScope
          itemProp="mainEntity"
          itemType="https://schema.org/Question"
        >
          <button
            type="button"
            className={`w-full flex justify-between items-center p-4 text-left font-medium transition-colors ${
              openIndex === index ? 'bg-gray-50' : 'hover:bg-gray-50'
            }`}
            onClick={() => toggleItem(index)}
            aria-expanded={openIndex === index}
            aria-controls={`faq-${index}`}
          >
            <span className="text-lg font-semibold text-gray-900" itemProp="name">
              {item.q}
            </span>
            {openIndex === index ? (
              <FaChevronUp className="text-gray-500" />
            ) : (
              <FaChevronDown className="text-gray-500" />
            )}
          </button>
          <div 
            id={`faq-${index}`}
            className={`px-4 pb-4 pt-2 text-gray-600 ${openIndex === index ? 'block' : 'hidden'}`}
            itemScope
            itemProp="acceptedAnswer"
            itemType="https://schema.org/Answer"
          >
            <div itemProp="text" dangerouslySetInnerHTML={{ __html: item.a }} />
          </div>
        </div>
      ))}
    </div>
  );
};

export default FAQAccordion;
