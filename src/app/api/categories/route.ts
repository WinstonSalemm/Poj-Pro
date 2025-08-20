import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';
export const dynamic = 'force-static';
export const revalidate = 60;

const ALLOWED = new Set(['ru','en','uz']);
const normalize = (raw: string | null) => {
  const s = (raw ?? 'ru').toLowerCase();
  if (ALLOWED.has(s)) return s as 'ru'|'en'|'uz';
  if (s.startsWith('en')) return 'en';
  if (s.startsWith('uz')) return 'uz';
  return 'ru';
};
const cache = { 'Cache-Control': 's-maxage=60, stale-while-revalidate=600' };

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const locale = normalize(searchParams.get('locale'));
  const t0 = Date.now();
  try {
    const categories = await prisma.category.findMany({
      // @ts-expect-error Optional filter if 'locale' column exists
      where: { locale },
      orderBy: { name: 'asc' },
      take: 200,
    });
    return NextResponse.json({ categories }, { headers: cache });
  } catch (e: unknown) {
    const err = e as { code?: string; name?: string; message?: string };
    console.error('[api/categories] FAIL', {
      name: err?.name, code: err?.code, message: err?.message, took_ms: Date.now() - t0,
    });

    if (err?.code === 'P2021' || err?.code === 'P2022') {
      try {
        const categories = await prisma.category.findMany({
          orderBy: { name: 'asc' },
          take: 200,
        });
        console.warn('[api/categories] Fallback: locale column missing, returned unfiltered list');
        return NextResponse.json({ categories, warn: 'no_locale_column' }, { headers: cache });
      } catch (e2: unknown) {
        const err2 = e2 as { code?: string; name?: string; message?: string };
        console.error('[api/categories] Fallback FAIL', { name: err2?.name, code: err2?.code, message: err2?.message });
      }
    }

    return NextResponse.json({ categories: [], error: 'db_unavailable' }, { headers: cache });
  }
}
