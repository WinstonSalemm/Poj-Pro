import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { serializeJSON } from '@/lib/json';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

function serializeImages(images?: unknown): string {
  if (!images) return JSON.stringify([]);
  if (Array.isArray(images)) {
    return JSON.stringify(images.filter((x) => typeof x === 'string'));
  }
  return JSON.stringify([]);
}

function isAuthed(request: Request): boolean {
  const token = request.headers.get('x-admin-token');
  const adminPassword = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || 'admin-ship-2025';
  return token === adminPassword;
}

// PUT /api/admin/products/[id]
export async function PUT(req: NextRequest) {
  try {
    if (!isAuthed(req)) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const { pathname } = new URL(req.url);
    const segments = pathname.split('/');
    const id = segments[segments.indexOf('products') + 1] || '';
    const body = await req.json();
    const { slug, title, price, stock, images, categorySlug, isActive } = body as {
      slug?: string;
      title?: string;
      price?: number;
      stock?: number;
      images?: string[];
      categorySlug?: string | null;
      isActive?: boolean;
    };

    const category = typeof categorySlug === 'string'
      ? await prisma.category.upsert({
          where: { slug: categorySlug },
          update: {},
          create: { slug: categorySlug, name: categorySlug },
        })
      : null;

    const updated = await prisma.product.update({
      where: { id },
      data: {
        ...(typeof slug === 'string' ? { slug } : {}),
        ...(typeof price === 'number' ? { price } : {}),
        ...(typeof stock === 'number' ? { stock } : {}),
        ...(Array.isArray(images) ? { images: serializeImages(images) } : {}),
        ...(typeof isActive === 'boolean' ? { isActive } : {}),
        ...(categorySlug !== undefined ? { categoryId: category?.id ?? null } : {}),
        ...(typeof title === 'string'
          ? {
              i18n: {
                upsert: {
                  where: { productId_locale: { productId: id, locale: 'ru' } },
                  update: { title },
                  create: { locale: 'ru', title },
                },
              },
            }
          : {}),
      },
      include: { i18n: true },
    });

    return NextResponse.json(serializeJSON({ success: true, data: { id: updated.id } }), { status: 200 });
  } catch (error) {
    console.error('[admin/products/[id]][PUT] error', error);
    return NextResponse.json({ success: false, message: 'Failed to update product' }, { status: 500 });
  }
}

// DELETE /api/admin/products/[id]
export async function DELETE(req: NextRequest) {
  try {
    if (!isAuthed(req)) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const { pathname } = new URL(req.url);
    const segments = pathname.split('/');
    const id = segments[segments.indexOf('products') + 1] || '';

    // Delete i18n first due to FK
    await prisma.productI18n.deleteMany({ where: { productId: id } });
    // Delete certificates relation if exists
    await prisma.productCertificate.deleteMany({ where: { productId: id } });

    await prisma.product.delete({ where: { id } });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('[admin/products/[id]][DELETE] error', error);
    return NextResponse.json({ success: false, message: 'Failed to delete product' }, { status: 500 });
  }
}
