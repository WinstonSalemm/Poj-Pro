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
  const { pathname } = req.nextUrl;
  const isProd = process.env.NODE_ENV === 'production';

  // Canonicalize bare domain to www
  const hostname = req.nextUrl.hostname;
  if (hostname === 'poj-pro.uz') {
    const redirectUrl = new URL(req.nextUrl.href);
    redirectUrl.protocol = 'https:';
    redirectUrl.hostname = 'www.poj-pro.uz';
    return NextResponse.redirect(redirectUrl, 301);
  }

  // 1) Обработка статических ассетов с кешированием (только в ПРОДАКШЕНЕ)
  if (
    isProd && (
      pathname.startsWith('/_next/static') ||
      pathname.startsWith('/static') ||
      pathname.match(/\.(js|css|woff2?|eot|ttf|otf|svg|png|jpg|jpeg|gif|ico|webp|avif)$/i)
    )
  ) {
    const response = NextResponse.next();
    // Кешируем статические ассеты на 1 год с immutable (только прод)
    response.headers.set('Cache-Control', 'public, max-age=31536000, immutable');
    return response;
  }

  // 2) Пропускаем API и другие системные пути
  if (
    pathname.startsWith('/api') ||
    pathname.startsWith('/_next') ||
    pathname === '/favicon.ico' ||
    pathname.startsWith('/icon') ||
    pathname.startsWith('/apple-touch-icon') ||
    pathname.startsWith('/api/auth') ||
    pathname.startsWith('/api/webhook')
  ) {
    return NextResponse.next();
  }

  // 2) Для остальных (страницы) — генерируем nonce и (в DEV) CSP, и ставим CSRF cookie
  const nonce = generateNonce();

  // Источники согласно требованиям: добавляем WSS для Я.Метрики
  const scriptSrc = [
    "'self'",
    `'nonce-${nonce}'`,
    // Разрешаем inline для аналитики (можно убрать позже при полном переходе на nonce/hash)
    "'unsafe-inline'",
    // Разрешаем eval ТОЛЬКО в деве (Webpack devtool и др.)
    !isProd ? "'unsafe-eval'" : null,
    'https://www.googletagmanager.com',
    'https://www.google-analytics.com',
    'https://region1.google-analytics.com',
    'https://mc.yandex.ru',
    'https://yastatic.net',
  ].filter(Boolean).join(' ');

  const styleSrc = [
    "'self'",
    "'unsafe-inline'",
    'https://fonts.googleapis.com',
  ].join(' ');

  const imgSrc = [
    "'self'",
    'data:',
    'blob:',
    'https:',
    'https://www.google-analytics.com',
    'https://mc.yandex.ru',
  ].join(' ');

  const fontSrc = [
    "'self'",
    'data:',
    'https://fonts.gstatic.com',
  ].join(' ');

  const connectSrc = [
    "'self'",
    'https://www.google-analytics.com',
    'https://region1.google-analytics.com',
    'https://www.googletagmanager.com',
    'https://mc.yandex.ru',
    'wss://mc.yandex.ru',
  ].join(' ');

  const frameSrc = [
    "'self'",
    'https://mc.yandex.ru',
    'https://www.googletagmanager.com',
  ].join(' ');

  const csp = [
    "default-src 'self';",
    `script-src ${scriptSrc};`,
    `style-src ${styleSrc};`,
    `img-src ${imgSrc};`,
    `font-src ${fontSrc};`,
    `connect-src ${connectSrc};`,
    `frame-src ${frameSrc};`,
    // На случай веб-воркеров
    "worker-src 'self' blob:;",
  ].join(' ');

  // Прокидываем nonce дальше через request headers, чтобы прочитать в RSC
  const requestHeaders = new Headers(req.headers);
  requestHeaders.set('x-nonce', nonce);

  const res = NextResponse.next({ request: { headers: requestHeaders } });
  res.headers.set('Content-Security-Policy', csp);

  return setCsrfCookie(req, res);
}

// Отключаем src middleware: корневой middleware.js является единственным активным
export const config = {
  matcher: [],
};