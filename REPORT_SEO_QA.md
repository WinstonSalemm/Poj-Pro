# REPORT_SEO_QA

Status legend: OK = compliant, Fixed = changed in this PR, Blocker = requires follow-up before prod, N/A = not applicable

## 0) Подготовка
- Branch snapshot: Fixed — create `rescue-snapshot` then `pre-deploy-hardening`
- Clean & reinstall: Pending — run commands in this report

## 1) Статический анализ
- ESLint/TS compile clean: Blocker — build-time checks currently disabled in `next.config.ts` (eslint.ignoreDuringBuilds, typescript.ignoreBuildErrors). Recommend enabling temporarily to surface issues, then fix. Low-risk fixes planned.
- Bad patterns (hooks/SSR-danger): OK (initial scan)
- any/ts-ignore/TODO/FIXME: Pending — run lints search

## 2) Конфиги и сборка
- `next.config.ts`: OK with minimal keys; CSP exists. Note: CSP includes 'unsafe-inline' for scripts/styles — keep for now to avoid breakage. Follow-up tighten.
- `tsconfig.json`: OK (skipLibCheck true). Keep for faster builds.
- No major upgrades planned: OK

## 3) i18n и контент
- Locales: ru/eng/uzb OK; detection enabled.
- Namespaces: Potential Issue — `next-i18next.config.js` sets `defaultNS: 'aboutus'`. Risk of cross-namespace fallbacks (e.g., "popularProducts"). Follow-up: set sane default (e.g., 'translation') and audit keys.
- Missing keys: Pending — run `npm run i18n:check`
- Currency format UZS unified: Pending — verify components

## 4) SEO
- robots.txt: Fixed — `Disallow: /adminProducts`
- /adminProducts noindex: Fixed — `metadata.robots` set to noindex/nofollow in `src/app/adminProducts/page.tsx`
- sitemap.xml: OK — `src/app/sitemap.ts` exists with localized alternates
- canonical/hreflang: Pending — verify per page templates
- OG/Twitter: Pending — verify on home/category/product
- schema.org JSON-LD: Pending — add Organization/Product/Breadcrumb
- Images alt/next/image/lazy: Pending — audit key components

## 5) Доступность (A11y)
- Keyboard focus/visible :focus: Pending — audit
- aria-атрибуты/labels: Pending — audit forms/modals
- Semantics landmarks: Pending — verify `layout.tsx`

## 6) Безопасность и заголовки
- Security headers: OK — present in `next.config.ts`
- CSP: Known Risk — allows 'unsafe-inline' to keep current UX. Follow-up tighten with nonce.
- Referrer-Policy, Permissions-Policy, HSTS: Pending — can add in headers()
- External SDK SSR: Pending — audit, wrap with dynamic({ ssr: false }) if needed

## 7) Функциональный QA
- Primary pages flow: Pending — run manual + Playwright smoke
- /adminProducts hidden from UI/search: OK — not referenced anywhere and robots/noindex in place

## 8) Производительность (CWV)
- Lighthouse targets: Pending — to run and record
- Bundle size/code-splitting: Pending — consider dynamic imports for heavy blocks
- LCP/TBT/CLS: Pending — optimize after measurements

## 9) Тесты и CI
- Playwright configs exist: OK (see `tests/`)
- SEO tests: Pending — add specific checks for canonical/hreflang
- GitHub Actions: Pending — add workflow

## 10) Готовность к деплою
- DEPLOY.md: Fixed — added with steps for Vercel/Netlify/CF Pages
- .env.example: Fixed — added under env/.env.example
- Static asset caching: Pending — tune headers for immutable assets

## 11) Артефакты
- LIGHTHOUSE.md: Pending — run and paste results
- ACCESSIBILITY.md: Pending — audit and screenshots
- CHANGES.md: Fixed — added summary of edits

## TL;DR Blockers
- Build-time checks disabled in `next.config.ts`. Action: temporarily enable to surface issues, fix, then optionally relax before hotfix.
- i18n defaultNS = 'aboutus' likely misroutes keys. Action: switch to 'translation' after verifying usages.
- CSP is permissive ('unsafe-inline'). Action: follow-up hardening with nonce/hash after verifying inline scripts/styles usage.
