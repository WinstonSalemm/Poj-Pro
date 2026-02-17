import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withApiCache } from '@/lib/cacheMiddleware';
import { cacheKeys } from '@/lib/redis';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 60;

function normalize(raw: string | null): 'ru' | 'en' | 'uz' {
  const v = (raw ?? 'ru').toLowerCase();
  if (v === 'ru' || v === 'en' || v === 'uz') return v;
  if (v.startsWith('en')) return 'en';
  if (v.startsWith('uz')) return 'uz';
  return 'ru';
}

function toDbLocale(locale: 'ru' | 'en' | 'uz'): 'ru' | 'eng' | 'uzb' {
  if (locale === 'en') return 'eng';
  if (locale === 'uz') return 'uzb';
  return 'ru';
}

function pickCategoryName(input: {
  locale: 'ru' | 'en' | 'uz';
  fallback: string;
  i18n: Array<{ locale: string; name: string }>;
}): string {
  const dbLocale = toDbLocale(input.locale);
  return (
    input.i18n.find((x) => x.locale === dbLocale)?.name ||
    input.i18n.find((x) => x.locale === 'ru')?.name ||
    input.fallback
  );
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
  const dbLocale = toDbLocale(locale);
  const t0 = Date.now();

  try {
    const categories = await prisma.category.findMany({
      where: {
        products: {
          some: {
            isActive: true,
            i18n: { some: { locale: dbLocale } },
          },
        },
      },
      orderBy: { name: 'asc' },
      take: 200,
      select: {
        id: true,
        slug: true,
        name: true,
        image: true,
        i18n: {
          where: { locale: { in: ['ru', 'eng', 'uzb'] } },
          select: { locale: true, name: true },
        },
        products: {
          where: { isActive: true, i18n: { some: { locale: dbLocale } } },
          select: { id: true },
          take: 1,
        },
      },
    });

    const localizedCategories = categories.map((category) => ({
      id: category.id,
      slug: category.slug,
      image: category.image,
      name: pickCategoryName({
        locale,
        fallback: category.name || category.slug,
        i18n: category.i18n,
      }),
      products: category.products,
    }));

    return NextResponse.json({ categories: localizedCategories });
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
