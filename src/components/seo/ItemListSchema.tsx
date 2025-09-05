import React from 'react';
import { JsonLd } from './JsonLd';
import { clean, ItemListJsonLd } from './jsonld.schemas';

export interface ItemListSchemaProps {
  items: Array<{
    name: string;
    url: string;
    position: number;
    image?: string;
  }>;
  keyOverride?: string;
}

export const ItemListSchema: React.FC<ItemListSchemaProps> = ({ items, keyOverride }) => {
  const data = clean({
    '@type': 'ItemList' as const,
    itemListElement: items.map((i) =>
      clean({ '@type': 'ListItem' as const, name: i.name, url: i.url, position: i.position, image: i.image })
    ),
  }) as ItemListJsonLd;

  return <JsonLd data={data as unknown as Record<string, unknown>} type="ItemList" keyOverride={keyOverride || 'itemlist'} />;
};

export default ItemListSchema;
