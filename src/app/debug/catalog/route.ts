import { NextResponse } from 'next/server';
import { getAllCategories } from '@/lib/api/categories';

export const revalidate = 0;

export async function GET() {
  try {
    const categories = await getAllCategories();
    const count = Array.isArray(categories) ? categories.length : 0;
    const sample = Array.isArray(categories) ? categories.slice(0, 3) : [];
    return NextResponse.json({ ok: true, count, sample });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: String(e?.message || e) }, { status: 500 });
  }
}
