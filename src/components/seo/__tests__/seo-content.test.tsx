import React from 'react';
import { render, screen } from '@testing-library/react';
import { SEOContent } from '../SEOContent';
import { validateSEO } from '@/i18n/seo.schema';

// Mock the validateSEO function
jest.mock('@/i18n/seo.schema', () => ({
  validateSEO: jest.fn(() => ({ success: true, data: {} }))
}));

// Mock i18n to return objects for section keys that SEOContent requests
jest.mock('next-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const map: Record<string, unknown> = {
        'section.simple': {
          title: 'Test Section',
          paragraphs: ['Test Paragraph 1', 'Test Paragraph 2'],
        },
        'section.cta': {
          title: 'Test Section',
          paragraphs: ['Test Paragraph'],
        },
        'section.none': undefined,
        'section.validate': {
          title: 'Test Section',
          paragraphs: ['Test Paragraph'],
        },
        'section.heading': {
          title: 'Main Section',
          paragraphs: ['Paragraph 1'],
        },
        // CTA labels/texts used by CTASection
        'cta': { buyNow: 'Buy now', consult: 'Get consultation' },
        'ariaLabels.buyNow': 'ariaLabels.buyNow',
        'ariaLabels.consult': 'ariaLabels.consult',
      };
      return map[key];
    },
  }),
}));

// no-op

describe('SEOContent', () => {
  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();
  });

  it('renders section for valid section keys', () => {
    render(<SEOContent section={'section.simple'} category="ognetushiteli" />);

    expect(screen.getByText('Test Section')).toBeInTheDocument();
    expect(screen.getByText('Test Paragraph 1')).toBeInTheDocument();
    expect(screen.getByText('Test Paragraph 2')).toBeInTheDocument();
  });

  it('renders CTA buttons when showCTA is true', () => {
    render(<SEOContent section={'section.cta'} category="ognetushiteli" showCTA={true} />);
    expect(screen.getByRole('link', { name: 'ariaLabels.buyNow' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'ariaLabels.consult' })).toBeInTheDocument();
  });

  it('does not render CTA buttons when showCTA is false', () => {
    render(<SEOContent section={'section.cta'} category="ognetushiteli" showCTA={false} />);
    expect(screen.queryByRole('link', { name: 'ariaLabels.buyNow' })).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'ariaLabels.consult' })).not.toBeInTheDocument();
  });

  it('handles missing section data gracefully', () => {
    const { container } = render(<SEOContent section={'section.none'} category="non-existent-category" />);
    // Component should render nothing when content is missing
    expect(container).toBeInTheDocument();
  });

  it('validates SEO data on render', () => {
    render(<SEOContent section={'section.validate'} category="ognetushiteli" />);
    expect(validateSEO).toHaveBeenCalledWith({ title: 'Test Section', paragraphs: ['Test Paragraph'] });
  });

  it('renders with proper heading hierarchy', () => {
    const { container } = render(<SEOContent section={'section.heading'} category="ognetushiteli" />);
    const mainHeading = container.querySelector('h2');
    expect(mainHeading).toHaveTextContent('Main Section');
  });
});
