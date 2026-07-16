import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';
import { authOptions } from '@/lib/authOptions';
import { serializeJSON } from '@/lib/json';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

type OrderRequest = {
  items?: Array<{ productId?: unknown; quantity?: unknown }>;
  customerName?: unknown;
  email?: unknown;
  phone?: unknown;
  address?: unknown;
  notes?: unknown;
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_ITEMS = 50;

function asTrimmedString(value: unknown, maxLength: number): string | null {
  if (typeof value !== 'string') return null;
  const normalized = value.trim();
  return normalized && normalized.length <= maxLength ? normalized : null;
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  const idempotencyKey = request.headers.get('idempotency-key')?.trim();
  if (!idempotencyKey || idempotencyKey.length > 64) {
    return NextResponse.json({ success: false, message: 'Invalid idempotency key' }, { status: 400 });
  }

  try {
    const existing = await prisma.order.findUnique({ where: { idempotencyKey } });
    if (existing) {
      if (existing.userId !== session.user.id) {
        return NextResponse.json({ success: false, message: 'Invalid idempotency key' }, { status: 409 });
      }
      return NextResponse.json(serializeJSON({ success: true, data: { id: existing.id, total: existing.total } }));
    }

    let body: OrderRequest;
    try {
      body = await request.json() as OrderRequest;
    } catch {
      return NextResponse.json({ success: false, message: 'Invalid request body' }, { status: 400 });
    }
    const customerName = asTrimmedString(body.customerName, 191);
    const email = asTrimmedString(body.email, 191)?.toLowerCase();
    const phone = typeof body.phone === 'string' ? body.phone.trim().slice(0, 50) || null : null;
    const address = typeof body.address === 'string' ? body.address.trim().slice(0, 191) || null : null;
    const notes = typeof body.notes === 'string' ? body.notes.trim().slice(0, 191) || null : null;

    if (!customerName || !email || !EMAIL_RE.test(email)) {
      return NextResponse.json({ success: false, message: 'Valid name and email are required' }, { status: 400 });
    }

    if (!Array.isArray(body.items) || body.items.length === 0 || body.items.length > MAX_ITEMS) {
      return NextResponse.json({ success: false, message: 'Cart must contain between 1 and 50 items' }, { status: 400 });
    }

    const quantities = new Map<string, number>();
    for (const item of body.items) {
      const productId = typeof item.productId === 'string' ? item.productId : '';
      const quantity = Number(item.quantity);
      if (!productId || !Number.isInteger(quantity) || quantity < 1 || quantity > 99) {
        return NextResponse.json({ success: false, message: 'Invalid cart item' }, { status: 400 });
      }
      quantities.set(productId, (quantities.get(productId) ?? 0) + quantity);
    }

    const productIds = [...quantities.keys()];
    const products = await prisma.product.findMany({
      where: { id: { in: productIds }, isActive: true },
      include: {
        i18n: { where: { locale: 'ru' }, select: { title: true } },
        images: { orderBy: { order: 'asc' }, take: 1, select: { url: true } },
      },
    });

    if (products.length !== productIds.length || products.some((product) => product.price == null)) {
      return NextResponse.json({ success: false, message: 'One or more products are unavailable' }, { status: 409 });
    }

    const orderItems = products.map((product) => {
      const quantity = quantities.get(product.id)!;
      if (product.stock > 0 && quantity > product.stock) {
        throw new Error(`Insufficient stock for ${product.id}`);
      }
      return {
        productId: product.id,
        productName: product.i18n[0]?.title || product.slug,
        price: product.price!,
        quantity,
        image: product.images[0]?.url || null,
      };
    });
    const total = orderItems.reduce((sum, item) => sum + Number(item.price) * item.quantity, 0);

    const order = await prisma.order.create({
      data: {
        idempotencyKey,
        userId: session.user.id,
        customerName,
        email,
        phone,
        address,
        notes,
        total,
        items: { create: orderItems },
      },
    });

    return NextResponse.json(serializeJSON({ success: true, data: { id: order.id, total: order.total } }), { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message.startsWith('Insufficient stock')) {
      return NextResponse.json({ success: false, message: 'Requested quantity is unavailable' }, { status: 409 });
    }

    if (typeof error === 'object' && error && 'code' in error && error.code === 'P2002') {
      const existing = await prisma.order.findUnique({ where: { idempotencyKey } });
      if (existing?.userId === session.user.id) {
        return NextResponse.json(serializeJSON({ success: true, data: { id: existing.id, total: existing.total } }));
      }
    }

    console.error('[orders][POST] failed', error);
    return NextResponse.json({ success: false, message: 'Failed to create order' }, { status: 500 });
  }
}
