import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { serializeJSON } from '@/lib/json';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      orderBy: [
        { name: 'asc' },   // если name есть
        { slug: 'asc' },   // подстраховка, если name = null
      ],
      select: {
        id: true,
        slug: true,
        name: true,
      },
    });

    return NextResponse.json(serializeJSON(categories), { status: 200 });
  } catch (error) {
    console.error('[api/categories][GET] error', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
