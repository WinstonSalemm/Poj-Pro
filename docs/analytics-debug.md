# GA4 via GTM: Setup, Debug, and Verification

This project pushes typed GA4 events to `window.dataLayer` (Consent Mode v2 respected) and expects GTM to forward them to GA4.

## 1) Google Tag Manager (GTM) setup

- Create/Use a Web container. In `src/app/layout.tsx` GTM loads when `NEXT_PUBLIC_GTM_ID` is set.
- Add a GA4 Configuration tag:
  - Tag type: Google Analytics: GA4 Configuration
  - Measurement ID: from `NEXT_PUBLIC_GA_ID`
  - Trigger: All Pages
  - Fields to set (optional): send_page_view=true
- Add GA4 Event tags for each event you send from code: `view_item`, `view_item_list`, `add_to_cart`, `remove_from_cart`, `begin_checkout`, `purchase`, `generate_lead`.
  - Tag type: GA4 Event
  - Configuration tag: use the GA4 Configuration above
  - Event Name: match the dataLayer `event` exactly
  - Event Parameters: map from Data Layer Variables (DLV):
    - value -> value (Number)
    - currency -> currency (Text)
    - items -> items (Object array) [pass-through]
  - For item-level params (if you also need flattened params): create DLVs and map as needed
  - Trigger: Custom Event with Event name exactly matching, e.g. `add_to_cart`
- Create Data Layer Variables (DLV):
  - value: Data Layer Variable Name: `value`
  - currency: `currency`
  - items: `items`
  - For inner fields GTM reads them from items automatically when sent as array to GA4.
- Publish the container.

Notes:
- The app already normalizes each item to GA4 schema: `{ item_id, item_name, item_category, price, quantity }` with `currency: 'UZS'` when applicable.
- Consent Mode v2 is initialized denied by default and updated on accept in `CookieConsentModal`.

## 2) GA4 property setup

- Admin → Data Streams → Web: verify Measurement ID matches `NEXT_PUBLIC_GA_ID`.
- Configure Conversions (mark as conversion):
  - purchase
  - generate_lead
  - begin_checkout
  - add_to_cart
- Link GA4 to Google Ads (Admin → Google Ads Links) and enable auto-import conversions.

## 3) Debugging

- Enable DebugView: open your site with GA Debug enabled (e.g., GA Debugger extension or use `?gtm_debug=x` with GTM preview).
- GTM Preview: in GTM, click Preview, enter your site URL, and verify events appear with payloads.
- In Dev builds, the app logs dataLayer pushes unless `NODE_ENV==='test'`.

Checklist when testing:
- Accept cookies → Consent should update (gtag consent update) and events start reaching GA4.
- Navigate to a product page → expect `view_item` with single item payload.
- Open category listing → expect `view_item_list` with multiple items.
- Add/Remove item in cart → `add_to_cart` / `remove_from_cart` fired with correct quantities.
- Begin checkout → `begin_checkout` with items/value.
- Purchase success page → `purchase` with `transaction_id` and items.

## 4) Playwright E2E analytics checks

We include Playwright test scaffolding to assert dataLayer pushes (see `e2e/analytics.spec.ts`).

- Install and run locally:
  ```sh
  npm i -D @playwright/test
  npx playwright install
  # in another terminal: npm run dev
  npx playwright test
  ```
- Configure base URL via env `E2E_BASE_URL` (default http://localhost:3000).
- Tests capture `window.__pushedEvents` by monkey-patching `dataLayer.push` and then assert expected events and params.

Screenshots to capture (for internal docs):
- GTM: GA4 Config tag, Event tag mapping, Preview showing event payload
- GA4: DebugView stream with events, Conversions list marked
- Google Ads: Linked accounts page and conversions auto-import enabled
