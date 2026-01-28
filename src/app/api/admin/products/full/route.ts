// src/app/api/admin/products/full/route.ts
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

// POST /api/admin/products/full
export async function POST(request: NextRequest) {
  try {
    if (!isAuthed(request)) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
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
      slug: string;
      brand?: string;
      price?: number;
      stock?: number;
      currency?: string;
      images?: string[];
      categorySlug?: string;
      i18n?: {
        ru?: { title: string; summary?: string; description?: string };
        eng?: { title: string; summary?: string; description?: string };
        uzb?: { title: string; summary?: string; description?: string };
      };
      specs?: Record<string, Record<'ru' | 'eng' | 'uzb', string>>;
    };

    if (!slug || !i18n?.ru?.title) {
      return NextResponse.json(
        { success: false, message: 'slug and i18n.ru.title are required' },
        { status: 400 }
      );
    }

    // Создаём или получаем категорию
    const normalizedSlug = (categorySlug ?? '').trim();
    let category = null;
    
    if (normalizedSlug) {
      try {
        category = await prisma.category.upsert({
          where: { slug: normalizedSlug },
          update: {},
          create: { slug: normalizedSlug, name: normalizedSlug },
        });
      } catch (catError) {
        console.error('[admin/products/full][POST] Category upsert error:', catError);
        // Продолжаем без категории, если ошибка
      }
    }

    // Формируем данные для создания товара
    const productData: any = {
      slug: slug.trim(),
      brand: brand?.trim() || null,
      price: typeof price === 'number' ? price : null,
      stock: typeof stock === 'number' ? stock : 0,
      currency: currency || 'UZS',
      categoryId: category?.id || null,
      isActive: true,
    };

    // Добавляем характеристики (specs) если они есть
    if (specs && Object.keys(specs).length > 0) {
      // Убеждаемся, что specs в правильном формате для Prisma Json
      productData.specs = specs as any;
    } else {
      // Если specs нет, устанавливаем null
      productData.specs = null;
    }

    // Функция для обрезки текста до 191 символа (ограничение VARCHAR в MySQL)
    const truncateText = (text: string | null | undefined, maxLength: number = 191): string | null => {
      if (!text) return null;
      const trimmed = text.trim();
      return trimmed.length > maxLength ? trimmed.substring(0, maxLength) : trimmed;
    };

    // Создаём товар с переводами
    const created = await prisma.product.create({
      data: {
        ...productData,
        i18n: {
          create: [
            // Русский (обязательный)
            {
              locale: 'ru',
              title: truncateText(i18n.ru.title, 191) || '',
              summary: truncateText(i18n.ru.summary, 191),
              description: truncateText(i18n.ru.description, 191),
            },
            // Английский
            ...(i18n.eng?.title
              ? [
                  {
                    locale: 'eng',
                    title: truncateText(i18n.eng.title, 191) || '',
                    summary: truncateText(i18n.eng.summary, 191),
                    description: truncateText(i18n.eng.description, 191),
                  },
                ]
              : []),
            // Узбекский
            ...(i18n.uzb?.title
              ? [
                  {
                    locale: 'uzb',
                    title: truncateText(i18n.uzb.title, 191) || '',
                    summary: truncateText(i18n.uzb.summary, 191),
                    description: truncateText(i18n.uzb.description, 191),
                  },
                ]
              : []),
          ],
        },
      },
      include: { i18n: true, category: true },
    });

    // Создаём изображения через ProductImage таблицу
    if (Array.isArray(images) && images.length > 0) {
      await prisma.productImage.createMany({
        data: images.map((url, index) => ({
          productId: created.id,
          url,
          order: index,
        })),
      });
    }

    return NextResponse.json(
      serializeJSON({ success: true, data: { id: created.id, slug: created.slug } }),
      { status: 201 }
    );
  } catch (error) {
    console.error('[admin/products/full][POST] error', error);
    console.error('[admin/products/full][POST] error details:', {
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      code: error && typeof error === 'object' && 'code' in error ? error.code : undefined,
    });
    
    // Обработка ошибки дублирования slug
    if (error && typeof error === 'object' && 'code' in error && error.code === 'P2002') {
      return NextResponse.json(
        { success: false, message: 'Товар с таким slug уже существует' },
        { status: 400 }
      );
    }

    const errorMessage = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to create product', 
        error: errorMessage,
        details: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.stack : undefined) : undefined,
      },
      { status: 500 }
    );
  }
}

