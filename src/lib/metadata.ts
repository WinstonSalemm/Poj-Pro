import type { Metadata } from 'next';
import { headers } from 'next/headers';
import { SITE_URL, SITE_NAME } from '@/lib/site';

// Translation resources (server-usable JSON)
import ru from '@/locales/ru/translation.json';
import eng from '@/locales/eng/translation.json';
import uzb from '@/locales/uzb/translation.json';

type Lang = 'ru' | 'eng' | 'uzb';

const RESOURCES: Record<Lang, any> = { ru, eng, uzb };

// Parse cookie header string and resolve our language
function parseLangFromCookie(cookieHeader: string | null | undefined): Lang | null {
  if (!cookieHeader) return null;
  const pairs = cookieHeader.split(';');
  let raw = '';
  for (const p of pairs) {
    const [k, v] = p.split('=');
    const key = (k || '').trim().toLowerCase();
    const val = (v || '').trim();
    if (key === 'i18next') { raw = val; break; }
    if (key === 'lang') { raw = val; }
  }
  raw = (raw || '').toLowerCase();
  if (!raw) return null;
  if (raw.startsWith('en') || raw === 'eng') return 'eng';
  if (raw.startsWith('uz') || raw === 'uzb') return 'uzb';
  if (raw.startsWith('ru')) return 'ru';
  return null;
}

export function langFromCookieHeader(cookieHeader: string | null | undefined): Lang {
  return parseLangFromCookie(cookieHeader) || 'ru';
}

// Note: do not read headers() here to avoid type issues; resolve language at call sites.

// Safe getter by dot path
function getPath(obj: any, path: string): string | undefined {
  return path.split('.').reduce<any>((acc, key) => (acc && typeof acc === 'object' ? acc[key] : undefined), obj) as string | undefined;
}

export function getLocalized(key: string, lang: Lang, fallback = ''): string {
  const val = getPath(RESOURCES[lang], key);
  if (typeof val === 'string' && val.trim()) return val;
  // try RU fallback, then ENG
  const ruVal = getPath(RESOURCES.ru, key);
  if (typeof ruVal === 'string' && ruVal.trim()) return ruVal as string;
  const enVal = getPath(RESOURCES.eng, key);
  if (typeof enVal === 'string' && enVal.trim()) return enVal as string;
  return fallback;
}

export function buildPageMetadata(opts: { titleKey?: string; descriptionKey?: string; defaultTitle?: string; defaultDescription?: string; path: string; lang?: Lang; titleSuffix?: string; }): Metadata {
  const lang = opts.lang ?? 'ru';
  const titleRaw = (opts.titleKey ? getLocalized(opts.titleKey, lang) : undefined) || opts.defaultTitle || 'POJ PRO';
  const title = `${titleRaw}${opts.titleSuffix ?? ` — ${SITE_NAME}`}`;
  const description = (opts.descriptionKey ? (getLocalized(opts.descriptionKey, lang) || undefined) : undefined) || opts.defaultDescription;
  const canonical = `${SITE_URL}${opts.path.startsWith('/') ? opts.path : `/${opts.path}`}`;

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      url: canonical,
      siteName: SITE_NAME,
      title,
      description,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  } satisfies Metadata;
}

export async function buildPageMetadataFromHeaders(opts: { titleKey?: string; descriptionKey?: string; defaultTitle?: string; defaultDescription?: string; path: string; titleSuffix?: string; }): Promise<Metadata> {
  try {
    const h = await headers();
    const cookie = h?.get('cookie');
    const lang = langFromCookieHeader(cookie);
    return buildPageMetadata({ ...opts, lang });
  } catch {
    return buildPageMetadata({ ...opts, lang: 'ru' });
  }
}
