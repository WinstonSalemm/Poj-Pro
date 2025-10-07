import bundleAnalyzer from '@next/bundle-analyzer';

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
});

// Security headers applied to all routes
const securityHeaders = [
  { key: 'Content-Security-Policy', value: 'upgrade-insecure-requests' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  // Enable after HTTPS is fully stable across all subdomains:
  // { key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains; preload' },
];

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  compress: true,
  generateEtags: true,
  distDir: process.env.DIST_IN_NODE_MODULES ? 'node_modules/.cache/next' : '.next',
  // Remove custom Turbopack rules; using Webpack loaders in Turbopack can break dev.
  experimental: {
    optimizePackageImports: ['@heroicons/react', 'react-icons', 'framer-motion', 'lucide-react', 'date-fns'],
    // Enable CSS optimization only in production; in dev it can break HMR/asset loading.
    optimizeCss: process.env.NODE_ENV === 'production',
    webpackBuildWorker: true,
  },
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error', 'warn'],
    } : false,
  },
  webpack: (config, { isServer, dev }) => {
    // Avoid customizing client optimization in development — it can break HMR and asset loading.
    if (!dev && !isServer) {
      config.optimization.splitChunks = {
        chunks: 'all',
        minSize: 20000,
        maxSize: 244000,
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all',
            priority: 10,
          },
          common: {
            name: 'common',
            minChunks: 2,
            chunks: 'all',
            priority: 5,
          },
          react: {
            test: /[\\/]node_modules[\\/](react|react-dom)[\\/]/,
            name: 'react',
            chunks: 'all',
            priority: 20,
          },
        },
      };
      config.optimization.usedExports = true;
      config.optimization.sideEffects = false;
    }
    return config;
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'www.poj-pro.uz' },
      { protocol: 'https', hostname: 'cdn.poj-pro.uz' },
      { protocol: 'https', hostname: 'placehold.co' },
      { protocol: 'http', hostname: 'localhost' },
      { protocol: 'https', hostname: 'localhost' },
    ],
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 31536000,
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    // Disable optimizer in development to prevent /_next/image 400s
    unoptimized: process.env.NODE_ENV !== 'production',
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: securityHeaders,
      },
      // Strong caching for static assets — PRODUCTION ONLY
      ...(process.env.NODE_ENV === 'production' ? [{
        source: '/:path*(svg|jpg|jpeg|png|gif|ico|css|js)',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      }, {
        source: '/_next/static/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      }, {
        source: '/:path*(woff2|woff|ttf|eot|avif|webp)',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      }, {
        // Cache HTML responses of catalog and product pages at CDN for 60s with SWR for a day
        source: '/catalog/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, s-maxage=60, stale-while-revalidate=86400' },
        ],
      }] : []),
    ];
  },
  eslint: {
    ignoreDuringBuilds: process.env.CI ? false : true,
  },
  typescript: {
    ignoreBuildErrors: false,
  },
  async redirects() {
    return [
      {
        source: '/lp/:slug*',
        destination: '/catalog',
        permanent: true,
      },
    ];
  },
};

export default withBundleAnalyzer(nextConfig);
