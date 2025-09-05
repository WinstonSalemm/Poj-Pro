import React from 'react';
import { render, screen } from '@testing-library/react';
import { CTASection } from '../CTASection';

type TranslationKey = 'seo:cta' | 'seo:ariaLabels';

// Mock next-i18next
jest.mock('next-i18next', () => ({
  useTranslation: () => ({
    t: (key: TranslationKey) => {
      const translations = {
        'seo:cta': {
          buyNow: 'Купить сейчас',
          consult: 'Получить консультацию',
        },
        'seo:ariaLabels': {
          buyNow: 'Перейти к покупке',
          consult: 'Получить консультацию',
        },
      };
      
      if (key in translations) {
        return translations[key as keyof typeof translations];
      }
      return key;
    },
  }),
}));

// Mock next/link
jest.mock('next/link', () => {
  return function MockedLink({ 
    href, 
    children, 
    className,
    ...props 
  }: { 
    href: string; 
    children: React.ReactNode; 
    className?: string;
    [key: string]: unknown;
  }) {
    return (
      <a href={href} className={className} {...props}>
        {children}
      </a>
    );
  };
});

describe('CTASection', () => {
  it('renders with default props', () => {
    render(<CTASection />);
    
    // Check if buttons are rendered with correct attributes
    const buyNowLink = screen.getByRole('link', { name: 'ariaLabels.buyNow' });
    expect(buyNowLink).toBeInTheDocument();
    expect(buyNowLink).toHaveAttribute('href', '/catalog');
    expect(buyNowLink).toHaveClass('px-6', 'py-3', 'bg-blue-600', 'text-white');
    
    const consultLink = screen.getByRole('link', { name: 'ariaLabels.consult' });
    expect(consultLink).toBeInTheDocument();
    expect(consultLink).toHaveAttribute('href', '/contacts');
    expect(consultLink).toHaveClass('px-6', 'py-3', 'border-2', 'border-blue-600', 'text-blue-600');
  });

  it('renders with category prop', () => {
    render(<CTASection category="ognetushiteli" />);
    
    const buyNowLink = screen.getByRole('link', { name: 'ariaLabels.buyNow' });
    expect(buyNowLink).toHaveAttribute('href', '/catalog/ognetushiteli');
  });

  it('handles different category slugs correctly', () => {
    render(<CTASection category="pozharnye-krany" />);
    
    const buyNowLink = screen.getByRole('link', { name: 'ariaLabels.buyNow' });
    expect(buyNowLink).toHaveAttribute('href', '/catalog/pozharnye-krany');
    
    const consultLink = screen.getByRole('link', { name: 'ariaLabels.consult' });
    expect(consultLink).toHaveAttribute('href', '/contacts');
  });

  it('applies custom class name to container', () => {
    const { container } = render(
      <CTASection category="ognetushiteli" className="custom-class" />
    );
    
    // The container div should have both the default and custom classes
    const containerDiv = container.firstChild as HTMLElement;
    expect(containerDiv).toHaveClass('flex');
    expect(containerDiv).toHaveClass('custom-class');
  });
});
