import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

type Locale = 'ru' | 'en' | 'uz';
const asLocale = (v?: string | null): Locale => (v === 'en' ? 'en' : v === 'uz' ? 'uz' : 'ru');

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
    const { searchParams } = new URL(req.url);
    const locale = asLocale(searchParams.get('locale'));
    const { pathname } = new URL(req.url);
    const segments = pathname.split('/');
    const slug = segments[segments.indexOf('products-new') + 1] || '';
    const decodedSlug = decodeURIComponent(slug);

    const product = await prisma.product.findUnique({
      where: { slug: decodedSlug },
      include: {
        category: true,
        i18n: {
          where: { locale },
          select: { title: true, summary: true, description: true },
        },
        images: {
          orderBy: { order: 'asc' },
        },
      },
    });

    if (!product) {
      return NextResponse.json({ success: false, message: 'Product not found' }, { status: 404 });
    }

    const tr = product.i18n[0] || null;
    const images = product.images.map((img) => img.url);
    const specs = product.specs && typeof product.specs === 'object' 
      ? (product.specs as Record<string, unknown>) 
      : {};

    const data = {
      id: product.id,
      slug: product.slug,
      title: tr?.title || product.slug,
      category: product.category 
        ? { name: product.category.name ?? product.category.slug, slug: product.category.slug } 
        : null,
      images,
      price: product.price ?? 0,
      description: tr?.description ?? null,
      summary: tr?.summary ?? null,
      specs,
    };

    return NextResponse.json({ success: true, data }, { status: 200 });
  } catch (error: unknown) {
    console.error('[api/products-new/[slug]] error', error);
    const message = error instanceof Error ? error.message : 'Internal error';
    return NextResponse.json(
      { success: false, message },
      { status: 500 }
    );
  }
}
