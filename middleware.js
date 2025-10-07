import { NextResponse } from 'next/server';

export function middleware(req) {
  const host = req.headers.get('host');
  const proto = req.headers.get('x-forwarded-proto');

  // 1. Enforce HTTPS
  if (proto !== 'https') {
    return NextResponse.redirect(`https://${host}${req.nextUrl.pathname}${req.nextUrl.search}`, 301);
  }

  // 2. Redirect apex to www
  if (host === 'poj-pro.uz') {
    return NextResponse.redirect(`https://www.poj-pro.uz${req.nextUrl.pathname}${req.nextUrl.search}`, 301);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)'],
};
