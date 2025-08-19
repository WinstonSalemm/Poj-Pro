import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { setCsrfCookie } from '@/middleware/csrf';

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // исключаем статику и NextAuth (у него свой CSRF)
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/static') ||
    pathname.startsWith('/images') ||
    pathname === '/favicon.ico' ||
    pathname.startsWith('/icon') ||
    pathname.startsWith('/apple-touch-icon') ||
    pathname.startsWith('/api/auth') ||    // NextAuth
    pathname.startsWith('/api/webhook')    // твои вебхуки, при необходимости
  ) {
    return NextResponse.next();
  }

  const res = NextResponse.next();
  return setCsrfCookie(req, res);
}

// матчим всё, кроме файлов со своим расширением и стандартной статики
export const config = {
  matcher: ['/((?!_next|static|.*\\..*).*)'],
};
