# poj-pro.uz
## Ads & GA4

This app sends typed GA4 ecommerce events to `window.dataLayer` and loads GTM (Consent Mode v2). Use GTM to forward events to GA4 and Google Ads (conversions + dynamic remarketing).

### Environment variables in the app

- `NEXT_PUBLIC_GTM_ID` — GTM container ID
- `NEXT_PUBLIC_GA_ID` — GA4 Measurement ID
- `NEXT_PUBLIC_YM_ID` — Yandex Metrica ID (optional)

Note: Google Ads Conversion ID/Label are configured inside GTM’s Google Ads tags. They are not read from the Next.js app env.

### GTM: GA4 and Ads

1) GA4 Configuration tag
- Tag: Google Analytics: GA4 Configuration
- Measurement ID: `NEXT_PUBLIC_GA_ID`
- Trigger: All Pages

2) GA4 Event tags (one per event)
- Events: `view_item`, `view_item_list`, `add_to_cart`, `remove_from_cart`, `begin_checkout`, `purchase`, `generate_lead`
- Parameters mapping via Data Layer Variables (DLV):
  - value → value (Number)
  - currency → currency (Text)
  - items → items (Object array)

3) Google Ads Conversion tags
- Create 2 tags:
  - Purchase: Google Ads Conversion Tracking (use your Conversion ID/Label)
  - Generate lead: Google Ads Conversion Tracking (use your Conversion ID/Label)
- Trigger for each tag: Custom Event matching your dataLayer `event` (`purchase`, `generate_lead`)
- Send conversion value: map from DLV `value`; currency from DLV `currency` (UZS)

4) Google Ads Remarketing (Dynamic)
- Tag: Google Ads Remarketing
- Parameters from dataLayer (already pushed by the app):
  - `ecomm_prodid` — product id or an array of ids
  - `ecomm_pagetype` — one of `product` | `category` | `cart` | `purchase`
  - `ecomm_totalvalue` — numeric value
- Triggers:
  - Category list: `view_item_list`
  - Product: `view_item`
  - Cart/Checkout: `add_to_cart`, `remove_from_cart`, `begin_checkout`
  - Purchase: `purchase`

The app enriches pushes with these fields in `src/lib/analytics/dataLayer.ts`.

### GA4 ↔ Google Ads

- In GA4 Admin → Google Ads Links: link the Ads account and enable auto-import conversions.
- In GA4 Conversions, mark: `purchase`, `generate_lead`, `begin_checkout`, `add_to_cart`.

### Validation

- GTM Preview (Tag Assistant):
  - Open preview with your site, verify GA4 and Ads tags fire on the intended events.
  - Inspect `items`, `value`, `currency`, and remarketing params.
- GA4 DebugView: confirm events arrive with parameters.
- E2E (Playwright): see `e2e/analytics.spec.ts` for checks of `view_item` / `view_item_list` and negative assertions. Configure URLs via `E2E_PRODUCT_URL`, `E2E_CATEGORY_URL`.

### Pre-prod checklist

- [ ] GTM container published (GA4 Config + Event tags + Ads Conversion tags + Remarketing)
- [ ] GA4 property linked to Google Ads, auto-import conversions on
- [ ] Conversions marked in GA4 (purchase, generate_lead, begin_checkout, add_to_cart)
- [ ] Consent banner verified: events flow only after consent
- [ ] DebugView/Preview verified on key pages (category/product/cart/checkout/purchase)


E-commerce platform built with Next.js, TypeScript, and Tailwind CSS.

## 🚀 Getting Started

### Prerequisites

- Node.js 18.17 or later
- npm or yarn
- PostgreSQL database

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```
3. Set up environment variables (copy `.env.example` to `.env` and fill in the values)
4. Run database migrations:
   ```bash
   npm run db:migrate
   ```
5. Start the development server:
   ```bash
   npm run dev
   ```

## 🛠 Development

### SEO and Performance Check

We've set up a comprehensive SEO and performance checking utility using Lighthouse CI. This tool helps ensure your site meets best practices for performance, accessibility, SEO, and more.

#### Available Commands

- `npm run seo-check` - Run a full SEO and performance check on your local development server
- `npm run seo:report` - View the latest SEO report in your browser

#### How It Works

The SEO check utility will:
1. Start your Next.js development server
2. Run Lighthouse CI against your local site
3. Generate detailed reports in the `seo-reports` directory
4. Open the latest report in your default browser

#### Configuration

You can customize the SEO check settings in `.lighthouserc.js`. The default configuration:
- Tests multiple pages (home, about, catalog)
- Enforces minimum scores:
  - Performance: 85/100
  - Accessibility: 90/100
  - Best Practices: 90/100
  - SEO: 90/100
  - PWA: 90/100

#### Viewing Reports

After running the SEO check, you can find the reports in the `seo-reports` directory. The latest report is always available at `seo-reports/latest.html`.

### Running Tests

```bash
# Run end-to-end tests
npm run test:e2e

# Run tests in UI mode
npm run test:ui
```

## 🚀 Deployment

### Vercel

This project is configured for deployment on Vercel. Push your changes to the main branch to trigger an automatic deployment.

### Environment Variables

Make sure to set up the following environment variables in your production environment:

```
DATABASE_URL=your_database_url
NEXTAUTH_SECRET=your_auth_secret
NEXTAUTH_URL=your_production_url
# ... other required variables
```

## 📚 Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [NextAuth.js Documentation](https://next-auth.js.org)
