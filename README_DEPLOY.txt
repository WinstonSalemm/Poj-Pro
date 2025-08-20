Deployment instructions (manual upload)

1) Server requirements
- Node.js 20+
- npm available
- Set environment variables from env/.env.example (especially DATABASE_URL)

2) Unzip contents to your server directory.

3) Install runtime dependencies
Windows PowerShell:
  npm ci

4) Use the prebuilt Next.js output bundled here
We built into node_modules/.cache/next. To make Next.js use it, set ENV before start:
Windows PowerShell:
  $env:DIST_IN_NODE_MODULES=1; npm start
Linux/macOS bash:
  DIST_IN_NODE_MODULES=1 npm start

5) Prisma migrations (optional, prod DB only)
  npx prisma migrate deploy

Notes:
- If you prefer default .next directory, rebuild on the server:
  npm run build
  npm start
- Security headers and image domains are configured in next.config.ts
- If external images are used beyond placehold.co, add domains in next.config.ts
