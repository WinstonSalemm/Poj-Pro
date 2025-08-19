import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(request: Request) {
  try {
    const { userId } = await request.json();
    
    if (!userId || typeof userId !== 'string') {
      return new NextResponse(
        JSON.stringify({ error: 'Valid user ID is required' }),
        { 
          status: 400, 
          headers: { 
            'Content-Type': 'application/json',
            'Cache-Control': 'no-store'
          } 
        }
      );
    }

    // Use $executeRaw to update the timestamp directly
    await prisma.$executeRaw`
      UPDATE "User" 
      SET "lastActive" = NOW()
      WHERE id = ${userId}
    `;

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
    console.error('Error updating user lastActive:', error);
    
    let status = 500;
    let message = 'Internal Server Error';
    
    if (error && typeof error === 'object' && 'code' in error && error.code === 'P2025') {
      status = 404;
      message = 'User not found';
    }
    
    return new NextResponse(
      JSON.stringify({ error: message }),
      { 
        status,
        headers: { 
          'Content-Type': 'application/json',
          'Cache-Control': 'no-store'
        } 
      }
    );
  }
}
