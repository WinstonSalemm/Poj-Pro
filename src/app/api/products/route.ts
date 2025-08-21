import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';
export const dynamic = 'force-static';
export const revalidate = 60;

const jsonHeaders = {
  'Content-Type': 'application/json; charset=utf-8',
  'Cache-Control': 's-maxage=60, stale-while-revalidate=600',
};

function normalize(raw: string | null): 'ru'|'en'|'uz' {
  const v = (raw ?? 'ru').toLowerCase();
  // Avoid `any`: explicitly narrow to the literal union
  if (v === 'ru' || v === 'en' || v === 'uz') return v;
  if (v.startsWith('en')) return 'en';
  if (v.startsWith('uz')) return 'uz';
  return 'ru';
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const locale = normalize(searchParams.get('locale'));
  const t0 = Date.now();

  try {
    const products = await prisma.product.findMany({
      where: {
        isActive: true,
        i18n: { some: { locale } },   // <-- фильтр по локали уходит в ProductI18n
      },
      orderBy: { id: 'asc' },
      take: 500,
      include: {
        i18n: {
          where: { locale },
          select: { title: true, summary: true, description: true },
        },
        category: { select: { id: true, slug: true, name: true } },
        certificates: {
          include: { certificate: { select: { id: true, title: true, href: true } } },
        },
      },
    });

    // Расплющим локализованные поля (берём первую запись для выбранной локали)
    const hydrated = products.map(p => {
      const t = p.i18n[0] ?? null;
      return {
        id: p.id,
        slug: p.slug,
        brand: p.brand,
        price: p.price,
        stock: p.stock,
        currency: p.currency,
        images: p.images,
        specs: p.specs,
        isActive: p.isActive,
        category: p.category,
        certificates: p.certificates.map(pc => pc.certificate),
        title: t?.title ?? null,
        summary: t?.summary ?? null,
        description: t?.description ?? null,
        createdAt: p.createdAt,
        updatedAt: p.updatedAt,
      };
    });

    return NextResponse.json({ success: true, data: { products: hydrated } }, { headers: jsonHeaders });
  } catch (e: unknown) {
    // Safely narrow the error without using `any`
    let name: string | undefined;
    let code: string | number | undefined;
    let message: string | undefined;
    if (e instanceof Error) {
      name = e.name;
      message = e.message;
    }
    if (typeof e === 'object' && e !== null && 'code' in e) {
      const maybe = (e as { code?: unknown }).code;
      if (typeof maybe === 'string' || typeof maybe === 'number') code = maybe;
    }
    console.error('[api/products] FAIL', {
      name, code, message, took_ms: Date.now() - t0,
    }, e);
    // fail-open: чтобы UI не падал (единый формат ответа)
    return NextResponse.json({ success: false, data: { products: [] }, error: 'db_or_query_error' }, { headers: jsonHeaders });
  }
}

