'use client';

import Script from 'next/script';
import { useCspNonce } from '@/context/NonceContext';

type JsonLdProps = {
  data: Record<string, unknown>;
  type?: string;
  keyOverride?: string;
};

export function JsonLd({ data, type, keyOverride }: JsonLdProps) {
  const nonce = useCspNonce();
  // If a strict CSP is injected by the environment and we don't have a nonce,
  // skip rendering inline JSON-LD to avoid hard reload failures in dev.
  if (!nonce && process.env.NODE_ENV !== 'production') {
    return null;
  }
  return (
    <Script
      id={`jsonld-${keyOverride || type || 'default'}`}
      type="application/ld+json"
      nonce={nonce}
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
