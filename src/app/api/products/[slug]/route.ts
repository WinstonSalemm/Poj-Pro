import { NextRequest, NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

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

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const locale = asLocale(searchParams.get('locale'));
    // Accept aliases that might be stored in DB (e.g., 'eng', 'uzb')
    const localeVariants: string[] =
      locale === 'en' ? ['en', 'eng'] : locale === 'uz' ? ['uz', 'uzb'] : ['ru'];
    const { pathname } = new URL(req.url);
    const segments = pathname.split('/');
    const rawSlug = segments[segments.indexOf('products') + 1] || '';
    const slug = decodeURIComponent(rawSlug);

    // Try to find by ID or slug. Prisma schema uses String id, so try raw string id as well.
    const id = slug;
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
    const where: Prisma.ProductWhereInput = {
      OR: [
        { slug },
        { id }, // raw string id
        ...(isUuid ? [{ id }] : []),
      ],
    };
    
    const product = await prisma.product.findFirst({
      where,
      include: {
        category: true,
        i18n: {
          // Match by any acceptable variant for the requested locale
          where: { locale: { in: localeVariants } },
          select: { title: true, summary: true, description: true },
        },
      },
    });

    if (!product) {
      return NextResponse.json(
        { success: false, message: 'Product not found' }, 
        { status: 404 }
      );
    }

    const tr = Array.isArray(product.i18n) && product.i18n.length > 0 
      ? product.i18n[0] 
      : null;
    
    const images = parseImages(product.images);
    const rawSpecs = product.specs && typeof product.specs === 'object'
      ? (product.specs as Record<string, unknown>)
      : {};

    // Localize spec values: if a value is an object with locale keys, pick the requested locale
    const pickKeys = locale === 'en' ? ['en', 'eng'] : locale === 'uz' ? ['uz', 'uzb'] : ['ru'];
    const specs = Object.fromEntries(
      Object.entries(rawSpecs).map(([k, v]) => {
        if (v && typeof v === 'object' && !Array.isArray(v)) {
          const obj = v as Record<string, unknown>;
          for (const lk of pickKeys) {
            if (Object.prototype.hasOwnProperty.call(obj, lk)) {
              const val = obj[lk];
              return [k, typeof val === 'string' ? val : String(val ?? '')];
            }
          }
        }
        return [k, typeof v === 'string' ? v : String(v ?? '')];
      })
    );

    // Prepare the response data
    const responseData = {
      id: product.id,
      slug: product.slug,
      title: tr?.title || product.slug,
      summary: tr?.summary || null,
      description: tr?.description || null,
      price: product.price ?? 0,
      images: images,
      specs: specs,
      category: product.category ? {
        id: product.category.id,
        name: product.category.name || product.category.slug,
        slug: product.category.slug
      } : null
    };

    return NextResponse.json({ success: true, data: responseData }, { status: 200 });
  } catch (error: unknown) {
    console.error('Error fetching product:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json(
      { 
        success: false, 
        message: `Failed to fetch product: ${errorMessage}` 
      },
      { status: 500 }
    );
  }
}
