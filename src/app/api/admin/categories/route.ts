import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type Locale = 'ru' | 'eng' | 'uzb';

function isAuthed(request: Request): boolean {
  const token = request.headers.get('x-admin-token');
  const adminPassword = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || 'admin-ship-2025';
  return token === adminPassword;
}

function normalizeCategoryName(i18n?: Partial<Record<Locale, string>>): string | null {
  if (!i18n) return null;
  return i18n.ru?.trim() || i18n.eng?.trim() || i18n.uzb?.trim() || null;
}

// GET /api/admin/categories - Получить все категории для админа
export async function GET(req: NextRequest) {
  try {
    if (!isAuthed(req)) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const categories = await prisma.category.findMany({
      orderBy: [
        { name: 'asc' },
        { slug: 'asc' },
      ],
      include: {
        i18n: {
          where: { locale: { in: ['ru', 'eng', 'uzb'] } },
          select: { locale: true, name: true },
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: categories.map((category) => ({
        id: category.id,
        slug: category.slug,
        name: category.name,
        image: category.image,
        i18n: {
          ru: category.i18n.find((t) => t.locale === 'ru')?.name || '',
          eng: category.i18n.find((t) => t.locale === 'eng')?.name || '',
          uzb: category.i18n.find((t) => t.locale === 'uzb')?.name || '',
        },
      })),
    });
  } catch (error) {
    console.error('[admin/categories][GET] error', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch categories', error: String(error) },
      { status: 500 }
    );
  }
}

// POST /api/admin/categories - Создать новую категорию
export async function POST(req: NextRequest) {
  try {
    if (!isAuthed(req)) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { slug, name, image, imageData, i18n } = body as {
      slug: string;
      name?: string;
      image?: string;
      imageData?: string; // base64
      i18n?: Partial<Record<Locale, string>>;
    };

    console.log('[admin/categories][POST] Received:', {
      slug,
      name,
      image,
      imageData: imageData ? `base64 (${imageData.length} chars)` : 'undefined',
      i18n,
    });

    if (!slug || !slug.trim()) {
      return NextResponse.json(
        { success: false, message: 'slug is required' },
        { status: 400 }
      );
    }

    const normalizedSlug = slug.trim();
    const normalizedI18n: Partial<Record<Locale, string>> = {
      ru: i18n?.ru?.trim() || '',
      eng: i18n?.eng?.trim() || '',
      uzb: i18n?.uzb?.trim() || '',
    };

    const fallbackName =
      normalizedI18n.ru ||
      normalizedI18n.eng ||
      normalizedI18n.uzb ||
      name?.trim() ||
      normalizedSlug;

    // Проверяем существует ли категория
    const existingCategory = await prisma.category.findUnique({
      where: { slug: normalizedSlug },
    });

    let category;

    if (existingCategory) {
      // Обновляем существующую категорию
      console.log('[admin/categories][POST] Updating existing category:', existingCategory.id);
      category = await prisma.category.update({
        where: { slug: normalizedSlug },
        data: {
          name: fallbackName,
          ...(image !== undefined ? { image: image.trim() || null } : {}),
          ...(imageData !== undefined && imageData !== null ? { imageData: Buffer.from(imageData, 'base64') } : {}),
        },
      });
    } else {
      // Создаём новую категорию
      console.log('[admin/categories][POST] Creating new category');
      category = await prisma.category.create({
        data: {
          slug: normalizedSlug,
          name: fallbackName,
          image: image?.trim() || null,
          imageData: imageData ? Buffer.from(imageData, 'base64') : null,
        },
      });
    }

    const translations = Object.entries(normalizedI18n)
      .filter(([, value]) => Boolean(value)) as Array<[Locale, string]>;

    for (const [locale, translatedName] of translations) {
      await prisma.categoryI18n.upsert({
        where: {
          categoryId_locale: {
            categoryId: category.id,
            locale,
          },
        },
        update: { name: translatedName },
        create: {
          categoryId: category.id,
          locale,
          name: translatedName,
        },
      });
    }

    if (translations.length === 0 && normalizeCategoryName(i18n) === null) {
      await prisma.categoryI18n.upsert({
        where: {
          categoryId_locale: {
            categoryId: category.id,
            locale: 'ru',
          },
        },
        update: { name: fallbackName },
        create: {
          categoryId: category.id,
          locale: 'ru',
          name: fallbackName,
        },
      });
    }

    const categoryWithI18n = await prisma.category.findUnique({
      where: { id: category.id },
      include: {
        i18n: {
          where: { locale: { in: ['ru', 'eng', 'uzb'] } },
          select: { locale: true, name: true },
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        id: categoryWithI18n?.id,
        slug: categoryWithI18n?.slug,
        name: categoryWithI18n?.name,
        image: categoryWithI18n?.image,
        i18n: {
          ru: categoryWithI18n?.i18n.find((t) => t.locale === 'ru')?.name || '',
          eng: categoryWithI18n?.i18n.find((t) => t.locale === 'eng')?.name || '',
          uzb: categoryWithI18n?.i18n.find((t) => t.locale === 'uzb')?.name || '',
        },
      },
    });
  } catch (error) {
    console.error('[admin/categories][POST] error', error);

    if (error && typeof error === 'object' && 'code' in error && error.code === 'P2002') {
      return NextResponse.json(
        { success: false, message: 'Категория с таким slug уже существует' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, message: 'Failed to create category', error: String(error) },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/categories - Удалить категорию
export async function DELETE(req: NextRequest) {
  try {
    if (!isAuthed(req)) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, message: 'Category ID is required' },
        { status: 400 }
      );
    }

    // Проверяем, есть ли продукты в этой категории
    const productsCount = await prisma.product.count({
      where: { categoryId: id },
    });

    if (productsCount > 0) {
      return NextResponse.json(
        { success: false, message: `Нельзя удалить категорию: в ней ${productsCount} продукт(ов). Сначала удалите продукты.` },
        { status: 400 }
      );
    }

    await prisma.category.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: 'Категория удалена',
    });
  } catch (error) {
    console.error('[admin/categories][DELETE] error', error);
    return NextResponse.json(
      { success: false, message: 'Failed to delete category', error: String(error) },
      { status: 500 }
    );
  }
}
