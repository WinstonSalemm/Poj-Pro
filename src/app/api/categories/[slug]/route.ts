import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';

type Locale = 'ru' | 'en' | 'uz';
const asLocale = (v?: string | null): Locale => {
  const s = (v || '').toLowerCase();
  if (s === 'en' || s === 'eng') return 'en';
  if (s === 'uz' || s === 'uzb') return 'uz';
  return 'ru';
};

function parseImages(raw: string): string[] {
  if (!raw) return [];
  try {
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? arr.filter((x) => typeof x === 'string') : [];
  } catch {
    return [];
  }
}

export async function GET(req: Request, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { searchParams } = new URL(req.url);
    const locale = asLocale(searchParams.get('locale'));
    const { slug: rawSlug } = await params;
    const slug = decodeURIComponent(rawSlug);

    // First check if category exists
    const category = await prisma.category.findUnique({
      where: { slug },
      include: {
        products: {
          where: { isActive: true },
          include: {
            i18n: {
              where: { locale },
              select: { title: true, summary: true, description: true }
            }
          },
          orderBy: { id: 'asc' }
        }
      }
    });

    if (!category) {
      const allCategories = await prisma.category.findMany({
        select: { slug: true, name: true },
        take: 50
      });

      return NextResponse.json(
        { 
          products: [],
          message: `Category '${slug}' not found`,
          availableCategories: allCategories.map(c => c.slug)
        },
        { status: 200 }
      );
    }

    const products = category.products.map((p) => {
      const tr = p.i18n[0] || null;
      const images = parseImages(p.images);
      return {
        id: p.id,
        slug: p.slug,
        title: tr?.title || p.slug,
        image: images[0] || '',
        images,
        price: p.price ?? 0,
        description: tr?.description ?? null,
        summary: tr?.summary ?? null,
        category: { 
          name: category.name ?? category.slug, 
          slug: category.slug 
        },
      };
    });

    return NextResponse.json({ 
      products,
      total: products.length,
      page: 1,
      perPage: products.length,
      totalPages: 1
    }, { status: 200 });
  } catch (error: unknown) {
    console.error('[api/categories/[slug]] error', error);
    const message = error instanceof Error ? error.message : 'Internal error';
    return NextResponse.json(
      { 
        products: [],
        message
      }, 
      { status: 500 }
    );
  }
}
