'use client';

import { JsonLd } from './JsonLd';

export interface WebsiteSchemaProps {
  name: string;
  url: string;
  description?: string;
  searchAction: string;
  potentialAction: {
    target: string;
    queryInput: string;
  };
}

export const WebsiteSchema = (props: WebsiteSchemaProps) => {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: props.name,
    url: props.url,
    ...(props.description && { description: props.description }),
    potentialAction: [
      {
        '@type': 'SearchAction',
        target: {
          '@type': 'EntryPoint',
          urlTemplate: props.searchAction,
        },
        'query-input': props.potentialAction.queryInput,
      },
    ],
  };

  return <JsonLd data={schema} keyOverride="website" />;
};
