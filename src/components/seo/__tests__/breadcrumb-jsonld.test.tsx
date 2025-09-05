import React from 'react';
import { render } from '@testing-library/react';
import { BreadcrumbJsonLd } from '../BreadcrumbJsonLd';

// Mock next/router
jest.mock('next/router', () => ({
  useRouter: () => ({
    asPath: '/catalog/ognetushiteli',
  }),
}));

// Mock the JsonLd component to capture the data prop
interface JsonLdProps {
  data: {
    '@type': string;
    itemListElement: Array<{
      '@type': string;
      position: number;
      name: string;
      item: string;
    }>;
  };
  type?: string;
}

jest.mock('../JsonLd', () => ({
  JsonLd: ({ data }: JsonLdProps) => (
    <script 
      type="application/ld+json" 
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} 
      data-testid="json-ld"
    />
  ),
}));

describe('BreadcrumbJsonLd', () => {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  
  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();
  });

  it('renders default breadcrumbs when no items provided', () => {
    render(<BreadcrumbJsonLd />);
    
    const scriptElement = document.querySelector('script[type="application/ld+json"]');
    expect(scriptElement).toBeInTheDocument();
    
    if (scriptElement) {
      const jsonLd = JSON.parse(scriptElement.textContent || '{}');
      expect(jsonLd).toEqual({
        '@type': 'BreadcrumbList',
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: 'POJ PRO',
            item: `${baseUrl}/`
          }
        ]
      });
    }
  });

  it('includes category in breadcrumbs when categoryName is provided', () => {
    render(<BreadcrumbJsonLd categoryName="Огнетушители" />);
    
    const scriptElement = document.querySelector('script[type="application/ld+json"]');
    expect(scriptElement).toBeInTheDocument();
    
    if (scriptElement) {
      const jsonLd = JSON.parse(scriptElement.textContent || '{}');
      expect(jsonLd).toEqual({
        '@type': 'BreadcrumbList',
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: 'POJ PRO',
            item: `${baseUrl}/`
          },
          {
            '@type': 'ListItem',
            position: 2,
            name: 'Огнетушители',
            item: `${baseUrl}/catalog/ognetushiteli`
          }
        ]
      });
    }
  });

  it('uses provided items when available', () => {
    const items = [
      { name: 'Home', url: '/' },
      { name: 'Catalog', url: '/catalog' },
      { name: 'Fire Extinguishers', url: '/catalog/fire-extinguishers' }
    ];
    
    render(<BreadcrumbJsonLd items={items} />);
    
    const scriptElement = document.querySelector('script[type="application/ld+json"]');
    expect(scriptElement).toBeInTheDocument();
    
    if (scriptElement) {
      const jsonLd = JSON.parse(scriptElement.textContent || '{}');
      expect(jsonLd).toEqual({
        '@type': 'BreadcrumbList',
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: 'Home',
            item: `${baseUrl}/`
          },
          {
            '@type': 'ListItem',
            position: 2,
            name: 'Catalog',
            item: `${baseUrl}/catalog`
          },
          {
            '@type': 'ListItem',
            position: 3,
            name: 'Fire Extinguishers',
            item: `${baseUrl}/catalog/fire-extinguishers`
          }
        ]
      });
    }
  });

  it('handles empty items array by using default items', () => {
    render(<BreadcrumbJsonLd items={[]} />);
    
    const scriptElement = document.querySelector('script[type="application/ld+json"]');
    expect(scriptElement).toBeInTheDocument();
    
    if (scriptElement) {
      const jsonLd = JSON.parse(scriptElement.textContent || '{}');
      // Should still have the default item (POJ PRO)
      expect(jsonLd.itemListElement).toHaveLength(1);
      expect(jsonLd.itemListElement[0].name).toBe('POJ PRO');
    }
  });

  it('handles special characters in URLs', () => {
    const specialPath = 'special-category-123';
    render(<BreadcrumbJsonLd items={[{
      name: 'Test',
      url: `/en/catalog/${specialPath}`
    }]} />);
    
    const scriptElement = document.querySelector('script[type="application/ld+json"]');
    expect(scriptElement).toBeInTheDocument();
    
    if (scriptElement) {
      const jsonLd = JSON.parse(scriptElement.textContent || '{}');
      expect(jsonLd.itemListElement[0].item).toBe(`${baseUrl}/en/catalog/${specialPath}`);
    }
  });

  it('handles full URLs in items by extracting just the path', () => {
    const fullUrl = 'https://example.com/some/path';
    render(<BreadcrumbJsonLd items={[{
      name: 'External',
      url: fullUrl
    }]} />);
    
    const scriptElement = document.querySelector('script[type="application/ld+json"]');
    expect(scriptElement).toBeInTheDocument();
    
    if (scriptElement) {
      const jsonLd = JSON.parse(scriptElement.textContent || '{}');
      // The component should prepend the base URL to the path
      expect(jsonLd.itemListElement[0].item).toBe(`${baseUrl}/some/path`);
    }
  });
});
