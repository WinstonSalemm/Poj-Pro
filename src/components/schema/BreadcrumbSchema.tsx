'use client';

import { JsonLd } from './JsonLd';

export interface BreadcrumbItem {
  name: string;
  item: string;
  position: number;
}

export interface BreadcrumbSchemaProps {
  itemList: BreadcrumbItem[];
}

export const BreadcrumbSchema = ({ itemList }: BreadcrumbSchemaProps) => {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: itemList.map((item) => ({
      '@type': 'ListItem',
      position: item.position,
      name: item.name,
      item: item.item,
    })),
  };

  return <JsonLd data={schema} keyOverride="breadcrumb" />;
};
