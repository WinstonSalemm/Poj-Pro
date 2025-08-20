import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const revalidate = 0;

export interface UsersMetrics {
  online: number;
  total: number;
  refreshedAt: string;
}

export async function GET() {
  try {
    const now = new Date();
    const fiveMinAgo = new Date(now.getTime() - 5 * 60 * 1000);

    const [online, total] = await Promise.all([
      prisma.user.count({ 
        where: { 
          lastActive: { 
            gt: fiveMinAgo 
          } 
        } 
      }),
      prisma.user.count()
    ]);

    const response: UsersMetrics = {
      online,
      total,
      refreshedAt: now.toISOString()
    };

    const headers = new Headers();
    headers.set('Content-Type', 'application/json');
    headers.set('Cache-Control', 'no-store');

    return new NextResponse(JSON.stringify(response), {
      status: 200,
      headers
    });
  } catch (error) {
    console.error('Error fetching user metrics:', error);
    return new NextResponse(
      JSON.stringify({ error: 'Internal Server Error' }),
      { 
        status: 500, 
        headers: { 
          'Content-Type': 'application/json',
          'Cache-Control': 'no-store'
        } 
      }
    );
  }
}
