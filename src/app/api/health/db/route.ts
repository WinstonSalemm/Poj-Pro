import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const revalidate = 0;

export async function GET() {
  try {
    // Test the database connection with a simple query
    await prisma.$queryRaw`SELECT 1 as ok`;
    
    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (error: unknown) {
    console.error('Database health check failed:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const statusCode = errorMessage.toLowerCase().includes('prisma') ? 500 : 400;
    
    return NextResponse.json({ 
      status: 'error',
      details: process.env.NODE_ENV === 'development' ? errorMessage : undefined
    }, { status: statusCode });
  }
}
