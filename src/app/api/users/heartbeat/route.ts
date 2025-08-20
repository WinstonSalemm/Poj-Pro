import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const revalidate = 0;

export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json();
    
    if (!userId || typeof userId !== 'string') {
      return NextResponse.json({ error: 'Valid user ID is required' }, { status: 400 });
    }

    // Use $executeRaw to update the timestamp directly
    await prisma.$executeRaw`
      UPDATE "User" 
      SET "lastActive" = NOW()
      WHERE id = ${userId}
    `;

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
