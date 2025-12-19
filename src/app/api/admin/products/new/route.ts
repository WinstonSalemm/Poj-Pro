import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function isAuthed(request: Request): boolean {
  const token = request.headers.get('x-admin-token');
  const adminPassword = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || 'admin-ship-2025';
  return token === adminPassword;
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

// GET /api/admin/products/new - Получить список новых товаров
export async function GET(req: NextRequest) {
  try {
    if (!isAuthed(req)) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    // Новые товары: созданы за последние 14 дней
    // Если нет товаров за 14 дней - не показываем ничего
    const fourteenDaysAgo = new Date();
    fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);

    // Базовые условия
    const baseWhere: any = {
      isActive: true,
      createdAt: { gte: fourteenDaysAgo },
    };

    const products = await prisma.product.findMany({
      where: baseWhere,
      include: {
        i18n: {
          where: { locale: 'ru' },
          take: 1,
        },
        category: {
          select: {
            id: true,
            slug: true,
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    const formatted = products.map((p) => ({
      id: p.id,
      slug: p.slug,
      title: p.i18n[0]?.title || p.slug,
      price: p.price ? Number(p.price) : 0,
      stock: p.stock,
      currency: p.currency || 'UZS',
      brand: p.brand,
      isActive: p.isActive,
      createdAt: p.createdAt.toISOString(),
      category: p.category
        ? {
            id: p.category.id,
            slug: p.category.slug,
            name: p.category.name || p.category.slug,
          }
        : null,
      images: parseImages(p.images),
    }));

    return NextResponse.json({
      success: true,
      data: formatted,
      count: formatted.length,
    });
  } catch (error) {
    console.error('[admin/products/new][GET] error', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch new products', error: String(error) },
      { status: 500 }
    );
  }
}
