import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { serializeJSON } from '@/lib/json';

export const revalidate = 60;
export const dynamic = 'force-static';

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

    return NextResponse.json(
      serializeJSON(categories),
      { status: 200, headers: { 'Cache-Control': 's-maxage=60, stale-while-revalidate=600' } }
    );
  } catch (error) {
    console.error('[api/categories][GET] error', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
