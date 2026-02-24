import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

function normLocale(raw?: string | null): 'ru' | 'en' | 'uz' {
  const s = (raw || '').toLowerCase();
  if (s === 'en' || s === 'eng') return 'en';
  if (s === 'uz' || s === 'uzb') return 'uz';
  return 'ru';
}

function toDbLocale(locale: 'ru' | 'en' | 'uz'): 'ru' | 'eng' | 'uzb' {
  if (locale === 'en') return 'eng';
  if (locale === 'uz') return 'uzb';
  return 'ru';
}

function resolveCategoryName(args: {
  locale: 'ru' | 'en' | 'uz';
  fallback: string;
  i18n: Array<{ locale: string; name: string }>;
}): string {
  const dbLocale = toDbLocale(args.locale);
  return (
    args.i18n.find((x) => x.locale === dbLocale)?.name ||
    args.i18n.find((x) => x.locale === 'ru')?.name ||
    args.fallback
  );
}

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const locale = normLocale(url.searchParams.get('locale'));
    const { pathname } = url;
    const segments = pathname.split('/');
    const slug = decodeURIComponent(segments[segments.indexOf('categories') + 1] || '');

    if (!slug) {
      return NextResponse.json({ error: 'Category slug is required' }, { status: 400 });
    }

    const category = await prisma.category.findUnique({
      where: { slug },
      include: {
        i18n: {
          where: { locale: { in: ['ru', 'eng', 'uzb'] } },
          select: { locale: true, name: true },
        },
        products: {
          where: { isActive: true },
          include: {
            i18n: true,
            category: {
              include: {
                i18n: {
                  where: { locale: { in: ['ru', 'eng', 'uzb'] } },
                  select: { locale: true, name: true },
                },
              },
            },
            images: {
              orderBy: { order: 'asc' },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!category) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 });
    }

    const dbLocale = toDbLocale(locale);

    // Resolve category name for the requested locale
    const categoryName = resolveCategoryName({
      locale,
      fallback: category.name ?? category.slug,
      i18n: category.i18n,
    });

    const products = category.products.map((p) => {
      const t =
        p.i18n.find((x) => x.locale === dbLocale) ??
        p.i18n.find((x) => x.locale === 'ru') ??
        p.i18n[0];

      const images = p.images.map((img) => img.url);

      return {
        id: p.id,
        slug: p.slug,
        title: t?.title || p.slug,
        description: t?.description || undefined,
        price: p.price != null ? Number(p.price as unknown as number) : 0,
        category: p.category
          ? {
              slug: p.category.slug,
              name: resolveCategoryName({
                locale,
                fallback: p.category.name ?? p.category.slug,
                i18n: p.category.i18n,
              }),
            }
          : undefined,
        images,
        image: images[0] || undefined,
      };
    });

    return NextResponse.json(
      {
        category: {
          id: category.id,
          slug: category.slug,
          name: categoryName,
          image: category.image,
        },
        products,
      },
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
          'Cache-Control': 's-maxage=60, stale-while-revalidate=600',
        },
      }
    );
  } catch (error) {
    console.error('[api/categories/[slug]][GET] error', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
          'Cache-Control': 's-maxage=60, stale-while-revalidate=600',
        },
      }
    );
  }
}
