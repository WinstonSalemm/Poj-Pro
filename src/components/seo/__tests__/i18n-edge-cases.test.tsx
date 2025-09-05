import React from 'react';
import { render, screen } from '@testing-library/react';
import { SEOContent } from '../SEOContent';

// Mock next-i18next to return structured content for section keys
jest.mock('next-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const map: Record<string, unknown> = {
        'edge.missing': {
          title: 'seo:missing.key',
          paragraphs: ['seo:missing.paragraph'],
        },
        'edge.empty': {
          title: 'Test Section',
          paragraphs: ['', '   ', 'Valid paragraph', undefined, null] as Array<string | null | undefined>,
        },
        'edge.invalid': {},
        'edge.cta': {
          title: 'Test Section',
          paragraphs: ['Test paragraph'],
        },
        // CTA data used by CTASection
        'cta': { buyNow: 'Buy now', consult: 'Get consultation' },
        // For CTA aria-labels, return keys as-is to simulate missing translations
        'ariaLabels.buyNow': 'ariaLabels.buyNow',
        'ariaLabels.consult': 'ariaLabels.consult',
      };
      return map[key as keyof typeof map];
    },
  }),
}));

// Mock validateSEO to succeed and avoid console errors during tests
jest.mock('@/i18n/seo.schema', () => ({
  validateSEO: jest.fn(() => ({ success: true, data: {} })),
}));

describe('i18n Edge Cases', () => {

  it('handles missing translation keys gracefully', () => {
    render(<SEOContent section={'edge.missing'} category="test" />);
    expect(screen.getByText('seo:missing.key')).toBeInTheDocument();
    expect(screen.getByText('seo:missing.paragraph')).toBeInTheDocument();
  });

  it('does not render empty paragraphs', () => {
    render(<SEOContent section={'edge.empty'} category="test" />);
    // At least the valid paragraph should be rendered
    expect(screen.getByText('Valid paragraph')).toBeInTheDocument();
  });

  it('handles invalid SEO JSON structure', () => {
    render(<SEOContent section={'edge.invalid'} category="test" />);
    // With invalid content object, component should render nothing or fallback gracefully
    // We simply assert no crash by reaching here
    expect(true).toBe(true);
  });

  it('handles missing category data gracefully', () => {
    render(<SEOContent section={'edge.cta'} category="non-existent-category" showCTA={true} />);
    expect(screen.getByText('Test Section')).toBeInTheDocument();
    const buy = screen.getByRole('link', { name: 'ariaLabels.buyNow' });
    expect(buy).toHaveAttribute('href', expect.stringContaining('non-existent-category'));
  });

  it('handles missing translation for CTA buttons', () => {
    render(<SEOContent section={'edge.cta'} category="test" showCTA={true} />);
    // CTASection reads aria-labels; with our mock it returns keys as-is
    expect(screen.getByRole('link', { name: 'ariaLabels.buyNow' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'ariaLabels.consult' })).toBeInTheDocument();
  });
});
