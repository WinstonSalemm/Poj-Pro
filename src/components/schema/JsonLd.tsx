'use client';

import Script from 'next/script';
import { useCspNonce } from '@/context/NonceContext';

// Define recursive types for JSON-LD data structures
// Use an interface for objects to allow for recursive type definitions
interface JsonLdObject {
  [key: string]: JsonLdValue;
}
type JsonLdValue =
  | string
  | number
  | boolean
  | null
  | JsonLdObject
  | JsonLdValue[];

interface JsonLdProps {
  data: JsonLdObject;
  type?: string;
  keyOverride?: string;
}

export const JsonLd = ({
  data,
  type = 'application/ld+json',
  keyOverride,
}: JsonLdProps) => {
  const nonce = useCspNonce();
  return (
    <Script
      id="json-ld"
      type={type}
      nonce={nonce}
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data),
      }}
      key={`json-ld${keyOverride ? `-${keyOverride}` : ''}`}
    />
  );
};
