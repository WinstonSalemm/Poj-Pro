// src/app/api/admin/products/full/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
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

// PUT /api/admin/products/full/[id] - Обновить товар со всеми полями
export async function PUT(req: NextRequest) {
  try {
    if (!isAuthed(req)) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const { pathname } = new URL(req.url);
    const segments = pathname.split('/');
    const id = segments[segments.indexOf('full') + 1] || '';

    const body = await req.json();
    const {
      slug,
      brand,
      price,
      stock,
      currency,
      images,
      categorySlug,
      i18n,
      specs,
    } = body as {
      slug?: string;
      brand?: string;
      price?: number;
      stock?: number;
      currency?: string;
      images?: Array<{ url: string; data: string }>;
      categorySlug?: string;
      i18n?: {
        ru?: { title: string; summary?: string; description?: string };
        eng?: { title: string; summary?: string; description?: string };
        uzb?: { title: string; summary?: string; description?: string };
      };
      specs?: Record<string, Record<'ru' | 'eng' | 'uzb', string>>;
    };

    if (!i18n?.ru?.title) {
      return NextResponse.json(
        { success: false, message: 'i18n.ru.title is required' },
        { status: 400 }
      );
    }

    const normalizedSlug = (categorySlug ?? '').trim();
    const category = normalizedSlug
      ? await prisma.category.upsert({
          where: { slug: normalizedSlug },
          update: {},
          create: {
            slug: normalizedSlug,
            name: normalizedSlug,
            i18n: {
              create: { locale: 'ru', name: normalizedSlug },
            },
          },
        })
      : null;

    // Обновляем товар
    const updated = await prisma.product.update({
      where: { id },
      data: {
        ...(slug ? { slug: slug.trim() } : {}),
        ...(brand !== undefined ? { brand: brand.trim() || null } : {}),
        ...(typeof price === 'number' ? { price } : {}),
        ...(typeof stock === 'number' ? { stock } : {}),
        ...(currency ? { currency } : {}),
        ...(categorySlug !== undefined ? { categoryId: category?.id || null } : {}),
        ...(specs ? { specs } : {}),
      },
      include: { i18n: true },
    });

    // Обновляем изображения через ProductImage таблицу
    if (Array.isArray(images)) {
      // Удаляем старые изображения
      await prisma.productImage.deleteMany({ where: { productId: id } });
      // Создаём новые изображения с base64 данными
      if (images.length > 0) {
        const imageRecords = images.map((img, index) => ({
          productId: id,
          url: img.url,
          data: img.data ? Buffer.from(img.data, 'base64') : null,
          order: index,
        }));

        await prisma.productImage.createMany({
          data: imageRecords,
        });

        console.log(`[admin/products/full/[id]][PUT] Saved ${images.length} images to database`);
      }
    }

    // Обновляем переводы
    if (i18n) {
      const truncateText = (text: string | null | undefined, maxLength: number = 191): string | null => {
        if (!text) return null;
        const trimmed = text.trim();
        return trimmed.length > maxLength ? trimmed.substring(0, maxLength) : trimmed;
      };

      // Русский (обязательный)
      await prisma.productI18n.upsert({
        where: { productId_locale: { productId: id, locale: 'ru' } },
        update: {
          title: truncateText(i18n.ru.title, 191) || '',
          summary: truncateText(i18n.ru.summary, 191),
          description: truncateText(i18n.ru.description, 191),
        },
        create: {
          productId: id,
          locale: 'ru',
          title: truncateText(i18n.ru.title, 191) || '',
          summary: truncateText(i18n.ru.summary, 191),
          description: truncateText(i18n.ru.description, 191),
        },
      });

      // Английский
      if (i18n.eng?.title) {
        await prisma.productI18n.upsert({
          where: { productId_locale: { productId: id, locale: 'eng' } },
          update: {
            title: truncateText(i18n.eng.title, 191) || '',
            summary: truncateText(i18n.eng.summary, 191),
            description: truncateText(i18n.eng.description, 191),
          },
          create: {
            productId: id,
            locale: 'eng',
            title: truncateText(i18n.eng.title, 191) || '',
            summary: truncateText(i18n.eng.summary, 191),
            description: truncateText(i18n.eng.description, 191),
          },
        });
      }

      // Узбекский
      if (i18n.uzb?.title) {
        await prisma.productI18n.upsert({
          where: { productId_locale: { productId: id, locale: 'uzb' } },
          update: {
            title: truncateText(i18n.uzb.title, 191) || '',
            summary: truncateText(i18n.uzb.summary, 191),
            description: truncateText(i18n.uzb.description, 191),
          },
          create: {
            productId: id,
            locale: 'uzb',
            title: truncateText(i18n.uzb.title, 191) || '',
            summary: truncateText(i18n.uzb.summary, 191),
            description: truncateText(i18n.uzb.description, 191),
          },
        });
      }
    }

    return NextResponse.json(
      serializeJSON({ success: true, data: { id: updated.id, slug: updated.slug } }),
      { status: 200 }
    );
  } catch (error) {
    console.error('[admin/products/full/[id]][PUT] error', error);

    if (error && typeof error === 'object' && 'code' in error && error.code === 'P2002') {
      return NextResponse.json(
        { success: false, message: 'Товар с таким slug уже существует' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, message: 'Failed to update product', error: String(error) },
      { status: 500 }
    );
  }
}
