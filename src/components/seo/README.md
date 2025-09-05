# SEO JSON-LD Components

This directory contains reusable components for rendering structured data and SEO helpers.

- `JsonLd.tsx` — low-level `<script type="application/ld+json">` renderer.
- `BreadcrumbJsonLd.tsx` — renders a `BreadcrumbList` based on the current route and optional category name.
- `ProductSchema.tsx` — renders a `Product` with `Offer`, optional `AggregateRating` and `Review` blocks.
- `ItemListSchema.tsx` — renders an `ItemList` for category/listing pages.

## Usage

### Product pages (`src/app/catalog/[category]/[id]/page.tsx`)
```tsx
<ProductSchema
  name={product.name}
  description={product.description}
  sku={product.sku}
  brand={product.brand}
  images={product.images}
  url={productUrl}
  offers={{
    price: product.price,
    priceCurrency: 'UZS',
    availability: product.availability, // maps localized labels to schema.org URLs
    url: productUrl,
  }}
  aggregateRating={product.rating && {
    ratingValue: product.rating.value,
    reviewCount: product.rating.count,
  }}
  review={product.review && {
    author: product.review.author,
    reviewBody: product.review.body,
    name: product.review.title,
    reviewRating: {
      ratingValue: product.review.rating,
    },
  }}
/>
<BreadcrumbJsonLd categoryName={categoryTitle} />
```

### Category pages (`src/app/catalog/[category]/page.tsx`)
```tsx
<ItemListSchema
  itemListElement={products.map((p, i) => ({
    position: i + 1,
    name: p.name,
    url: `${siteUrl}/catalog/${category}/${p.slug}`,
    image: p.image,
  }))}
/>
```

## Requirements

- Required fields follow schema.org for `Product`, `Offer`, and `ItemList`.
- Components use a runtime `clean()` helper to remove null/undefined fields to avoid SEO warnings.
- Availability values accept localized labels and map to:
  - `https://schema.org/InStock`
  - `https://schema.org/OutOfStock`
  - `https://schema.org/PreOrder`

## Testing

- Unit tests: `pnpm test:unit:seo`
- E2E SEO checks: `pnpm test:e2e:seo` (requires dev server)

## Notes

- Breadcrumb JSON-LD uses `NEXT_PUBLIC_SITE_URL` for absolute URLs.
- Keep images and canonical URLs absolute wherever possible for better SEO signals.
