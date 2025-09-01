import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // переключаемо через ENV:
  //   Windows CMD:  set DIST_IN_NODE_MODULES=1 && npm run dev
  //   PowerShell:   $env:DIST_IN_NODE_MODULES=1; npm run dev
  distDir: process.env.DIST_IN_NODE_MODULES ? 'node_modules/.cache/next' : '.next',
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          // modern browsers ignore X-XSS-Protection; remove to avoid noise
          // { key: 'X-XSS-Protection', value: '0' },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            // disable sensitive features by default; extend as needed
            value: 'geolocation=(), microphone=(), camera=()',
          },
          // Optional: enable HSTS only when the site is 100% HTTPS (apex + subdomains)
          // After verifying HTTPS, uncomment the header below (max-age ~180 days):
          // {
          //   key: 'Strict-Transport-Security',
          //   value: 'max-age=15552000; includeSubDomains; preload',
          // },
        ],
      },
    ];
  },
  // Configure image domains
  images: {
    domains: ['placehold.co'],
  },
  // Disable React's StrictMode for development to prevent double rendering
  reactStrictMode: process.env.NODE_ENV !== 'production',
  // ESLint: do NOT ignore during build in CI
  eslint: {
    ignoreDuringBuilds: process.env.CI ? false : true,
  },
  // Disable TypeScript type checking during build
  typescript: {
    ignoreBuildErrors: false,
  },
};

export default nextConfig;
