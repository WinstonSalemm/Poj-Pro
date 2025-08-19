'use client';

import Script from 'next/script';
import { ReactNode } from 'react';

type JsonLdProps = {
  data: any;
  type?: string;
  keyOverride?: string;
};

export function JsonLd({ data, type, keyOverride }: JsonLdProps) {
  return (
    <Script
      id={`jsonld-${keyOverride || type || 'default'}`}
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': type,
          ...data,
        }),
      }}
    />
  );
}
