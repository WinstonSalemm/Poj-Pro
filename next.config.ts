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
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self';",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://www.google-analytics.com;",
              "style-src 'self' 'unsafe-inline';",
              "img-src 'self' data: blob: https:;",
              "font-src 'self';",
              "connect-src 'self' https://www.google-analytics.com;",
              "frame-src 'self';",
            ].join(' ')
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
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
  // Disable ESLint during build
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Disable TypeScript type checking during build
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
