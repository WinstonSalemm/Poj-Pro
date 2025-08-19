import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET() {
  try {
    // Test the database connection with a simple query
    await prisma.$queryRaw`SELECT 1 as ok`;
    
    const headers = new Headers();
    headers.set('Content-Type', 'application/json');
    headers.set('Cache-Control', 'no-store');
    
    return new NextResponse(
      JSON.stringify({ ok: true }),
      { 
        status: 200,
        headers
      }
    );
  } catch (error: unknown) {
    console.error('Database health check failed:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const statusCode = errorMessage.toLowerCase().includes('prisma') ? 500 : 400;
    
    return new NextResponse(
      JSON.stringify({ 
        status: 'error',
        details: process.env.NODE_ENV === 'development' ? errorMessage : undefined
      }),
      { 
        status: statusCode,
        headers: { 
          'Content-Type': 'application/json',
          'Cache-Control': 'no-store'
        }
      }
    );
  }
}
