import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { setCsrfCookie } from '@/middleware/csrf';

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // 1) Никогда не трогаем API/Next/статику/иконки/NextAuth/webhooks
  if (
    pathname.startsWith('/api') ||          // ВАЖНО: исключаем весь /api
    pathname.startsWith('/_next') ||
    pathname.startsWith('/static') ||
    pathname.startsWith('/images') ||
    pathname === '/favicon.ico' ||
    pathname.startsWith('/icon') ||
    pathname.startsWith('/apple-touch-icon') ||
    pathname.startsWith('/api/auth') ||     // NextAuth
    pathname.startsWith('/api/webhook')     // вебхуки (если есть)
  ) {
    return NextResponse.next();
  }

  // 2) Для остальных (страницы) — ставим CSRF cookie
  const res = NextResponse.next();
  return setCsrfCookie(req, res);
}

// Запускаем middleware для всего, КРОМЕ api/_next/статических файлов
export const config = {
  matcher: [
    '/((?!api|_next|static|images|favicon.ico|icon|apple-touch-icon|.*\\..*).*)',
  ],
};
