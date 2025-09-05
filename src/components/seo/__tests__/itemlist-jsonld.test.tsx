import React from 'react';
import { render } from '@testing-library/react';
import { ItemListSchema } from '../ItemListSchema';

jest.mock('../JsonLd', () => ({
  JsonLd: ({ data }: { data: unknown }) => (
    <script type="application/ld+json" data-testid="json-ld" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />
  ),
}));

describe('ItemListSchema JSON-LD', () => {
  it('renders ItemList with positions and without nulls', () => {
    render(
      <ItemListSchema
        items={[
          { name: 'Огнетушители', url: 'https://poj-pro.uz/ru/catalog/ognetushiteli', position: 1 },
          { name: 'Гидранты', url: 'https://poj-pro.uz/ru/catalog/hydrants', position: 2, image: 'https://example.com/hydrant.jpg' },
        ]}
      />
    );

    const script = document.querySelector('script[data-testid="json-ld"]');
    expect(script).toBeInTheDocument();
    const json = JSON.parse(script?.textContent || '{}');

    expect(json['@type']).toBe('ItemList');
    expect(Array.isArray(json.itemListElement)).toBe(true);
    expect(json.itemListElement[0]).toEqual(
      expect.objectContaining({ '@type': 'ListItem', name: 'Огнетушители', position: 1 })
    );
    expect(json.itemListElement[1]).toEqual(
      expect.objectContaining({ '@type': 'ListItem', url: 'https://poj-pro.uz/ru/catalog/hydrants', image: 'https://example.com/hydrant.jpg' })
    );

    expect(JSON.stringify(json)).not.toMatch(/null|undefined/);
  });
});
