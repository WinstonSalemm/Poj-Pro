import React from 'react';
import { render } from '@testing-library/react';
import { ProductSchema } from '../ProductSchema';

// Mock JsonLd to capture data prop
jest.mock('../JsonLd', () => ({
  JsonLd: ({ data }: { data: unknown }) => (
    <script type="application/ld+json" data-testid="json-ld" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />
  ),
}));

describe('ProductSchema JSON-LD', () => {
  it('renders minimal valid Product JSON-LD with UZS and mapped availability', () => {
    render(
      <ProductSchema
        product={{
          name: 'Огнетушитель ОП-5',
          description: 'Порошковый огнетушитель 5 кг',
          image: ['https://example.com/images/op-5.jpg'],
          category: 'Огнетушители',
          price: 250000,
          availability: 'в наличии',
          url: 'https://poj-pro.uz/ru/product/op-5',
        }}
      />
    );

    const script = document.querySelector('script[data-testid="json-ld"]');
    expect(script).toBeInTheDocument();
    const json = JSON.parse(script?.textContent || '{}');

    expect(json['@type']).toBe('Product');
    expect(json.name).toBe('Огнетушитель ОП-5');
    expect(json.image).toEqual(['https://example.com/images/op-5.jpg']);
    expect(json.brand).toEqual({ name: 'POJ PRO' });
    expect(json.offers).toEqual(
      expect.objectContaining({
        '@type': 'Offer',
        price: 250000,
        priceCurrency: 'UZS',
        availability: 'https://schema.org/InStock',
        url: 'https://poj-pro.uz/ru/product/op-5',
      })
    );

    // Ensure no null/undefined fields exist
    expect(JSON.stringify(json)).not.toMatch(/null|undefined/);
  });

  it('includes aggregateRating and reviews when provided', () => {
    render(
      <ProductSchema
        product={{
          name: 'Hydrant',
          description: 'Fire hydrant',
          image: ['https://example.com/hydrant.jpg'],
          category: 'Hydrants',
          price: '1000000',
          availability: 'под заказ',
          url: 'https://poj-pro.uz/ru/product/hydrant',
          aggregateRating: { ratingValue: 4.6, reviewCount: 12 },
          review: [
            {
              author: 'Ivan',
              datePublished: '2024-05-10',
              reviewBody: 'Отлично',
              reviewRating: { ratingValue: 5 },
            },
          ],
        }}
      />
    );

    const script = document.querySelector('script[data-testid="json-ld"]');
    const json = JSON.parse(script?.textContent || '{}');

    expect(json.aggregateRating).toEqual(
      expect.objectContaining({ '@type': 'AggregateRating', ratingValue: 4.6, reviewCount: 12 })
    );
    expect(json.review[0]).toEqual(
      expect.objectContaining({ '@type': 'Review', author: 'Ivan', reviewBody: 'Отлично' })
    );
    expect(json.review[0].reviewRating).toEqual(
      expect.objectContaining({ '@type': 'Rating', ratingValue: 5 })
    );

    // PreOrder mapping
    expect(json.offers.availability).toBe('https://schema.org/PreOrder');
  });

  it('omits optional blocks when not provided', () => {
    render(
      <ProductSchema
        product={{
          name: 'Detector',
          description: 'Smoke detector',
          image: ['https://example.com/detector.jpg'],
          category: 'Detectors',
          price: 150000,
          url: 'https://poj-pro.uz/ru/product/detector',
        }}
      />
    );

    const script = document.querySelector('script[data-testid="json-ld"]');
    const json = JSON.parse(script?.textContent || '{}');

    expect(json.aggregateRating).toBeUndefined();
    expect(json.review).toBeUndefined();
  });
});
