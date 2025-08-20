'use client';

import Script from 'next/script';

type JsonLdProps = {
  data: Record<string, unknown>;
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
