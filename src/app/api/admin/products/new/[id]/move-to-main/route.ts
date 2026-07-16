import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/requireAdmin';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// POST /api/admin/products/new/[id]/move-to-main - Перевести товар в основную массу
export async function POST(req: NextRequest) {
  try {
    const authError = await requireAdmin();
    if (authError) return authError;

    const { pathname } = new URL(req.url);
    const segments = pathname.split('/');
    const id = segments[segments.indexOf('new') + 1] || '';

    if (!id) {
      return NextResponse.json({ success: false, message: 'Product ID is required' }, { status: 400 });
    }

    // Устанавливаем дату создания на 15 дней назад, чтобы товар больше не считался новым (новые = за последние 14 дней)
    const oldDate = new Date();
    oldDate.setDate(oldDate.getDate() - 15);

    await prisma.product.update({
      where: { id },
      data: {
        createdAt: oldDate,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Товар переведён в основную массу',
    });
  } catch (error) {
    console.error('[admin/products/new/[id]/move-to-main][POST] error', error);
    return NextResponse.json(
      { success: false, message: 'Failed to move product', error: String(error) },
      { status: 500 }
    );
  }
}
