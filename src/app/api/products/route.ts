import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

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

    const products = await prisma.product.findMany({
      where: { isActive: true },
      include: {
        i18n: true,
        category: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    const data = products.map((p) => {
      const t = p.i18n.find((x) => x.locale === locale)
        || p.i18n.find((x) => x.locale === 'ru')
        || p.i18n[0];
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

    // Keep compatibility with callers expecting data.data.products
    return NextResponse.json({ success: true, data: { products: data } }, { status: 200 });
  } catch (error) {
    console.error('[api/products][GET] error', error);
    return NextResponse.json({ success: false, message: 'Failed to fetch products' }, { status: 500 });
  }
}