import { prisma } from '@/lib/prisma';
import type { Product } from '@/types/product';

export type Locale = 'ru' | 'en' | 'uz';

function normLocale(raw?: string | null): Locale {
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

export async function getProductsByCategorySlug(categorySlug: string, locale: Locale): Promise<Product[]> {
  const category = await prisma.category.findUnique({
    where: { slug: categorySlug },
    include: {
      products: {
        where: { isActive: true },
        include: { i18n: true, category: true },
        orderBy: { createdAt: 'desc' },
      },
    },
  });

  if (!category) return [];

  const products: Product[] = category.products.map((p) => {
    const images = parseImages(p.images);
    // Prisma Decimal -> number
    const price = p.price != null ? Number(p.price as unknown as number) : undefined;
    return {
      id: p.id,
      slug: p.slug,
      title: undefined, // will be resolved on client via i18n array
      image: images[0],
      images,
      description: undefined,
      price,
      category: p.category ? { slug: p.category.slug, name: p.category.name ?? p.category.slug } : undefined,
      i18n: p.i18n?.map((t) => ({ id: t.id, title: t.title, description: t.description ?? undefined, summary: t.summary ?? undefined, locale: normLocale(t.locale) })),
      specs: (p as any).specs ?? undefined,
    };
  });

  return products;
}

export { normLocale };
