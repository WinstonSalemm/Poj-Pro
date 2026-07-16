import { NextResponse } from 'next/server';

export function middleware(req) {
  const host = req.headers.get('host');
  const proto = req.headers.get('x-forwarded-proto');
  const { pathname } = req.nextUrl;

  // 1. Enforce HTTPS
  if (proto !== 'https') {
    return NextResponse.redirect(`https://${host}${req.nextUrl.pathname}${req.nextUrl.search}`, 301);
  }

  // 2. Redirect apex to www
  if (host === 'poj-pro.uz') {
    return NextResponse.redirect(`https://www.poj-pro.uz${req.nextUrl.pathname}${req.nextUrl.search}`, 301);
  }

  // Cookie-authenticated API mutations must originate from this site. NextAuth
  // and webhook routes own their validation and are explicitly excluded.
  const unsafeMethod = ['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method);
  const csrfExempt = pathname.startsWith('/api/auth') || pathname.startsWith('/api/webhook');
  if (unsafeMethod && pathname.startsWith('/api/') && !csrfExempt) {
    const origin = req.headers.get('origin');
    const expectedOrigin = `https://${host}`;
    if (!origin || origin !== expectedOrigin) {
      return NextResponse.json({ error: 'Invalid request origin' }, { status: 403 });
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)'],
};
