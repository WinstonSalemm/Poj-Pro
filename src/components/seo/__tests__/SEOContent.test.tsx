import React from 'react';
import { render, screen } from '@testing-library/react';
import SEOContent from '../SEOContent';

// Mock next-i18next
jest.mock('next-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const mockTranslations: Record<string, unknown> = {
        'categories.ognetushiteli': {
          title: 'Fire Extinguishers',
          paragraphs: ['Paragraph 1', 'Paragraph 2'],
        },
        'faq': [
          { q: 'Question 1', a: 'Answer 1' },
          { q: 'Question 2', a: 'Answer 2' },
        ],
        'faqTitle': 'Frequently Asked Questions',
        'cta': {
          buyNow: 'Buy Now',
          consult: 'Get Consultation',
        },
        'ariaLabels': {
          buyNow: 'Buy fire extinguishers',
          consult: 'Get a free consultation',
        },
      };
      return mockTranslations[key] || key;
    },
  }),
}));

describe('SEOContent', () => {
  it('renders text content with title and paragraphs', () => {
    render(<SEOContent section="categories.ognetushiteli" />);
    expect(screen.getByText('Fire Extinguishers')).toBeInTheDocument();
    expect(screen.getByText('Paragraph 1')).toBeInTheDocument();
    expect(screen.getByText('Paragraph 2')).toBeInTheDocument();
  });

  it('renders FAQ content when section is an array', () => {
    render(<SEOContent section="faq" />);
    expect(screen.getByText('Frequently Asked Questions')).toBeInTheDocument();
    expect(screen.getByText('Question 1')).toBeInTheDocument();
    expect(screen.getByText('Answer 1')).toBeInTheDocument();
  });

  it('renders CTA buttons when showCTA is true', () => {
    render(<SEOContent section="categories.ognetushiteli" showCTA />);
    expect(screen.getByText('Buy Now')).toBeInTheDocument();
    expect(screen.getByText('Get Consultation')).toBeInTheDocument();
  });
});
