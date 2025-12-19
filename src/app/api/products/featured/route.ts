// src/app/api/products/featured/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withApiCache } from '@/lib/cacheMiddleware';
import { cacheKeys } from '@/lib/redis';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type FeaturedType = 'new' | 'hits' | 'discounts';

function normalizeLocale(raw: string | null): 'ru' | 'eng' | 'uzb' {
  const v = (raw ?? 'ru').toLowerCase();
  // Поддержка алиасов: en -> eng, uz -> uzb
  if (v === 'en' || v.startsWith('en')) return 'eng';
  if (v === 'uz' || v.startsWith('uz')) return 'uzb';
  return 'ru';
}

function parseImages(images: string | null): string[] {
  if (!images) return [];
  try {
    const parsed = JSON.parse(images);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export const GET = withApiCache({
  keyGenerator: (req) => {
    const { searchParams } = new URL(req.url);
    const locale = normalizeLocale(searchParams.get('locale'));
    const type = (searchParams.get('type') || 'new') as FeaturedType;
    const limit = parseInt(searchParams.get('limit') || '6', 10);
    return `featured:${type}:${locale}:${limit}`;
  },
})(async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const locale = normalizeLocale(searchParams.get('locale'));
  const type = (searchParams.get('type') || 'new') as FeaturedType;
  const limit = Math.min(parseInt(searchParams.get('limit') || '6', 10), 20); // Максимум 20

  try {
    // Базовые условия для всех типов
    const baseWhere: any = {
      isActive: true,
      i18n: { some: { locale } },
    };

    // Добавляем условия в зависимости от типа
    let whereClause = baseWhere;
    let orderBy: any = { createdAt: 'desc' };

    switch (type) {
      case 'new':
        // Новые товары: созданы за последние 14 дней
        // Если нет товаров за 14 дней - не показываем ничего
        const fourteenDaysAgo = new Date();
        fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);
        
        whereClause = {
          ...baseWhere,
          createdAt: { gte: fourteenDaysAgo },
        };
        orderBy = { createdAt: 'desc' };
        break;

      case 'hits':
        // Хиты: можно добавить поле isPopular или использовать другой критерий
        // Пока используем товары с наибольшим stock или последние обновленные
        whereClause = baseWhere;
        orderBy = { updatedAt: 'desc' };
        break;

      case 'discounts':
        // Скидки: можно добавить поле discountPrice или использовать другой критерий
        // Пока возвращаем пустой массив, можно расширить позже
        whereClause = {
          ...baseWhere,
          // Можно добавить условие для товаров со скидкой
        };
        orderBy = { createdAt: 'desc' };
        break;

      default:
        whereClause = baseWhere;
    }

    const products = await prisma.product.findMany({
      where: whereClause,
      orderBy,
      take: limit,
      include: {
        i18n: {
          where: { locale },
          select: { title: true, summary: true, description: true },
        },
        category: { select: { id: true, slug: true, name: true } },
      },
    });

    // Отладка
    console.log(`[/api/products/featured] Found ${products.length} products for type=${type}, locale=${locale}, limit=${limit}`);

    // Преобразуем в нужный формат
    const hydrated = products.map((p) => {
      const translation = p.i18n[0] ?? null;
      const images = parseImages(p.images);
      
      return {
        id: p.id,
        slug: p.slug,
        brand: p.brand,
        price: p.price ? Number(p.price) : null,
        stock: p.stock,
        currency: p.currency,
        images,
        image: images[0] || null,
        category: p.category,
        title: translation?.title ?? null,
        summary: translation?.summary ?? null,
        description: translation?.description ?? null,
        createdAt: p.createdAt.toISOString(),
        updatedAt: p.updatedAt.toISOString(),
      };
    });

    return NextResponse.json(
      { success: true, data: { products: hydrated, type, locale } },
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
          'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120',
        },
      }
    );
  } catch (e) {
    console.error('[/api/products/featured] FAIL', e);
    return NextResponse.json(
      { success: false, data: { products: [], type, locale }, error: 'db_or_query_error' },
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
