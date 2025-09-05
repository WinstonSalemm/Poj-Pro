import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withApiCache } from '@/lib/cacheMiddleware';
import { cacheKeys } from '@/lib/redis';

export const runtime = 'nodejs';
export const dynamic = 'force-static';
export const revalidate = 60;


// Normalize supported locales
function normalize(raw: string | null): 'ru'|'en'|'uz' {
  const v = (raw ?? 'ru').toLowerCase();
  if (v === 'ru' || v === 'en' || v === 'uz') return v;
  if (v.startsWith('en')) return 'en';
  if (v.startsWith('uz')) return 'uz';
  return 'ru';
}

export const GET = withApiCache({
  keyGenerator: (req) => {
    const { searchParams } = new URL(req.url);
    const locale = normalize(searchParams.get('locale'));
    return cacheKeys.category(locale);
  },
})(async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const locale = normalize(searchParams.get('locale'));
  const t0 = Date.now();

  try {
    const categories = await prisma.category.findMany({
      where: {
        products: {
          some: {
            isActive: true,
            i18n: { some: { locale } }, // <-- фильтруем категории по наличию товара с локалью
          },
        },
      },
      orderBy: { name: 'asc' },
      take: 200,
      select: {
        id: true,
        slug: true,
        name: true, // у Category нет i18n — используем name как есть
        products: {
          where: { isActive: true, i18n: { some: { locale } } },
          select: { id: true }, // не тащим весь продукт, только проверка наличия
          take: 1,
        },
      },
    });

    // можно отдать как есть; products здесь — просто индикатор наличия
    return NextResponse.json({ categories });
  } catch (e: unknown) {
    const took_ms = Date.now() - t0;
    if (e instanceof Error) {
      const maybeCode = (e as { code?: unknown }).code;
      console.error('[api/categories] FAIL', {
        name: e.name,
        code: typeof maybeCode === 'string' ? maybeCode : undefined,
        message: e.message,
        took_ms,
      });
    } else {
      console.error('[api/categories] FAIL', {
        name: undefined, code: undefined, message: String(e), took_ms,
      });
    }
    return NextResponse.json({ categories: [], error: 'db_or_query_error' });
  }
});
