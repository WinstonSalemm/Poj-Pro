import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { serializeJSON } from '@/lib/json';
import { requireAdmin } from '@/lib/requireAdmin';

// This route uses NextAuth which relies on headers and cookies.
// Force dynamic to avoid static rendering during build.
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const revalidate = 0;

export async function GET() {
  try {
    const authError = await requireAdmin();
    if (authError) return authError;

    // Get all users with their orders
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        isAdmin: true,
        personalPromoCode: true,
        lastActive: true,
        createdAt: true,
        _count: {
          select: { 
            orders: true,
            promoCodeUses: true
          }
        },
        orders: {
          select: {
            id: true,
            total: true,
            status: true,
            createdAt: true,
            _count: {
              select: { items: true }
            }
          },
          orderBy: {
            createdAt: 'desc'
          },
          take: 3 // Show only the 3 most recent orders
        }
      },
      orderBy: [
        { isAdmin: 'desc' },
        { createdAt: 'desc' }
      ]
    });

    return NextResponse.json(serializeJSON(users), { status: 200 });
  } catch (error) {
    console.error('Error fetching users:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json(
      { 
        error: 'An error occurred while fetching users',
        details: process.env.NODE_ENV === 'development' ? errorMessage : undefined
      },
      { status: 500 }
    );
  }
}
