# DEPLOY.md

This project is a Next.js (App Router) app. Below are safe steps to deploy without code changes using your preferred platform.

## Prerequisites
- Node.js 20+
- Package manager: npm
- Environment variables configured (see `env/.env.example`).

## Build locally
```
npm ci
npm run build
npm start
```

## Vercel (recommended)
1) Import the repo in Vercel.
2) Framework preset: Next.js.
3) Root directory: repository root.
4) Build Command: `npm run build`
5) Output: `.next`
6) Environment Variables: copy from `.env.example`.
7) Set `NODE_ENV=production`.

## Netlify
- Use Next.js runtime plugin (auto-detected for Next 15).
- Build: `npm run build`
- Publish directory: `.next`
- Environment variables as above.

## Cloudflare Pages
- Build command: `npm run build`
- Build output directory: `.next`
- Enable Next.js support (Pages Functions).

## Headers and Caching
- Security headers are defined in `next.config.ts` via `headers()`.
- Static assets are managed by Next; long-term caching is automatic for hashed assets.

## Prisma
- Ensure DATABASE_URL is set.
- For migrations in production:
```
npx prisma migrate deploy
```

## Monitoring
- Sentry is included (`@sentry/nextjs`). Configure DSN via env if used.
