import { cookies } from 'next/headers';
import { headers } from 'next/headers';
import { SITE_URL } from '@/lib/site';

export type Locale = 'ru' | 'en' | 'uz';

export async function getLocale(): Promise<Locale> {
  const cookieStore = await cookies();
  const raw = (cookieStore.get('i18next')?.value || cookieStore.get('i18n')?.value || 'ru').toLowerCase();
  const lang = raw === 'eng' ? 'en' : raw === 'uzb' ? 'uz' : raw;
  if (lang.startsWith('en')) return 'en';
  if (lang.startsWith('uz')) return 'uz';
  return 'ru';
}

// Determine absolute base URL for server-side fetches
export async function getBaseUrl(): Promise<string> {
  try {
    const h = await headers();
    const proto = h.get('x-forwarded-proto') ?? 'http';
    const host = h.get('x-forwarded-host') ?? h.get('host');
    if (host) return `${proto}://${host}`;
  } catch {
    // headers() may be unavailable during certain build/ISR phases
  }

  // Prefer configured site URL to avoid localhost during build
  if (process.env.NEXT_PUBLIC_SITE_URL) return process.env.NEXT_PUBLIC_SITE_URL;
  if (SITE_URL) return SITE_URL;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  if (process.env.RAILWAY_PUBLIC_DOMAIN) return `https://${process.env.RAILWAY_PUBLIC_DOMAIN}`;
  return 'http://localhost:3000';
}

// Ensure single read and JSON-only parsing
export async function safeJson<T = unknown>(res: Response): Promise<T> {
  const ct = res.headers.get('content-type') || '';
  if (!ct.includes('application/json')) {
    const text = await res.text().catch(() => '');
    console.error('[safeJson] Invalid content-type:', ct, 'first bytes:', text.slice(0, 200));
    throw new Error(`Invalid response format: expected JSON, got "${ct}". First bytes: ${text.slice(0, 120)}`);
  }
  try {
    const json = (await res.json()) as T;
    const brief = Array.isArray(json)
      ? `array(length=${(json as any[]).length})`
      : json && typeof json === 'object'
        ? `object(keys=${Object.keys(json as any).slice(0, 8).join(',')})`
        : typeof json;
    console.log('[safeJson] Parsed payload:', brief);
    return json;
  } catch (e) {
    console.error('[safeJson] JSON parse error:', e);
    throw e;
  }
}

export async function fetchAPI<T = unknown>(path: string, init?: RequestInit): Promise<T> {
  const url = /^https?:\/\//i.test(path) ? path : `${await getBaseUrl()}${path}`;
  const method = (init?.method || 'GET').toUpperCase();
  console.log('[fetchAPI]', method, url);
  const res = await fetch(url, {
    cache: 'force-cache',
    next: { revalidate: 60 },
    ...init,
  });
  const ct = res.headers.get('content-type') || '';
  console.log('[fetchAPI] status', res.status, res.statusText, 'content-type', ct);
  if (!res.ok) {
    const body = await res.text().catch(() => '');
    console.error('[fetchAPI] non-OK first bytes:', body.slice(0, 200));
    throw new Error(`API ${url} failed: ${res.status} ${res.statusText}`);
  }
  return safeJson<T>(res);
}
