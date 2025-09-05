'use client';

import { JsonLd } from './JsonLd';

export interface OrganizationSchemaProps {
  name: string;
  legalName?: string;
  url: string;
  logo: string;
  description?: string;
  address: {
    streetAddress: string;
    addressLocality: string;
    addressRegion?: string;
    postalCode: string;
    addressCountry: string;
  };
  contactPoint: {
    telephone: string;
    contactType: string;
    email?: string;
    areaServed?: string | string[];
    availableLanguage?: string | string[];
  };
  sameAs?: string[];
  foundingDate?: string;
  foundingLocation?: string;
  employees?: {
    '@type': 'Person';
    name: string;
    jobTitle: string;
  }[];
}

export const OrganizationSchema = (props: OrganizationSchemaProps) => {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: props.name,
    legalName: props.legalName || props.name,
    url: props.url,
    logo: props.logo,
    ...(props.description && { description: props.description }),
    address: {
      '@type': 'PostalAddress',
      streetAddress: props.address.streetAddress,
      addressLocality: props.address.addressLocality,
      ...(props.address.addressRegion && { addressRegion: props.address.addressRegion }),
      postalCode: props.address.postalCode,
      addressCountry: props.address.addressCountry,
    },
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: props.contactPoint.telephone,
      contactType: props.contactPoint.contactType,
      ...(props.contactPoint.email && { email: props.contactPoint.email }),
      areaServed: props.contactPoint.areaServed || 'UZ',
      availableLanguage: props.contactPoint.availableLanguage || ['Russian', 'Uzbek', 'English'],
    },
    sameAs: props.sameAs || [],
    ...(props.foundingDate && { foundingDate: props.foundingDate }),
    ...(props.foundingLocation && { foundingLocation: props.foundingLocation }),
    ...(props.employees && { employees: props.employees }),
  };

  return <JsonLd data={schema} keyOverride="organization" />;
};
