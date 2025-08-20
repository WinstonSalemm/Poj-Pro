import { NextResponse } from 'next/server';

export const dynamic = 'force-static';
export const runtime = 'nodejs';

export async function GET() {
  return NextResponse.json({ ok: true, ts: Date.now() });
}
