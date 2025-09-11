// src/lib/seo/jsonld.ts
// Helpers to generate JSON-LD payloads for SEO

export type BreadcrumbItem = {
  name: string;
  item: string;
};

export function breadcrumbJsonLd(items: BreadcrumbItem[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((it, idx) => ({
      '@type': 'ListItem',
      position: idx + 1,
      name: it.name,
      item: it.item,
    })),
  };
}

export function faqJsonLd(faqs: { question: string; answer: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((f) => ({
      '@type': 'Question',
      name: f.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: f.answer,
      },
    })),
  };
}

export function itemListJsonLd(params: {
  name?: string;
  urlBase: string; // e.g. https://example.com/catalog/ognetushiteli
  items: { name: string; url: string; image?: string }[];
}) {
  const { name, urlBase, items } = params;
  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name,
    url: urlBase,
    mainEntity: {
      '@type': 'ItemList',
      itemListElement: items.map((p, idx) => ({
        '@type': 'ListItem',
        position: idx + 1,
        url: p.url,
        name: p.name,
        image: p.image,
      })),
    },
  };
}
