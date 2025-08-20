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
    // If a locale column exists, this filters; if not, Prisma may throw P2021/2 which we handle
    const products = await prisma.product.findMany({
      // @ts-expect-error Optional filter in case 'locale' column exists in schema
      where: { locale },
      orderBy: { id: 'asc' },
      take: 500,
    });

    return NextResponse.json({ products }, { headers: cache });
  } catch (e: unknown) {
    const err = e as { name?: string; code?: string; message?: string };
    console.error('[api/products] FAIL', {
      name: err?.name, code: err?.code, message: err?.message, took_ms: Date.now() - t0,
    });

    // Fallback if locale column missing
    if (err?.code === 'P2021' || err?.code === 'P2022') {
      try {
        const products = await prisma.product.findMany({
          orderBy: { id: 'asc' },
          take: 500,
        });
        console.warn('[api/products] Fallback: locale column missing, returned unfiltered list');
        return NextResponse.json({ products, warn: 'no_locale_column' }, { headers: cache });
      } catch (e2: unknown) {
        const err2 = e2 as { name?: string; code?: string; message?: string };
        console.error('[api/products] Fallback FAIL', { name: err2?.name, code: err2?.code, message: err2?.message });
      }
    }

    // Final fail-open
    return NextResponse.json({ products: [], error: 'db_unavailable' }, { headers: cache });
  }
}