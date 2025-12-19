import { NextRequest, NextResponse } from 'next/server';
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

// GET /api/admin/products/[id] - Получить полные данные товара для редактирования
export async function GET(req: NextRequest) {
  try {
    if (!isAuthed(req)) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const { pathname } = new URL(req.url);
    const segments = pathname.split('/');
    const id = segments[segments.indexOf('products') + 1] || '';

    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
        i18n: {
          where: { locale: { in: ['ru', 'eng', 'uzb'] } },
        },
      },
    });

    if (!product) {
      return NextResponse.json({ success: false, message: 'Product not found' }, { status: 404 });
    }

    // Парсим изображения
    const images = parseImages(product.images);

    // Парсим specs
    const rawSpecs = product.specs && typeof product.specs === 'object' 
      ? (product.specs as Record<string, unknown>) 
      : {};

    // Формируем i18n данные
    const i18nData = {
      ru: product.i18n.find((t) => t.locale === 'ru') || { title: '', summary: '', description: '' },
      eng: product.i18n.find((t) => t.locale === 'eng') || { title: '', summary: '', description: '' },
      uzb: product.i18n.find((t) => t.locale === 'uzb') || { title: '', summary: '', description: '' },
    };

    // Формируем specs по языкам
    const specsByLang: Record<string, Record<'ru' | 'eng' | 'uzb', string>> = {};
    Object.entries(rawSpecs).forEach(([key, value]) => {
      if (value && typeof value === 'object' && !Array.isArray(value)) {
        const obj = value as Record<string, unknown>;
        specsByLang[key] = {
          ru: (obj.ru as string) || '',
          eng: (obj.eng as string) || '',
          uzb: (obj.uzb as string) || '',
        };
      }
    });

    const data = {
      id: product.id,
      slug: product.slug,
      brand: product.brand || '',
      price: product.price ? Number(product.price) : 0,
      stock: product.stock,
      currency: product.currency || 'UZS',
      categorySlug: product.category?.slug || '',
      images,
      i18n: {
        ru: {
          title: i18nData.ru.title || '',
          summary: i18nData.ru.summary || '',
          description: i18nData.ru.description || '',
        },
        eng: {
          title: i18nData.eng.title || '',
          summary: i18nData.eng.summary || '',
          description: i18nData.eng.description || '',
        },
        uzb: {
          title: i18nData.uzb.title || '',
          summary: i18nData.uzb.summary || '',
          description: i18nData.uzb.description || '',
        },
      },
      specs: specsByLang,
    };

    return NextResponse.json(serializeJSON({ success: true, data }), { status: 200 });
  } catch (error) {
    console.error('[admin/products/[id]][GET] error', error);
    return NextResponse.json({ success: false, message: 'Failed to fetch product' }, { status: 500 });
  }
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
