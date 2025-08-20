import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    const products = await prisma.product.findMany({
      include: {
        i18n: true,
        category: true
      },
      orderBy: {
        id: 'asc'
      }
    });

    // Format the response to be more readable
    const formattedProducts = products.map(product => ({
      id: product.id,
      slug: product.slug,
      name: product.i18n?.[0]?.title || 'No name',
      category: product.category ? {
        id: product.category.id,
        name: product.category.name,
        slug: product.category.slug
      } : 'No category',
      price: product.price,
      isActive: product.isActive,
      images: product.images ? JSON.parse(product.images) : []
    }));

    return NextResponse.json({ products: formattedProducts }, { status: 200 });
  } catch (error) {
    console.error('[api/debug/products][GET] error', error);
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    );
  }
}
