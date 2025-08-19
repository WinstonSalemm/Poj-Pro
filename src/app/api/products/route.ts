import { NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';

type Locale = 'ru' | 'en' | 'uz';
const asLocale = (v?: string | null): Locale => {
  const s = (v || '').toLowerCase();
  if (s === 'en' || s === 'eng') return 'en';
  if (s === 'uz' || s === 'uzb') return 'uz';
  return 'ru';
};

function parseImages(raw?: string | null): string[] {
  if (!raw) return [];
  try {
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? arr.filter((x) => typeof x === 'string') : [];
  } catch {
    return [];
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const locale = asLocale(searchParams.get('locale'));
    const category = searchParams.get('category');
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '12', 10);
    const skip = (page - 1) * limit;

    // Build the where clause
    const where: Prisma.ProductWhereInput = {
      isActive: true,
      ...(category ? { category: { slug: category } } : {})
    };

    // Get total count for pagination
    const total = await prisma.product.count({ where });

    // Get products with translations
    const products = await prisma.product.findMany({
      where,
      skip,
      take: limit,
      include: {
        category: true,
        i18n: {
          where: { locale },
          select: { title: true, summary: true }
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Transform the data
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const transformedProducts = products.map(product => {
      const translation = Array.isArray(product.i18n) && product.i18n[0] ? product.i18n[0] : null;
      const images = parseImages(product.images);
      const fullImages = images.map(img => 
        img.startsWith('http') ? img : `${baseUrl}${img.startsWith('/') ? '' : '/'}${img}`
      );

      return {
        id: product.id,
        slug: product.slug,
        title: translation ? translation.title : product.slug,
        summary: translation?.summary || null,
        price: product.price,
        image: fullImages[0],
        category: product.category ? {
          id: product.category.id,
          name: product.category.name || product.category.slug,
          slug: product.category.slug
        } : null
      };
    });

    return NextResponse.json({
      success: true,
      data: {
        products: transformedProducts,
        pagination: {
          total,
          page,
          limit,
          pages: Math.ceil(total / limit)
        }
      }
    });

  } catch (error: unknown) {
    console.error('Ошибка при получении товара:', error);
    const errorMessage = error instanceof Error ? error.message : 'Неизвестная ошибка';
    return NextResponse.json(
      { 
        success: false, 
        message: `Не удалось загрузить товар: ${errorMessage}` 
      },
      { status: 500 }
    );
  }
}