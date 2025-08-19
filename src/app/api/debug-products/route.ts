import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const products = await prisma.product.findMany({
      select: {
        id: true,
        name: true,
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

    return NextResponse.json({ products });
  } catch (error) {
    console.error('Debug error:', error);
    return NextResponse.json(
      { error: 'Debug error' },
      { status: 500 }
    );
  }
}
