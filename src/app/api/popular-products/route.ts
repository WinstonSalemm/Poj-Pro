import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { serializeJSON } from '@/lib/json';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 60; // Кэшируем на 60 секунд

// GET /api/popular-products - публичный API для получения популярных товаров
export async function GET() {
  try {
    const popularProducts = await prisma.popularProduct.findMany({
      where: {
        product: {
          isActive: true,
        },
      },
      include: {
        product: {
          include: {
            i18n: true,
            category: true,
            images: {
              orderBy: { order: 'asc' },
              take: 1,
            },
          },
        },
      },
      orderBy: { order: 'asc' },
      take: 6, // Максимум 6 популярных товаров
    });

    const data = popularProducts.map((pp) => ({
      id: pp.product.id,
      slug: pp.product.slug,
      title: pp.product.i18n.find((t) => t.locale === 'ru')?.title || pp.product.slug,
      price: pp.product.price ?? 0,
      image: pp.product.images[0]?.url || null,
      category: pp.product.category?.slug || null,
    }));

    return NextResponse.json(serializeJSON({ success: true, data }), { status: 200 });
  } catch (error) {
    console.error('[popular-products][GET] error', error);
    return NextResponse.json({ success: false, message: 'Failed to fetch popular products' }, { status: 500 });
  }
}
