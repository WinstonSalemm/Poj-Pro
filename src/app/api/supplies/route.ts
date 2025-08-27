import { NextResponse } from 'next/server';
import { loadSupplies } from '@/lib/supplies';

export const dynamic = 'force-static';
export const revalidate = 60;

export async function GET() {
  try {
    const items = await loadSupplies();
    return NextResponse.json(
      { supplies: items },
      {
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
          'Cache-Control': 's-maxage=60, stale-while-revalidate=600',
        },
      }
    );
  } catch {
    return NextResponse.json({ supplies: [], error: 'internal' });
  }
}
