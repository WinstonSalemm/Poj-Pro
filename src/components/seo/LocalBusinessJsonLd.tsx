import React from 'react';
import { JsonLd } from './JsonLd';
import { clean } from './jsonld.schemas';

export interface LocalBusinessAddress {
  streetAddress: string;
  addressLocality: string;
  addressRegion?: string;
  postalCode?: string;
  addressCountry: string;
}

export interface LocalBusinessJsonLdProps {
  name: string;
  url: string;
  telephone: string;
  image?: readonly string[];
  priceRange?: string; // e.g. "$$"
  address: LocalBusinessAddress;
  openingHours?: readonly string[]; // e.g. ["Mo-Fr 09:00-18:00", "Sa 10:00-16:00"]
  sameAs?: readonly string[]; // social links
}

const LocalBusinessJsonLd: React.FC<LocalBusinessJsonLdProps> = ({ name, url, telephone, image, priceRange, address, openingHours, sameAs }) => {
  const data = clean({
    '@type': 'LocalBusiness',
    name,
    url,
    telephone,
    image,
    priceRange,
    address: clean({
      '@type': 'PostalAddress',
      streetAddress: address.streetAddress,
      addressLocality: address.addressLocality,
      addressRegion: address.addressRegion,
      postalCode: address.postalCode,
      addressCountry: address.addressCountry,
    }),
    openingHours,
    sameAs,
  });

  return <JsonLd data={data} type="LocalBusiness" keyOverride="localbusiness" />;
};

export default LocalBusinessJsonLd;
