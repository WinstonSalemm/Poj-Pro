import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const revalidate = 60;
export const dynamic = 'force-static';

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

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const locale = normLocale(url.searchParams.get('locale'));

    const [products, categories] = await Promise.all([
      prisma.product.findMany({
        where: { isActive: true },
        include: { i18n: true, category: true },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.category.findMany({
        orderBy: [
          { name: 'asc' },
          { slug: 'asc' },
        ],
        select: { id: true, slug: true, name: true },
      }),
    ]);

    const productsData = products.map((p) => {
      const t = p.i18n.find((x) => x.locale === locale) || p.i18n.find((x) => x.locale === 'ru') || p.i18n[0];
      const images = parseImages(p.images);
      return {
        id: p.id,
        slug: p.slug,
        title: t?.title || p.slug,
        description: t?.description || undefined,
        summary: t?.summary || undefined,
        price: p.price ?? 0,
        category: p.category ? { slug: p.category.slug, name: p.category.name ?? p.category.slug } : undefined,
        images,
        image: images[0] || undefined,
      };
    });

    return NextResponse.json(
      { products: productsData, categories },
      { status: 200, headers: { 'Cache-Control': 's-maxage=60, stale-while-revalidate=600' } }
    );
  } catch (error) {
    console.error('[api/bootstrap][GET] error', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
