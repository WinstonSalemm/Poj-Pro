import React from 'react';
import { JsonLd } from './JsonLd';
import { clean } from './jsonld.schemas';

export interface FAQItem { question: string; answer: string }

export interface FaqJsonLdProps {
  faqs: FAQItem[];
}

const FaqJsonLd: React.FC<FaqJsonLdProps> = ({ faqs }) => {
  const data = clean({
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((f) =>
      clean({
        '@type': 'Question',
        name: f.question,
        acceptedAnswer: clean({ '@type': 'Answer', text: f.answer }),
      })
    ),
  });

  return <JsonLd data={data} type="FAQPage" />;
};

export default FaqJsonLd;
