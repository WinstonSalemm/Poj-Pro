import React from 'react';
import { render } from '@testing-library/react';
import { NonceProvider } from '@/context/NonceContext';
import { JsonLd } from '@/components/seo/JsonLd';
import ProductJsonLd from '@/components/seo/ProductJsonLd';
import type { Product } from '@/types/product';
import { itemListJsonLd } from '@/lib/seo/jsonld';

describe('JSON-LD rendering', () => {
  test('JsonLd renders a script with application/ld+json when nonce provided', () => {
    const data = { name: 'Test', '@type': 'Thing' } as unknown as Record<string, unknown>;
    render(
      <NonceProvider nonce="test-nonce">
        <JsonLd data={data} type="Thing" keyOverride="thing" />
      </NonceProvider>
    );
    const scripts = document.querySelectorAll('script[type="application/ld+json"]');
    expect(scripts.length).toBeGreaterThan(0);
  });

  test('ProductJsonLd emits Product JSON-LD with required fields', () => {
    const product: Product = {
      id: 'p1',
      slug: 'op-5',
      title: 'Огнетушитель ОП-5',
      image: '/ProductImages/Op-5.png',
      price: 115000,
      description: 'Порошковый огнетушитель 5 кг',
      category: 'ognetushiteli',
    };
    render(
      <NonceProvider nonce="test-nonce">
        <ProductJsonLd product={product} categorySlug="ognetushiteli" />
      </NonceProvider>
    );
    const scripts = document.querySelectorAll('script[type="application/ld+json"]');
    expect(scripts.length).toBeGreaterThan(0);
    const last = scripts[scripts.length - 1];
    const json = JSON.parse(last.textContent || '{}');
    expect(json['@type']).toBe('Product');
    expect(json.name).toBeTruthy();
    expect(json.offers).toBeTruthy();
  });

  test('itemListJsonLd returns schema with ItemList entries', () => {
    const schema = itemListJsonLd({
      name: 'Огнетушители — каталог',
      urlBase: 'https://www.poj-pro.uz/catalog/ognetushiteli',
      items: [
        { name: 'ОП‑5', url: 'https://www.poj-pro.uz/catalog/ognetushiteli/op-5' },
        { name: 'ОУ‑10', url: 'https://www.poj-pro.uz/catalog/ognetushiteli/ou-10' },
      ],
    });
    expect(schema).toHaveProperty('mainEntity');
    type ItemListSchema = { mainEntity?: { itemListElement?: unknown[] } };
    const s = schema as ItemListSchema;
    expect((s.mainEntity?.itemListElement || []).length).toBe(2);
  });
});
