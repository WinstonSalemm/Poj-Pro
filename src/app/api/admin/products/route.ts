import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { serializeJSON } from '@/lib/json';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

function parseImages(raw?: string | null): string[] {
  if (!raw) return [];
  try {
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? arr.filter((x) => typeof x === 'string') : [];
  } catch {
    return [];
  }
}

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

// GET /api/admin/products
export async function GET() {
  try {
    const products = await prisma.product.findMany({
      include: {
        i18n: {
          where: { locale: { in: ['ru', 'eng', 'en', 'uz', 'uzb'] } },
          select: { title: true, locale: true },
        },
        category: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    const data = products.map((p) => ({
      id: p.id,
      slug: p.slug,
      title: (p.i18n.find((t) => t.locale === 'ru') || p.i18n[0])?.title || p.slug,
      price: p.price ?? 0,
      stock: (p as unknown as { stock?: number }).stock ?? 0,
      isActive: p.isActive,
      category: p.category ? { id: p.category.id, slug: p.category.slug, name: p.category.name ?? p.category.slug } : null,
      images: parseImages(p.images),
    }));

    return NextResponse.json(serializeJSON({ success: true, data }), { status: 200 });
  } catch (error) {
    console.error('[admin/products][GET] error', error);
    return NextResponse.json({ success: false, message: 'Failed to fetch products' }, { status: 500 });
  }
}

// POST /api/admin/products
export async function POST(request: Request) {
  try {
    if (!isAuthed(request)) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { slug, title, price, stock, images, categorySlug } = body as {
      slug: string;
      title: string;
      price?: number;
      stock?: number;
      images?: string[];
      categorySlug?: string;
    };

    if (!slug || !title) {
      return NextResponse.json({ success: false, message: 'slug and title are required' }, { status: 400 });
    }

    const normalizedSlug = (categorySlug ?? '').trim();
    const category = normalizedSlug
      ? await prisma.category.upsert({
          where: { slug: normalizedSlug },
          update: {},
          create: { slug: normalizedSlug, name: normalizedSlug },
        })
      : null;

    const created = await prisma.product.create({
      data: {
        slug,
        price: typeof price === 'number' ? price : 0,
        stock: typeof stock === 'number' ? stock : 0,
        images: serializeImages(images),
        categoryId: category?.id,
        i18n: {
          create: [{ locale: 'ru', title }],
        },
      },
      include: { i18n: true, category: true },
    });

    return NextResponse.json(serializeJSON({ success: true, data: { id: created.id } }), { status: 201 });
  } catch (error) {
    console.error('[admin/products][POST] error', error);
    return NextResponse.json({ success: false, message: 'Failed to create product' }, { status: 500 });
  }
}
