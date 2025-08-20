import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const revalidate = 0;

export async function GET() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return NextResponse.json({ db: 'ok' });
  } catch (e: unknown) {
    const err = e as { name?: string; code?: string; message?: string };
    console.error('[health/db] FAIL', { name: err?.name, code: err?.code, message: err?.message });
    return NextResponse.json({ db: 'fail' }, { status: 500 });
  }
}
