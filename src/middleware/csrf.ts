import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Helper function for timing-safe comparison
const safeCompare = (a: string, b: string): boolean => {
  // Convert strings to buffers
  const aBuf = new TextEncoder().encode(a);
  const bBuf = new TextEncoder().encode(b);
  
  // If lengths are different, they're not equal
  if (aBuf.length !== bBuf.length) return false;
  
  // Compare each byte
  let result = 0;
  for (let i = 0; i < aBuf.length; i++) {
    result |= aBuf[i] ^ bBuf[i];
  }
  
  return result === 0;
};
export const config = {
  matcher: ['/((?!_next|static|.*\\..*).*)'],
};
// List of safe HTTP methods that don't require CSRF protection
const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);

// List of paths that don't require CSRF protection (e.g., webhooks, public APIs)
const CSRF_EXEMPT_PATHS = ['/api/webhook'];

// Generate a CSRF token
const generateCsrfToken = (): string => {
  return Array.from(crypto.getRandomValues(new Uint8Array(32)))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
};



export async function csrfProtection(request: NextRequest) {
  // Skip CSRF check for safe methods and exempt paths
  if (SAFE_METHODS.has(request.method) || 
      CSRF_EXEMPT_PATHS.some(path => request.nextUrl.pathname.startsWith(path))) {
    return null;
  }

  // Get the CSRF token from the request
  let csrfToken = request.headers.get('x-csrf-token') || 
                 request.nextUrl.searchParams.get('_csrf');

  // For POST requests, try to get from form data
  if (request.method === 'POST' && !csrfToken) {
    try {
      const formData = await request.formData();
      const formToken = formData.get('_csrf');
      if (typeof formToken === 'string') {
        csrfToken = formToken;
      }
    } catch (e) {
      // Ignore form data parsing errors
    }
  }

  // Get the CSRF token from the cookie
  const csrfCookie = request.cookies.get('csrf-token')?.value;

  // Verify the CSRF token
  if (!csrfToken || !csrfCookie || !safeCompare(csrfToken, csrfCookie)) {
    return new NextResponse(
      JSON.stringify({ error: 'Invalid CSRF token' }),
      { status: 403, headers: { 'Content-Type': 'application/json' } }
    );
  }

  return null;
}

// Middleware to set CSRF token cookie
// This should be used in your middleware.ts
// Example: await setCsrfCookie(request, response);
export async function setCsrfCookie(request: NextRequest, response: NextResponse) {
  // Only set the CSRF token if it doesn't exist
  if (!request.cookies.has('csrf-token')) {
    const csrfToken = generateCsrfToken();
    response.cookies.set({
      name: 'csrf-token',
      value: csrfToken,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 1 week
    });
  }
  return response;
}

// Helper to get CSRF token for forms
export function getCsrfToken() {
  if (typeof window === 'undefined') {
    return '';
  }
  
  // This would be set by your server-side rendering
  return document.cookie
    .split('; ')
    .find(row => row.startsWith('csrf-token='))
    ?.split('=')[1] || '';
}
