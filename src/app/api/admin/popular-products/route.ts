import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { serializeJSON } from '@/lib/json';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

function isAuthed(request: Request): boolean {
  const token = request.headers.get('x-admin-token');
  const adminPassword = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || 'admin-ship-2025';
  return token === adminPassword;
}

// GET /api/admin/popular-products - получить список популярных товаров
export async function GET() {
  try {
    const popularProducts = await prisma.popularProduct.findMany({
      include: {
        product: {
          include: {
            i18n: {
              where: { locale: { in: ['ru', 'eng', 'en', 'uz', 'uzb'] } },
              select: { title: true, locale: true },
            },
            category: true,
            images: {
              orderBy: { order: 'asc' },
              take: 1,
            },
          },
        },
      },
      orderBy: { order: 'asc' },
    });

    const data = popularProducts.map((pp) => ({
      id: pp.id,
      productId: pp.productId,
      order: pp.order,
      product: {
        id: pp.product.id,
        slug: pp.product.slug,
        title: (pp.product.i18n.find((t) => t.locale === 'ru') || pp.product.i18n[0])?.title || pp.product.slug,
        price: pp.product.price ?? 0,
        image: pp.product.images[0]?.url || null,
        category: pp.product.category ? { slug: pp.product.category.slug, name: pp.product.category.name } : null,
      },
    }));

    return NextResponse.json(serializeJSON({ success: true, data }), { status: 200 });
  } catch (error) {
    console.error('[admin/popular-products][GET] error', error);
    return NextResponse.json({ success: false, message: 'Failed to fetch popular products' }, { status: 500 });
  }
}

// POST /api/admin/popular-products - добавить товар в популярные
export async function POST(request: Request) {
  try {
    if (!isAuthed(request)) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { productId, order } = body as {
      productId: string;
      order?: number;
    };

    if (!productId) {
      return NextResponse.json({ success: false, message: 'productId is required' }, { status: 400 });
    }

    // Проверяем, существует ли товар
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      return NextResponse.json({ success: false, message: 'Product not found' }, { status: 404 });
    }

    // Проверяем, не добавлен ли уже товар
    const existing = await prisma.popularProduct.findUnique({
      where: { productId },
    });

    if (existing) {
      return NextResponse.json({ success: false, message: 'Product already in popular list' }, { status: 400 });
    }

    // Определяем порядок (максимальный + 1 или указанный)
    const maxOrder = order !== undefined 
      ? order 
      : (await prisma.popularProduct.findFirst({ orderBy: { order: 'desc' } }))?.order ?? -1) + 1;

    const created = await prisma.popularProduct.create({
      data: {
        productId,
        order: maxOrder,
      },
      include: {
        product: {
          include: {
            i18n: {
              where: { locale: 'ru' },
              select: { title: true },
            },
            images: {
              orderBy: { order: 'asc' },
              take: 1,
            },
          },
        },
      },
    });

    return NextResponse.json(
      serializeJSON({
        success: true,
        data: {
          id: created.id,
          productId: created.productId,
          order: created.order,
        },
      }),
      { status: 201 }
    );
  } catch (error) {
    console.error('[admin/popular-products][POST] error', error);
    return NextResponse.json({ success: false, message: 'Failed to add popular product' }, { status: 500 });
  }
}

// PUT /api/admin/popular-products - обновить порядок популярных товаров
export async function PUT(request: Request) {
  try {
    if (!isAuthed(request)) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { items } = body as {
      items: Array<{ id: string; order: number }>;
    };

    if (!Array.isArray(items)) {
      return NextResponse.json({ success: false, message: 'items array is required' }, { status: 400 });
    }

    // Обновляем порядок для всех элементов
    await Promise.all(
      items.map((item) =>
        prisma.popularProduct.update({
          where: { id: item.id },
          data: { order: item.order },
        })
      )
    );

    return NextResponse.json(serializeJSON({ success: true }), { status: 200 });
  } catch (error) {
    console.error('[admin/popular-products][PUT] error', error);
    return NextResponse.json({ success: false, message: 'Failed to update popular products order' }, { status: 500 });
  }
}
