import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { setCsrfCookie } from '@/middleware/csrf';

function generateNonce() {
  // 16 bytes random base64 nonce
  if (typeof crypto !== 'undefined' && 'getRandomValues' in crypto) {
    const arr = new Uint8Array(16);
    crypto.getRandomValues(arr);
    return Buffer.from(arr).toString('base64');
  }
  // Fallback
  return Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2);
}

export function middleware(req: NextRequest) {
  // In development, do not set CSP at all to keep HMR/React Refresh working
  if (process.env.NODE_ENV !== 'production') {
    const res = NextResponse.next();
    return setCsrfCookie(req, res);
  }
  const { pathname } = req.nextUrl;

  // 1) Никогда не трогаем API/Next/статику/иконки/NextAuth/webhooks
  if (
    pathname.startsWith('/api') ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/static') ||
    pathname.startsWith('/images') ||
    pathname === '/favicon.ico' ||
    pathname.startsWith('/icon') ||
    pathname.startsWith('/apple-touch-icon') ||
    pathname.startsWith('/api/auth') ||
    pathname.startsWith('/api/webhook')
  ) {
    return NextResponse.next();
  }

  // 2) Для остальных (страницы) — генерируем nonce и CSP, и ставим CSRF cookie
  const nonce = generateNonce();

  // Источники согласно требованиям: добавляем WSS для Я.Метрики
  const csp = [
    "default-src 'self';",
    // Разрешаем inline-скрипты только с корректным nonce
    `script-src 'self' 'nonce-${nonce}' https://www.googletagmanager.com https://www.google-analytics.com https://mc.yandex.ru https://yastatic.net;`,
    "style-src 'self' 'unsafe-inline';",
    "img-src 'self' data: blob: https: https://www.google-analytics.com https://mc.yandex.ru;",
    "font-src 'self' data:;",
    // Подключаем WSS к mc.yandex.ru и оставляем существующие
    "connect-src 'self' https://www.google-analytics.com https://region1.google-analytics.com https://www.googletagmanager.com https://mc.yandex.ru wss://mc.yandex.ru;",
    // GTM/Метрика во фреймах
    "frame-src 'self' https://www.googletagmanager.com https://mc.yandex.ru;",
    // На случай веб-воркеров от GTM
    "worker-src 'self' blob: https://www.googletagmanager.com;",
  ].join(' ');

  // Прокидываем nonce дальше через request headers, чтобы прочитать в RSC
  const requestHeaders = new Headers(req.headers);
  requestHeaders.set('x-nonce', nonce);

  const res = NextResponse.next({ request: { headers: requestHeaders } });
  res.headers.set('Content-Security-Policy', csp);

  return setCsrfCookie(req, res);
}

// Запускаем middleware для всего, КРОМЕ api/_next/статических файлов
export const config = {
  matcher: [
    '/((?!api|_next|static|images|favicon.ico|icon|apple-touch-icon|.*\\..*).*)',
  ],
};
