import { NextResponse } from 'next/server';
import { loadCertificates } from '@/lib/certificates';

export const runtime = 'nodejs';
export const dynamic = 'force-static';
export const revalidate = 60;

const jsonHeaders = {
  'Content-Type': 'application/json; charset=utf-8',
  'Cache-Control': 's-maxage=60, stale-while-revalidate=600',
};

export async function GET() {
  try {
    const certificates = await loadCertificates();
    return NextResponse.json({ certificates }, { headers: jsonHeaders });
  } catch (e) {
    console.error('[api/certificates] FAIL', e);
    // fail-open: always JSON
    return NextResponse.json({ certificates: [], error: 'internal' }, { headers: jsonHeaders });
  }
}
