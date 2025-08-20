import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    const products = await prisma.product.findMany({
      select: {
        id: true,
        slug: true,
        i18n: {
          select: {
            title: true,
            locale: true
          },
          take: 1
        }
      },
      take: 10, // Get first 10 products for debugging
      orderBy: {
        id: 'asc'
      }
    });

    return NextResponse.json({ products }, { status: 200 });
  } catch (error) {
    console.error('[api/debug-products][GET] error', error);
    return NextResponse.json(
      { error: 'Debug error' },
      { status: 500 }
    );
  }
}
