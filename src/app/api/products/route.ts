// src/app/api/products/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withApiCache } from '@/lib/cacheMiddleware';
import { cacheKeys } from '@/lib/redis';

export const runtime = 'nodejs';
// API дергается из клиента — пусть будет всегда динамическим,
// а кеш контролируем сами через withApiCache.
export const dynamic = 'force-dynamic';

function normalize(raw: string | null): 'ru' | 'en' | 'uz' {
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
    return cacheKeys.products(locale);
  },
})(async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const locale = normalize(searchParams.get('locale'));
  // Нормализуем локаль для БД (в БД: 'ru', 'eng', 'uzb')
  const dbLocale = locale === 'en' ? 'eng' : locale === 'uz' ? 'uzb' : 'ru';
  const t0 = Date.now();

  try {
    const products = await prisma.product.findMany({
      where: {
        isActive: true,
        i18n: { some: { locale: dbLocale } }, // фильтр по локали у связанной таблицы в формате БД
      },
      orderBy: { id: 'asc' },
      take: 500,
      include: {
        i18n: {
          where: { locale: dbLocale }, // получаем переводы для текущей локали в формате БД
          select: { locale: true, title: true, summary: true, description: true },
        },
        category: { select: { id: true, slug: true, name: true } },
        certificates: {
          include: {
            certificate: { select: { id: true, title: true, href: true } },
          },
        },
        images: {
          orderBy: { order: 'asc' },
        },
      },
    });

    // Расплющим локализованные поля
    const hydrated = products.map((p) => {
      const t = p.i18n[0] ?? null;
      return {
        id: p.id,
        slug: p.slug,
        brand: p.brand,
        price: p.price,
        stock: p.stock,
        currency: p.currency,
        images: p.images.map((img) => img.url),
        specs: p.specs,
        isActive: p.isActive,
        category: p.category,
        certificates: p.certificates.map((pc) => pc.certificate),
        title: t?.title ?? null,
        summary: t?.summary ?? null,
        description: t?.description ?? null,
        createdAt: p.createdAt,
        updatedAt: p.updatedAt,
      };
    });

    return NextResponse.json(
      { success: true, data: { products: hydrated } },
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
          'Cache-Control': 'no-store',
        },
      }
    );
  } catch (e) {
    // без any — чуть аккуратнее вытащим детали
    let name: string | undefined;
    let code: string | number | undefined;
    let message: string | undefined;
    if (e instanceof Error) {
      name = e.name;
      message = e.message;
    }
    if (typeof e === 'object' && e !== null && 'code' in e) {
      const maybe = (e as { code?: unknown }).code;
      if (typeof maybe === 'string' || typeof maybe === 'number') code = maybe;
    }
    console.error('[/api/products] FAIL', { name, code, message, took_ms: Date.now() - t0 }, e);

    // fail-open: отдаём 200, чтобы клиент не падал
    return NextResponse.json(
      { success: false, data: { products: [] }, error: 'db_or_query_error' },
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
          'Cache-Control': 'no-store',
        },
      }
    );
  }
});
