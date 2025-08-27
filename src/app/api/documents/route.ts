import { NextResponse } from 'next/server';
import { loadDocuments } from '@/lib/documents';

export const dynamic = 'force-static';
export const revalidate = 60; // 1 минута

export async function GET() {
  try {
    const docs = await loadDocuments();
    return NextResponse.json({ documents: docs }, {
      headers: {
        'Content-Type':'application/json; charset=utf-8',
        'Cache-Control':'s-maxage=60, stale-while-revalidate=600'
      }
    });
  } catch {
    return NextResponse.json({ documents: [], error:'internal' });
  }
}
