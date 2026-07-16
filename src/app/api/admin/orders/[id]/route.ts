import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { serializeJSON } from '@/lib/json';
import { requireAdmin } from '@/lib/requireAdmin';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(req: NextRequest) {
  try {
    const authError = await requireAdmin();
    if (authError) return authError;

    const { pathname } = new URL(req.url);
    const segments = pathname.split('/');
    const orderId = segments[segments.indexOf('orders') + 1] || '';

    // Get order with user and items
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        items: true,
      },
    });

    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(serializeJSON(order), { status: 200 });
  } catch (error) {
    console.error('[api/admin/orders/[id]][GET] error', error);
    return NextResponse.json(
      { error: 'Failed to fetch order' },
      { status: 500 }
    );
  }
}
