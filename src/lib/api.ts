import { cookies } from 'next/headers';

export type Locale = 'ru' | 'en' | 'uz';

export async function getLocale(): Promise<Locale> {
  const cookieStore = await cookies();
  // i18next-browser-languagedetector typically uses 'i18next' cookie name
  const raw = (cookieStore.get('i18next')?.value || cookieStore.get('i18n')?.value || 'ru').toLowerCase();

  // Normalize common variants
  const lang = raw === 'eng' ? 'en' : raw === 'uzb' ? 'uz' : raw;

  if (lang.startsWith('en')) return 'en';
  if (lang.startsWith('uz')) return 'uz';
  return 'ru';
}

// Simple helper to guarantee single JSON read and consistent errors
export async function safeJson<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, init);
  if (!res.ok) {
    throw new Error(`Fetch failed ${res.status} ${res.statusText} ${url}`);
  }
  return res.json() as Promise<T>;
}

export async function fetchAPI<T>(url: string, options?: RequestInit): Promise<{ data?: T; error?: string }> {
  // Prevent indefinite hangs by timing out the request
  const timeoutMs = typeof (process.env.NEXT_PUBLIC_API_TIMEOUT_MS || process.env.API_TIMEOUT_MS) === 'string'
    ? Number(process.env.NEXT_PUBLIC_API_TIMEOUT_MS || process.env.API_TIMEOUT_MS)
    : 10000; // default 10s

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(new Error('Request timeout')), isFinite(timeoutMs) && timeoutMs > 0 ? timeoutMs : 10000);

  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    const fullUrl = url.startsWith('http') ? url : `${baseUrl}${url.startsWith('/') ? '' : '/'}${url}`;

    const res = await fetch(fullUrl, {
      ...options,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      cache: 'no-store',
      signal: controller.signal,
    });

    if (!res.ok) {
      const error = await res.text().catch(() => 'Unknown error');
      console.error(`API Error (${res.status}):`, error);
      return { error: `Error ${res.status}: ${error}` };
    }

    const data = await res.json();
    if (!data?.success) {
      return { error: data?.message || 'Unknown error' };
    }

    return { data: data.data };
  } catch (error) {
    console.error('Fetch error:', error);
    return { error: error instanceof Error ? error.message : 'Unknown error' };
  } finally {
    clearTimeout(timer);
  }
}
