# LIGHTHOUSE.md

To be filled after running audits.

## Targets
- Performance (mobile/desktop): >= 90
- SEO: 100
- Accessibility: >= 95
- Best Practices: >= 95

## How to run
- Open the production preview or `npm start` locally, then run Lighthouse (Chrome DevTools or PageSpeed Insights).
- Record results here with date/time, URL, and applied optimizations.

## Applied optimizations (initial)
- robots.txt added with Disallow for `/adminProducts`.
- `/adminProducts` marked noindex/nofollow via route metadata.

## Next steps
- Measure LCP image and mark priority appropriately on key pages.
- Consider dynamic imports for heavy components.
