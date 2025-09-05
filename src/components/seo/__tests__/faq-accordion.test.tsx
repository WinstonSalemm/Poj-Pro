import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import FAQAccordion from '../FAQAccordion';
import { FAQItem } from '@/i18n/seo.types';

// Mock next-i18next
jest.mock('next-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: Record<string, string | FAQItem[] | unknown> = {
        'faq.title': 'Frequently Asked Questions',
        'faq.items': [
          { q: 'Test Question 1', a: 'Test Answer 1' },
          { q: 'Test Question 2', a: 'Test Answer 2' },
        ] as FAQItem[],
      };
      return key in translations ? translations[key] : key;
    },
  }),
}));

describe('FAQAccordion', () => {
  const faqItems: FAQItem[] = [
    {
      q: 'Test Question 1',
      a: 'Test Answer 1',
    },
    {
      q: 'Test Question 2',
      a: 'Test Answer 2',
    },
  ];

  it('renders all FAQ items when using items prop', () => {
    render(<FAQAccordion items={faqItems} />);
    
    faqItems.forEach(item => {
      expect(screen.getByText(item.q)).toBeInTheDocument();
    });
  });

  it('loads FAQ items from i18n when using faqKey prop', () => {
    render(<FAQAccordion faqKey="faq.items" />);
    
    expect(screen.getByText('Test Question 1')).toBeInTheDocument();
    expect(screen.getByText('Test Question 2')).toBeInTheDocument();
  });

  it('toggles accordion on click', () => {
    render(<FAQAccordion items={faqItems} />);
    
    const firstQuestion = screen.getByText(faqItems[0].q);
    const button = firstQuestion.closest('button');
    
    if (!button) {
      throw new Error('Button not found');
    }
    
    // Get the answer element using the button's aria-controls
    const answerId = button.getAttribute('aria-controls');
    const firstAnswer = answerId ? document.getElementById(answerId) : null;
    
    // Initially closed by default
    expect(button).toHaveAttribute('aria-expanded', 'false');
    expect(firstAnswer).toHaveClass('hidden');
    
    // Click to open
    fireEvent.click(button);
    expect(button).toHaveAttribute('aria-expanded', 'true');
    expect(firstAnswer).not.toHaveClass('hidden');
    
    // Click to close
    fireEvent.click(button);
    expect(button).toHaveAttribute('aria-expanded', 'false');
    expect(firstAnswer).toHaveClass('hidden');
  });

  it('renders JSON-LD when jsonLd prop is true', () => {
    render(<FAQAccordion items={faqItems} jsonLd={true} />);
    
    const scriptElement = document.querySelector('script[type="application/ld+json"]');
    expect(scriptElement).toBeInTheDocument();
    
    if (scriptElement) {
      const jsonLd = JSON.parse(scriptElement.textContent || '{}');
      expect(jsonLd['@type']).toBe('FAQPage');
      expect(Array.isArray(jsonLd.mainEntity)).toBe(true);
      expect(jsonLd.mainEntity).toHaveLength(faqItems.length);
      
      faqItems.forEach((item, index) => {
        expect(jsonLd.mainEntity[index]).toEqual({
          '@type': 'Question',
          'name': item.q,
          'acceptedAnswer': {
            '@type': 'Answer',
            'text': item.a
          }
        });
      });
    }
  });

  it('applies custom className to container', () => {
    const { container } = render(
      <FAQAccordion items={faqItems} className="custom-class" />
    );
    
    const containerDiv = container.firstChild as HTMLElement;
    expect(containerDiv).toHaveClass('custom-class');
  });

  it('has first item open by default when defaultOpenFirst is true', () => {
    render(<FAQAccordion items={faqItems} defaultOpenFirst={true} />);
    
    const firstQuestion = screen.getByText(faqItems[0].q);
    const button = firstQuestion.closest('button');
    
    if (!button) {
      throw new Error('Button not found');
    }
    
    // Get the answer element using the button's aria-controls
    const answerId = button.getAttribute('aria-controls');
    const firstAnswer = answerId ? document.getElementById(answerId) : null;
    
    expect(button).toHaveAttribute('aria-expanded', 'true');
    expect(firstAnswer).not.toHaveClass('hidden');
  });
});
