'use client';
import { COMPANY } from '@/config/company';

export default function LocalBusinessJsonLd(){
  const data = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: COMPANY.name,
    legalName: COMPANY.legalName,
    url: COMPANY.url,
    telephone: COMPANY.phoneE164,
    email: COMPANY.email,
    logo: COMPANY.logoUrl,
    image: COMPANY.logoUrl,
    address: {
      '@type': 'PostalAddress',
      streetAddress: COMPANY.address.streetAddress,
      addressLocality: COMPANY.address.addressLocality,
      postalCode: COMPANY.address.postalCode,
      addressCountry: COMPANY.address.addressCountry,
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: COMPANY.geo.lat,
      longitude: COMPANY.geo.lng,
    },
    openingHoursSpecification: COMPANY.openingHours.map(h=>({
      '@type':'OpeningHoursSpecification',
      dayOfWeek: h.dayOfWeek.map(d=>'https://schema.org/'+d),
      opens: h.opens,
      closes: h.closes,
    })),
    sameAs: COMPANY.sameAs,
  };
  return <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify(data)}} />;
}
