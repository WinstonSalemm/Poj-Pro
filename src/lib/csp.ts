import { v4 as uuidv4 } from 'uuid';

export const generateNonce = (): string => {
  return uuidv4().replace(/-/g, '');
};

export const generateCspHeader = (nonce: string): string => {
  return [
    `default-src 'self'`,
    `base-uri 'self'`,
    `form-action 'self'`,
    `img-src 'self' data: https:`,
    `font-src 'self' data:`,
    `style-src 'self' 'unsafe-inline'`,
    `script-src 'self' 'nonce-${nonce}' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://mc.yandex.ru`,
    `connect-src 'self' https://www.google-analytics.com https://mc.yandex.ru https://*.sentry.io`,
    `frame-src 'self' https://www.youtube.com https://www.googletagmanager.com`,
    `object-src 'none'`,
    `frame-ancestors 'none'`
  ].join('; ');
};

export const securityHeaders = [
  ['X-Content-Type-Options', 'nosniff'],
  ['X-Frame-Options', 'DENY'],
  ['X-XSS-Protection', '1; mode=block'],
  ['Referrer-Policy', 'strict-origin-when-cross-origin'],
  ['Permissions-Policy', 'geolocation=(), microphone=(), camera=()'],
] as const;
