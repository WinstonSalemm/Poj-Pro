import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const revalidate = 0;

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await prisma.user.update({
      where: { id: session.user.id },
      data: { lastActive: new Date() },
    });

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (error: unknown) {
    console.error('Error updating user lastActive:', error);
    
    let status = 500;
    let message = 'Internal Server Error';
    
    if (error && typeof error === 'object' && 'code' in error && error.code === 'P2025') {
      status = 404;
      message = 'User not found';
    }
    
    return NextResponse.json({ error: message }, { status });
  }
}
