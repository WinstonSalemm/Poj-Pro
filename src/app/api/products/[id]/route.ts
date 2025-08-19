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

function parseImages(raw?: string | null): string[] {
  if (!raw) return [];
  try {
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? arr.filter((x) => typeof x === 'string') : [];
  } catch {
    return [];
  }
}

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const { searchParams } = new URL(req.url);
    const locale = asLocale(searchParams.get('locale'));
    const id = decodeURIComponent(params.id);

    // Try lookup by id first; if not found, fallback to slug support
    const product = await prisma.product.findFirst({
      where: { OR: [{ id }, { slug: id }] },
      include: {
        category: true,
        i18n: {
          where: { locale },
          select: { title: true, summary: true, description: true },
        },
      },
    });

    if (!product) {
      return NextResponse.json({ success: false, message: 'Product not found' }, { status: 404 });
    }

    const tr = Array.isArray(product.i18n) && product.i18n[0] ? product.i18n[0] : null;
    const images = parseImages(product.images);
    const specs = product.specs && typeof product.specs === 'object' ? (product.specs as Record<string, unknown>) : {};

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
    console.error('[api/products/[id]] error', error);
    const message = error instanceof Error ? error.message : 'Internal error';
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}
