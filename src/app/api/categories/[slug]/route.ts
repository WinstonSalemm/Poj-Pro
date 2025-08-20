import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function normLocale(raw?: string | null): 'ru' | 'en' | 'uz' {
  const s = (raw || '').toLowerCase();
  if (s === 'en' || s === 'eng') return 'en';
  if (s === 'uz' || s === 'uzb') return 'uz';
  return 'ru';
}

function parseImages(raw?: string | null): string[] {
  if (!raw) return [];
  try {
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? arr.filter((x) => typeof x === 'string') : [];
  } catch {
    return [];
  }
}

type Ctx = { params: { slug: string } };

export async function GET(req: Request, ctx: Ctx) {
  try {
    const url = new URL(req.url);
    const locale = normLocale(url.searchParams.get('locale'));
    const slug = decodeURIComponent(ctx.params.slug || '');

    if (!slug) {
      return NextResponse.json({ message: 'Category slug is required' }, { status: 400 });
    }

    const category = await prisma.category.findUnique({
      where: { slug },
      include: {
        products: {
          where: { isActive: true },
          include: { i18n: true, category: true },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!category) {
      return NextResponse.json({ message: 'Category not found' }, { status: 404 });
    }

    const products = category.products.map((p) => {
      const t = p.i18n.find((x) => x.locale === locale)
        || p.i18n.find((x) => x.locale === 'ru')
        || p.i18n[0];
      const images = parseImages(p.images);
      return {
        id: p.id,
        slug: p.slug,
        title: t?.title || p.slug,
        description: t?.description || undefined,
        price: p.price ?? 0,
        category: p.category ? { slug: p.category.slug, name: p.category.name ?? p.category.slug } : undefined,
        images,
        image: images[0] || undefined,
      };
    });

    return NextResponse.json({ products }, { status: 200 });
  } catch (error) {
    console.error('[api/categories/[slug]][GET] error', error);
    return NextResponse.json({ message: 'Failed to fetch category products' }, { status: 500 });
  }
}
